import uuid
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Hotel, Room, Booking


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = "__all__"



#This tells DRF how to convert the Room model into JSON and how to accept JSON/form data to create rooms.
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"



# Booking serializer
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = [
            "user",
            "total_price",
            "booking_reference",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        room = data["room"]
        check_in = data["check_in"]
        check_out = data["check_out"]
        guests = data["guests"]

        # Check that check-out is after check-in
        if check_out <= check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out date must be after check-in date."
            })

        # Check guest capacity
        if guests > room.max_guests:
            raise serializers.ValidationError({
                "guests": (
                    f"This room can accommodate a maximum of "
                    f"{room.max_guests} guests."
                )
            })

        # Check room status
        if not room.is_active:
            raise serializers.ValidationError({
                "room": "This room is currently inactive."
            })

        if not room.is_available:
            raise serializers.ValidationError({
                "room": "This room is currently unavailable."
            })

        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            room=room,
            check_in__lt=check_out,
            check_out__gt=check_in,
            status__in=["pending", "confirmed"],
        )

        # Don't compare an existing booking with itself
        if self.instance:
            overlapping_bookings = overlapping_bookings.exclude(
                id=self.instance.id
            )

        if overlapping_bookings.exists():
            raise serializers.ValidationError({
                "room": "This room is already booked for the selected dates."
            })

        # Calculate total price
        number_of_nights = (check_out - check_in).days

        data["total_price"] = (
            room.price_per_night * number_of_nights
        )

        return data

    def create(self, validated_data):
        request = self.context["request"]

        booking = Booking.objects.create(
            user=request.user,
            status="pending",
            booking_reference=f"BKX-{uuid.uuid4().hex[:8].upper()}",
            **validated_data
        )

        return booking
    

