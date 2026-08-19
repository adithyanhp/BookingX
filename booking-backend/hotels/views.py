from django.utils import timezone
from django.db.models import Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status

from .models import Hotel, Room, Booking
from .serializers import HotelSerializer, RoomSerializer, BookingSerializer


# =========================================================
# HOTEL API
# =========================================================

class HotelListCreateView(generics.ListCreateAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


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

        location = request.query_params.get("location", "").strip()

        check_in = request.query_params.get("check_in")
        check_out = request.query_params.get("check_out")

        adults = request.query_params.get("adults", "2")
        children = request.query_params.get("children", "0")
        guests = request.query_params.get("guests")
        rooms_requested = request.query_params.get("rooms", "1")

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

        # If frontend sends guests, use it only when valid.
        # The actual value should still match adults + children.
        if guests:
            try:
                guests = int(guests)

                if guests != total_guests:
                    total_guests = adults + children

            except (TypeError, ValueError):
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

        if check_in_date < timezone.localdate():
            return Hotel.objects.none()

        if check_out_date <= check_in_date:
            return Hotel.objects.none()

        # -------------------------------------------------
        # Find active hotels matching location
        # -------------------------------------------------

        hotels = Hotel.objects.filter(
            is_active=True
        ).filter(
            Q(name__icontains=location)
            | Q(city__icontains=location)
            | Q(address__icontains=location)
        ).distinct()

        # -------------------------------------------------
        # Find hotels with enough available rooms
        # -------------------------------------------------

        available_hotel_ids = []

        for hotel in hotels:

            # ---------------------------------------------
            # Find suitable rooms
            # ---------------------------------------------

            rooms = Room.objects.filter(
                hotel=hotel,
                is_active=True,
                is_available=True,
                max_guests__gte=total_guests
            )

            available_rooms_count = 0

            for room in rooms:

                # -----------------------------------------
                # Check whether this room is already booked
                # -----------------------------------------

                overlapping_booking_exists = Booking.objects.filter(
                    room=room,
                    status__in=[
                        "pending",
                        "confirmed"
                    ],
                    check_in__lt=check_out_date,
                    check_out__gt=check_in_date
                ).exists()

                # -----------------------------------------
                # Room is available if no overlapping
                # booking exists
                # -----------------------------------------

                if not overlapping_booking_exists:
                    available_rooms_count += 1

                # -----------------------------------------
                # Stop once we have enough rooms
                # -----------------------------------------

                if available_rooms_count >= rooms_requested:
                    break

            # ---------------------------------------------
            # Hotel has enough rooms
            # ---------------------------------------------

            if available_rooms_count >= rooms_requested:
                available_hotel_ids.append(hotel.id)

        # -------------------------------------------------
        # Return only available hotels
        # -------------------------------------------------

        return Hotel.objects.filter(
            id__in=available_hotel_ids
        ).order_by(
            "price_from"
        )


# =========================================================
# HOTEL ROOM API
# =========================================================

class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


# =========================================================
# BOOKING API
# =========================================================

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        bookings = Booking.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

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
                        "updated_at"
                    ]
                )

        return bookings


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )


# =========================================================
# BOOKING CANCEL
# =========================================================

class BookingCancelView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )

    def update(self, request, *args, **kwargs):
        booking = self.get_object()

        if booking.status == "cancelled":
            return Response(
                {
                    "detail": "Booking is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status == "completed":
            return Response(
                {
                    "detail": "Completed bookings cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = "cancelled"

        booking.save()

        serializer = self.get_serializer(booking)

        return Response(serializer.data)

    