from django.db import models
from django.contrib.auth.models import User


class Hotel(models.Model):
    name = models.CharField(max_length=200)

    description = models.TextField()

    image = models.ImageField(
        upload_to="hotels/",
        blank=True,
        null=True
    )

    address = models.CharField(max_length=300)

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100, blank=True)

    country = models.CharField(max_length=100, default="India")

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

    is_active = models.BooleanField(        #This lets an administrator disable a hotel without deleting it from the database.
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


# Hotel Room model 

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



# Booking model
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
        return self.booking_reference


