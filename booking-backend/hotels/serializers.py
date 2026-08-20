import uuid

from django.utils import timezone

from rest_framework import serializers

from .models import Hotel, Room, Booking


# =========================================================
# HOTEL SERIALIZER
# =========================================================

class HotelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Hotel
        fields = "__all__"


# =========================================================
# ROOM SERIALIZER
# =========================================================

class RoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Room
        fields = "__all__"


# =========================================================
# BOOKING SERIALIZER
# =========================================================

class BookingSerializer(serializers.ModelSerializer):

    # -----------------------------------------------------
    # HOTEL / ROOM INFORMATION
    #
    # These fields are read-only and are used by
    # the My Bookings page.
    # -----------------------------------------------------

    hotel_name = serializers.CharField(
        source="room.hotel.name",
        read_only=True
    )

    hotel_location = serializers.SerializerMethodField(
        read_only=True
    )

    room_type = serializers.CharField(
        source="room.room_type",
        read_only=True
    )

    room_name = serializers.CharField(
        source="room.name",
        read_only=True
    )

    class Meta:

        model = Booking

        fields = [
            # -------------------------------------------------
            # Booking fields
            # -------------------------------------------------

            "id",
            "user",
            "room",
            "check_in",
            "check_out",
            "guests",
            "total_price",
            "status",
            "booking_reference",
            "created_at",
            "updated_at",

            # -------------------------------------------------
            # Hotel / room information
            # -------------------------------------------------

            "hotel_name",
            "hotel_location",
            "room_type",
            "room_name",
        ]

        read_only_fields = [
            # -------------------------------------------------
            # Fields controlled by backend
            # -------------------------------------------------

            "user",
            "total_price",
            "booking_reference",
            "status",
            "created_at",
            "updated_at",

            # -------------------------------------------------
            # Display-only hotel / room information
            # -------------------------------------------------

            "hotel_name",
            "hotel_location",
            "room_type",
            "room_name",
        ]


    # =====================================================
    # HOTEL LOCATION
    # =====================================================

    def get_hotel_location(self, obj):

        hotel = obj.room.hotel

        # -------------------------------------------------
        # Prefer city + state
        # -------------------------------------------------

        if hotel.city and hotel.state:
            return f"{hotel.city}, {hotel.state}"

        # -------------------------------------------------
        # City only
        # -------------------------------------------------

        if hotel.city:
            return hotel.city

        # -------------------------------------------------
        # Address fallback
        # -------------------------------------------------

        if hotel.address:
            return hotel.address

        return "Location unavailable"


    # =====================================================
    # VALIDATION
    # =====================================================

    def validate(self, data):

        room = data["room"]
        check_in = data["check_in"]
        check_out = data["check_out"]
        guests = data["guests"]

        today = timezone.localdate()


        # -------------------------------------------------
        # CHECK-IN CANNOT BE IN THE PAST
        # -------------------------------------------------

        if check_in < today:

            raise serializers.ValidationError({
                "check_in":
                    "Check-in date cannot be in the past."
            })


        # -------------------------------------------------
        # CHECK-OUT MUST BE AFTER CHECK-IN
        # -------------------------------------------------

        if check_out <= check_in:

            raise serializers.ValidationError({
                "check_out":
                    "Check-out date must be after the check-in date."
            })


        # -------------------------------------------------
        # CHECK GUEST CAPACITY
        # -------------------------------------------------

        if guests < 1:

            raise serializers.ValidationError({
                "guests":
                    "At least one guest is required."
            })


        if guests > room.max_guests:

            raise serializers.ValidationError({
                "guests": (
                    f"This room can accommodate a maximum of "
                    f"{room.max_guests} guests."
                )
            })


        # -------------------------------------------------
        # CHECK HOTEL ACTIVE STATUS
        # -------------------------------------------------

        hotel = room.hotel

        if not hotel.is_active:

            raise serializers.ValidationError({
                "room":
                    "This hotel is currently unavailable."
            })


        # -------------------------------------------------
        # CHECK ROOM ACTIVE STATUS
        # -------------------------------------------------

        if not room.is_active:

            raise serializers.ValidationError({
                "room":
                    "This room is currently inactive."
            })


        # -------------------------------------------------
        # CHECK ROOM AVAILABILITY
        # -------------------------------------------------

        if not room.is_available:

            raise serializers.ValidationError({
                "room":
                    "This room is currently unavailable."
            })


        # -------------------------------------------------
        # CHECK OVERLAPPING BOOKINGS
        #
        # Example:
        #
        # Existing:
        # 1 Nov → 3 Nov
        #
        # New:
        # 3 Nov → 5 Nov
        #
        # This IS allowed.
        #
        # Existing:
        # 1 Nov → 3 Nov
        #
        # New:
        # 2 Nov → 5 Nov
        #
        # This is NOT allowed.
        # -------------------------------------------------

        overlapping_bookings = Booking.objects.filter(
            room=room,
            check_in__lt=check_out,
            check_out__gt=check_in,
            status__in=[
                "pending",
                "confirmed",
            ],
        )


        # -------------------------------------------------
        # When updating an existing booking, don't compare
        # the booking against itself.
        # -------------------------------------------------

        if self.instance:

            overlapping_bookings = (
                overlapping_bookings.exclude(
                    id=self.instance.id
                )
            )


        if overlapping_bookings.exists():

            raise serializers.ValidationError({
                "room":
                    "This room is already booked for the selected dates."
            })


        # -------------------------------------------------
        # CALCULATE TOTAL PRICE
        # -------------------------------------------------

        number_of_nights = (
            check_out - check_in
        ).days

        data["total_price"] = (
            room.price_per_night * number_of_nights
        )


        return data


    # =====================================================
    # CREATE BOOKING
    # =====================================================

    def create(self, validated_data):

        request = self.context["request"]

        booking = Booking.objects.create(
            user=request.user,

            status="pending",

            booking_reference=(
                f"BKX-{uuid.uuid4().hex[:8].upper()}"
            ),

            **validated_data
        )

        return booking

    