from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError

from .models import Hotel, Room, Booking
from .serializers import (
    HotelSerializer,
    RoomSerializer,
    BookingSerializer,
)


# =========================================================
# HOTEL API
# =========================================================

class HotelListCreateView(generics.ListCreateAPIView):

    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


# =========================================================
# FEATURED HOTELS API
# =========================================================

class FeaturedHotelListView(generics.ListAPIView):

    serializer_class = HotelSerializer

    def get_queryset(self):

        return (
            Hotel.objects
            .filter(
                is_active=True,
                is_featured=True,
            )
            .order_by("price_from")
        )


class HotelDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


# =========================================================
# HOTEL SEARCH
# =========================================================

class HotelSearchView(generics.ListAPIView):

    serializer_class = HotelSerializer

    def get_queryset(self):

        request = self.request

        # -------------------------------------------------
        # Get search parameters
        # -------------------------------------------------

        location = request.query_params.get(
            "location",
            ""
        ).strip()

        check_in = request.query_params.get("check_in")
        check_out = request.query_params.get("check_out")

        adults = request.query_params.get(
            "adults",
            "2"
        )

        children = request.query_params.get(
            "children",
            "0"
        )

        rooms_requested = request.query_params.get(
            "rooms",
            "1"
        )

        # -------------------------------------------------
        # Validate numeric parameters
        # -------------------------------------------------

        try:

            adults = int(adults)
            children = int(children)
            rooms_requested = int(rooms_requested)

        except (TypeError, ValueError):

            return Hotel.objects.none()

        # -------------------------------------------------
        # Calculate total guests
        # -------------------------------------------------

        total_guests = adults + children

        # -------------------------------------------------
        # Basic validation
        # -------------------------------------------------

        if not location:
            return Hotel.objects.none()

        if not check_in or not check_out:
            return Hotel.objects.none()

        if adults < 1:
            return Hotel.objects.none()

        if children < 0:
            return Hotel.objects.none()

        if rooms_requested < 1:
            return Hotel.objects.none()

        if total_guests < 1:
            return Hotel.objects.none()

        # -------------------------------------------------
        # Parse dates
        # -------------------------------------------------

        try:

            check_in_date = timezone.datetime.strptime(
                check_in,
                "%Y-%m-%d"
            ).date()

            check_out_date = timezone.datetime.strptime(
                check_out,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Hotel.objects.none()

        # -------------------------------------------------
        # Check date validity
        # -------------------------------------------------

        today = timezone.localdate()

        if check_in_date < today:
            return Hotel.objects.none()

        if check_out_date <= check_in_date:
            return Hotel.objects.none()

        # -------------------------------------------------
        # Find active hotels matching location
        # -------------------------------------------------

        hotels = (
            Hotel.objects
            .filter(
                is_active=True
            )
            .filter(
                Q(name__icontains=location)
                | Q(city__icontains=location)
                | Q(address__icontains=location)
            )
            .distinct()
        )

        # -------------------------------------------------
        # Find hotels with enough available rooms
        # -------------------------------------------------

        available_hotel_ids = []

        for hotel in hotels:

            # -------------------------------------------------
            # Find suitable active rooms
            # -------------------------------------------------

            rooms = Room.objects.filter(
                hotel=hotel,
                is_active=True,
                is_available=True,
                max_guests__gte=total_guests,
            )

            available_rooms_count = 0

            for room in rooms:

                # -------------------------------------------------
                # Check overlapping active bookings
                # -------------------------------------------------

                overlapping_booking_exists = (
                    Booking.objects.filter(
                        room=room,
                        status__in=[
                            "pending",
                            "confirmed",
                        ],
                        check_in__lt=check_out_date,
                        check_out__gt=check_in_date,
                    ).exists()
                )

                if not overlapping_booking_exists:
                    available_rooms_count += 1

                # -------------------------------------------------
                # Enough rooms found
                # -------------------------------------------------

                if available_rooms_count >= rooms_requested:
                    break

            # -------------------------------------------------
            # Hotel has enough available rooms
            # -------------------------------------------------

            if available_rooms_count >= rooms_requested:
                available_hotel_ids.append(hotel.id)

        # -------------------------------------------------
        # Return available hotels
        # -------------------------------------------------

        return (
            Hotel.objects
            .filter(
                id__in=available_hotel_ids,
                is_active=True,
            )
            .order_by("price_from")
        )


# =========================================================
# HOTEL ROOM API
# =========================================================

class RoomListCreateView(generics.ListCreateAPIView):

    serializer_class = RoomSerializer

    def get_queryset(self):

        queryset = (
            Room.objects
            .select_related("hotel")
            .filter(
                is_active=True
            )
        )

        # -------------------------------------------------
        # Filter rooms by hotel when hotel ID is provided.
        #
        # Example:
        #
        # /api/rooms/?hotel=2
        #
        # This will return ONLY rooms belonging to Hotel 2.
        # -------------------------------------------------

        hotel_id = self.request.query_params.get("hotel")

        if hotel_id:

            try:

                hotel_id = int(hotel_id)

            except (TypeError, ValueError):

                return Room.objects.none()

            queryset = queryset.filter(
                hotel_id=hotel_id
            )

        return queryset


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = (
        Room.objects
        .select_related("hotel")
    )

    serializer_class = RoomSerializer


# =========================================================
# BOOKING API
# =========================================================

class BookingListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        # -------------------------------------------------
        # Get current user's bookings
        #
        # select_related loads:
        #
        # Booking
        #    └── Room
        #          └── Hotel
        # -------------------------------------------------

        bookings = (
            Booking.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "room",
                "room__hotel",
            )
            .order_by("-created_at")
        )

        # -------------------------------------------------
        # Automatically mark past confirmed bookings
        # as completed.
        # -------------------------------------------------

        today = timezone.localdate()

        for booking in bookings:

            if (
                booking.status == "confirmed"
                and booking.check_out < today
            ):

                booking.status = "completed"

                booking.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

        return bookings


    # =====================================================
    # TRANSACTION-SAFE BOOKING CREATION
    # =====================================================

    def perform_create(self, serializer):

        # -------------------------------------------------
        # Get the room selected by the user.
        # -------------------------------------------------

        room = serializer.validated_data["room"]

        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]

        # -------------------------------------------------
        # Start database transaction.
        # -------------------------------------------------

        with transaction.atomic():

            # -------------------------------------------------
            # Lock this room row.
            # -------------------------------------------------

            locked_room = (
                Room.objects
                .select_for_update()
                .select_related("hotel")
                .get(
                    id=room.id
                )
            )

            # -------------------------------------------------
            # Final room availability check.
            # -------------------------------------------------

            if not locked_room.is_active:

                raise ValidationError({
                    "room":
                        "This room is currently inactive."
                })

            if not locked_room.is_available:

                raise ValidationError({
                    "room":
                        "This room is currently unavailable."
                })

            # -------------------------------------------------
            # Check hotel status.
            # -------------------------------------------------

            if not locked_room.hotel.is_active:

                raise ValidationError({
                    "room":
                        "This hotel is currently unavailable."
                })

            # -------------------------------------------------
            # Final overlap check.
            # -------------------------------------------------

            overlapping_booking_exists = (
                Booking.objects.filter(
                    room=locked_room,
                    status__in=[
                        "pending",
                        "confirmed",
                    ],
                    check_in__lt=check_out,
                    check_out__gt=check_in,
                ).exists()
            )

            if overlapping_booking_exists:

                raise ValidationError({
                    "room":
                        "This room has just been booked for "
                        "the selected dates. Please choose "
                        "another room or different dates."
                })

            # -------------------------------------------------
            # Create the booking using the locked room.
            # -------------------------------------------------

            serializer.save(
                room=locked_room
            )


# =========================================================
# BOOKING DETAIL API
# =========================================================

class BookingDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Booking.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "room",
                "room__hotel",
            )
        )


# =========================================================
# BOOKING CANCEL
# =========================================================

class BookingCancelView(
    generics.UpdateAPIView
):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Booking.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "room",
                "room__hotel",
            )
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        booking = self.get_object()

        # -------------------------------------------------
        # Already cancelled
        # -------------------------------------------------

        if booking.status == "cancelled":

            return Response(
                {
                    "detail":
                        "Booking is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Completed booking
        # -------------------------------------------------

        if booking.status == "completed":

            return Response(
                {
                    "detail":
                        "Completed bookings cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Check whether booking has already ended
        # -------------------------------------------------

        today = timezone.localdate()

        if booking.check_out < today:

            if booking.status != "completed":

                booking.status = "completed"

                booking.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

            return Response(
                {
                    "detail":
                        "This booking has already been "
                        "completed and cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Cancel booking
        # -------------------------------------------------

        booking.status = "cancelled"

        booking.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # -------------------------------------------------
        # Return updated booking
        # -------------------------------------------------

        serializer = self.get_serializer(booking)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    