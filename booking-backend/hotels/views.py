from datetime import datetime
from math import radians, sin, cos, sqrt, atan2

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


# =========================================================
# HOTEL DETAIL API
# =========================================================

class HotelDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


# =========================================================
# LIVE HOTEL LOCATION SEARCH / AUTOCOMPLETE
# =========================================================
#
# GET:
# /api/hotels/locations/?q=koch
#
# NOTE:
# This endpoint is kept for compatibility with the existing
# BookingX backend.
#
# The frontend Geoapify autocomplete is now used for
# location discovery.
# =========================================================

class HotelLocationSearchView(
    generics.ListAPIView
):

    def get(self, request, *args, **kwargs):

        query = request.query_params.get(
            "q",
            ""
        ).strip()

        # -------------------------------------------------
        # Don't return suggestions for very short queries.
        # -------------------------------------------------

        if len(query) < 2:

            return Response(
                [],
                status=status.HTTP_200_OK
            )

        # -------------------------------------------------
        # Find matching hotels.
        # -------------------------------------------------

        hotels = (
            Hotel.objects
            .filter(
                is_active=True
            )
            .filter(
                Q(name__icontains=query)
                | Q(city__icontains=query)
                | Q(address__icontains=query)
                | Q(state__icontains=query)
                | Q(country__icontains=query)
            )
            .values(
                "city",
                "state",
                "country",
            )
            .distinct()
            .order_by(
                "city"
            )[:10]
        )

        # -------------------------------------------------
        # Build unique location suggestions.
        # -------------------------------------------------

        suggestions = []

        seen = set()

        for hotel in hotels:

            city = hotel["city"]
            state = hotel["state"]
            country = hotel["country"]

            key = (
                city,
                state,
                country,
            )

            if key in seen:
                continue

            seen.add(key)

            suggestions.append({
                "city": city,
                "state": state,
                "country": country,
                "label": ", ".join(
                    value
                    for value in [
                        city,
                        state,
                        country,
                    ]
                    if value
                ),
            })

        return Response(
            suggestions,
            status=status.HTTP_200_OK
        )


# =========================================================
# DISTANCE HELPER
# =========================================================
#
# Calculates the distance between two GPS coordinates
# using the Haversine formula.
#
# Result is returned in kilometres.
# =========================================================

def calculate_distance(
    latitude1,
    longitude1,
    latitude2,
    longitude2
):

    earth_radius_km = 6371.0

    lat1 = radians(float(latitude1))
    lon1 = radians(float(longitude1))

    lat2 = radians(float(latitude2))
    lon2 = radians(float(longitude2))

    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = (
        sin(delta_lat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius_km * c


# =========================================================
# HOTEL SEARCH
# =========================================================
#
# Supports:
#
# 1. Normal text search
#
#    location=Kochi
#
# 2. Geoapify coordinate search
#
#    location=Kochi
#    latitude=9.9312
#    longitude=76.2673
#
# Geoapify is responsible only for discovering the
# location.
#
# BookingX remains responsible for:
#
# - Hotels
# - Rooms
# - Availability
# - Guest capacity
# - Booking conflicts
#
# Coordinate search:
#
# - Searches within 25 km by default.
# - Orders hotels by distance.
#
# Fallback:
#
# If coordinate search cannot find matching hotels,
# BookingX falls back to the existing text search.
# =========================================================

class HotelSearchView(
    generics.ListAPIView
):

    serializer_class = HotelSerializer

    DEFAULT_RADIUS_KM = 25

    def get_queryset(self):

        request = self.request

        # =================================================
        # GET SEARCH PARAMETERS
        # =================================================

        location = request.query_params.get(
            "location",
            ""
        ).strip()

        check_in = request.query_params.get(
            "check_in"
        )

        check_out = request.query_params.get(
            "check_out"
        )

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
        # GEOAPIFY COORDINATES
        # -------------------------------------------------

        latitude = request.query_params.get(
            "latitude"
        )

        longitude = request.query_params.get(
            "longitude"
        )

        radius = request.query_params.get(
            "radius",
            str(self.DEFAULT_RADIUS_KM)
        )

        # =================================================
        # VALIDATE NUMERIC PARAMETERS
        # =================================================

        try:

            adults = int(adults)
            children = int(children)
            rooms_requested = int(
                rooms_requested
            )

        except (
            TypeError,
            ValueError
        ):

            return Hotel.objects.none()

        # =================================================
        # TOTAL GUESTS
        # =================================================

        total_guests = (
            adults + children
        )

        # =================================================
        # BASIC VALIDATION
        # =================================================

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

        # =================================================
        # PARSE DATES
        # =================================================

        try:

            check_in_date = datetime.strptime(
                check_in,
                "%Y-%m-%d"
            ).date()

            check_out_date = datetime.strptime(
                check_out,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Hotel.objects.none()

        # =================================================
        # DATE VALIDATION
        # =================================================

        today = timezone.localdate()

        if check_in_date < today:
            return Hotel.objects.none()

        if check_out_date <= check_in_date:
            return Hotel.objects.none()

        # =================================================
        # FIND ACTIVE HOTELS
        # =================================================

        active_hotels = (
            Hotel.objects
            .filter(
                is_active=True
            )
        )

        # =================================================
        # DETERMINE WHETHER COORDINATES ARE AVAILABLE
        # =================================================

        using_coordinates = (
            latitude is not None
            and longitude is not None
            and latitude != ""
            and longitude != ""
        )

        coordinate_hotels = []

        # =================================================
        # GEOAPIFY COORDINATE SEARCH
        # =================================================

        if using_coordinates:

            try:

                user_latitude = float(
                    latitude
                )

                user_longitude = float(
                    longitude
                )

                search_radius_km = float(
                    radius
                )

            except (
                TypeError,
                ValueError
            ):

                using_coordinates = False

            else:

                # -------------------------------------------------
                # Validate latitude
                # -------------------------------------------------

                if not (
                    -90 <= user_latitude <= 90
                ):

                    using_coordinates = False

                # -------------------------------------------------
                # Validate longitude
                # -------------------------------------------------

                if not (
                    -180 <= user_longitude <= 180
                ):

                    using_coordinates = False

                # -------------------------------------------------
                # Validate search radius
                # -------------------------------------------------

                if (
                    search_radius_km <= 0
                    or search_radius_km > 100
                ):

                    using_coordinates = False

        if using_coordinates:

            nearby_hotels = []

            for hotel in active_hotels:

                # -------------------------------------------------
                # Hotels without coordinates cannot participate
                # in coordinate-based search.
                # -------------------------------------------------

                if (
                    hotel.latitude is None
                    or hotel.longitude is None
                ):

                    continue

                distance = calculate_distance(
                    user_latitude,
                    user_longitude,
                    hotel.latitude,
                    hotel.longitude,
                )

                if distance <= search_radius_km:

                    nearby_hotels.append(
                        (
                            hotel,
                            distance
                        )
                    )

            # -------------------------------------------------
            # Nearest hotel first.
            # -------------------------------------------------

            nearby_hotels.sort(
                key=lambda item: item[1]
            )

            coordinate_hotels = [
                hotel
                for hotel, distance
                in nearby_hotels
            ]

        # =================================================
        # SELECT LOCATION SEARCH MODE
        # =================================================
        #
        # If coordinate search found hotels:
        #
        #     Use coordinate results.
        #
        # Otherwise:
        #
        #     Fall back to text search.
        # =================================================

        if coordinate_hotels:

            hotels = coordinate_hotels

        else:

            hotels = (
                active_hotels
                .filter(
                    Q(name__icontains=location)
                    | Q(city__icontains=location)
                    | Q(address__icontains=location)
                    | Q(state__icontains=location)
                    | Q(country__icontains=location)
                )
                .distinct()
            )

        # =================================================
        # FIND ACTIVE BOOKINGS OVERLAPPING SEARCH DATES
        # =================================================

        booked_room_ids = set(
            Booking.objects
            .filter(
                status__in=[
                    "pending",
                    "confirmed",
                ],
                check_in__lt=check_out_date,
                check_out__gt=check_in_date,
            )
            .values_list(
                "room_id",
                flat=True
            )
        )

        # =================================================
        # FIND HOTELS WITH ENOUGH AVAILABLE ROOMS
        # =================================================

        available_hotel_ids = []

        for hotel in hotels:

            available_rooms_count = (
                Room.objects
                .filter(
                    hotel=hotel,
                    is_active=True,
                    is_available=True,
                    max_guests__gte=total_guests,
                )
                .exclude(
                    id__in=booked_room_ids
                )
                .count()
            )

            if (
                available_rooms_count
                >= rooms_requested
            ):

                available_hotel_ids.append(
                    hotel.id
                )

        # =================================================
        # NO AVAILABLE HOTELS
        # =================================================

        if not available_hotel_ids:

            return Hotel.objects.none()

        # =================================================
        # COORDINATE SEARCH
        # =================================================
        #
        # Preserve nearest-first ordering.
        # =================================================

        if coordinate_hotels:

            return [
                hotel
                for hotel in hotels
                if hotel.id in available_hotel_ids
            ]

        # =================================================
        # TEXT SEARCH
        # =================================================

        return (
            Hotel.objects
            .filter(
                id__in=available_hotel_ids,
                is_active=True,
            )
            .order_by(
                "price_from"
            )
        )


# =========================================================
# HOTEL ROOM API
# =========================================================

class RoomListCreateView(
    generics.ListCreateAPIView
):

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
        # FILTER ROOMS BY HOTEL
        #
        # Example:
        # /api/rooms/?hotel=2
        # -------------------------------------------------

        hotel_id = self.request.query_params.get(
            "hotel"
        )

        if hotel_id:

            try:

                hotel_id = int(
                    hotel_id
                )

            except (
                TypeError,
                ValueError
            ):

                return Room.objects.none()

            queryset = queryset.filter(
                hotel_id=hotel_id
            )

        return queryset


# =========================================================
# ROOM DETAIL API
# =========================================================

class RoomDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

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
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        bookings = (
            Booking.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "room",
                "room__hotel",
            )
            .order_by(
                "-created_at"
            )
        )

        # -------------------------------------------------
        # AUTOMATICALLY MARK PAST CONFIRMED BOOKINGS
        # AS COMPLETED
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

    def perform_create(
        self,
        serializer
    ):

        room = serializer.validated_data[
            "room"
        ]

        check_in = serializer.validated_data[
            "check_in"
        ]

        check_out = serializer.validated_data[
            "check_out"
        ]

        with transaction.atomic():

            locked_room = (
                Room.objects
                .select_for_update()
                .select_related("hotel")
                .get(
                    id=room.id
                )
            )

            # -------------------------------------------------
            # FINAL ROOM STATUS CHECK
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
            # FINAL HOTEL STATUS CHECK
            # -------------------------------------------------

            if not locked_room.hotel.is_active:

                raise ValidationError({
                    "room":
                        "This hotel is currently unavailable."
                })

            # -------------------------------------------------
            # FINAL OVERLAP CHECK
            # -------------------------------------------------

            overlapping_booking_exists = (
                Booking.objects
                .filter(
                    room=locked_room,
                    status__in=[
                        "pending",
                        "confirmed",
                    ],
                    check_in__lt=check_out,
                    check_out__gt=check_in,
                )
                .exists()
            )

            if overlapping_booking_exists:

                raise ValidationError({
                    "room":
                        "This room has just been booked "
                        "for the selected dates. Please "
                        "choose another room or different "
                        "dates."
                })

            # -------------------------------------------------
            # CREATE BOOKING
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
    permission_classes = [
        IsAuthenticated
    ]

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
    permission_classes = [
        IsAuthenticated
    ]

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
        # ALREADY CANCELLED
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
        # COMPLETED BOOKING
        # -------------------------------------------------

        if booking.status == "completed":

            return Response(
                {
                    "detail":
                        "Completed bookings cannot be "
                        "cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # CHECK WHETHER BOOKING HAS ENDED
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
        # CANCEL BOOKING
        # -------------------------------------------------

        booking.status = "cancelled"

        booking.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # -------------------------------------------------
        # RETURN UPDATED BOOKING
        # -------------------------------------------------

        serializer = self.get_serializer(
            booking
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    