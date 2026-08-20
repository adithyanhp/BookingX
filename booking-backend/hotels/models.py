from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError


# =========================================================
# HOTEL MODEL
# =========================================================

class Hotel(models.Model):

    name = models.CharField(
        max_length=200
    )

    description = models.TextField()

    image = models.ImageField(
        upload_to="hotels/",
        blank=True,
        null=True
    )

    address = models.CharField(
        max_length=300
    )

    city = models.CharField(
        max_length=100
    )

    state = models.CharField(
        max_length=100,
        blank=True
    )

    country = models.CharField(
        max_length=100,
        default="India"
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    star_rating = models.PositiveSmallIntegerField(
        default=3
    )

    price_from = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    check_in_time = models.TimeField(
        default="14:00"
    )

    check_out_time = models.TimeField(
        default="11:00"
    )

    # Allows admin to disable a hotel without deleting it
    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


# =========================================================
# ROOM MODEL
# =========================================================

class Room(models.Model):

    ROOM_TYPES = [
        ("standard", "Standard"),
        ("deluxe", "Deluxe"),
        ("suite", "Suite"),
    ]

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    room_type = models.CharField(
        max_length=20,
        choices=ROOM_TYPES
    )

    name = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True
    )

    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    max_guests = models.PositiveSmallIntegerField()

    bed_count = models.PositiveSmallIntegerField(
        default=1
    )

    room_size = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    amenities = models.TextField(
        blank=True
    )

    # Administrative availability.
    #
    # This does NOT determine date-based availability.
    # Date-based availability is calculated from bookings.
    is_available = models.BooleanField(
        default=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"


# =========================================================
# BOOKING MODEL
# =========================================================

class Booking(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="bookings"
    )

    check_in = models.DateField()

    check_out = models.DateField()

    guests = models.PositiveSmallIntegerField(
        default=1
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    booking_reference = models.CharField(
        max_length=20,
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.booking_reference} - "
            f"{self.room.hotel.name} - "
            f"{self.room.name}"
        )

    # =====================================================
    # MODEL VALIDATION
    # =====================================================

    def clean(self):
        """
        Validate booking data before saving.
        """

        # Check-in cannot be after check-out.
        if self.check_in and self.check_out:

            if self.check_out <= self.check_in:
                raise ValidationError({
                    "check_out":
                        "Check-out date must be after check-in date."
                })

        # Guests must be at least 1.
        if self.guests < 1:
            raise ValidationError({
                "guests":
                    "At least one guest is required."
            })

        # Make sure the selected room can accommodate
        # the requested number of guests.
        if self.room_id and self.guests > self.room.max_guests:
            raise ValidationError({
                "guests":
                    "The selected room cannot accommodate "
                    "this many guests."
            })

    # =====================================================
    # NUMBER OF NIGHTS
    # =====================================================

    @property
    def nights(self):
        """
        Returns the number of nights for this booking.
        """

        if not self.check_in or not self.check_out:
            return 0

        return (self.check_out - self.check_in).days

    # =====================================================
    # CHECK WHETHER BOOKING HAS PASSED CHECKOUT DATE
    # =====================================================

    @property
    def has_ended(self):
        """
        Returns True when the booking's checkout date
        has already passed.

        This works even if the booking status has not yet
        been changed to 'completed'.
        """

        if not self.check_out:
            return False

        return self.check_out < timezone.localdate()

    # =====================================================
    # CHECK WHETHER BOOKING IS ACTIVE
    # =====================================================

    @property
    def is_active_booking(self):
        """
        Returns True when the booking can currently
        block a room for another user.
        """

        return (
            self.status in [
                "pending",
                "confirmed",
            ]
            and not self.has_ended
        )

    