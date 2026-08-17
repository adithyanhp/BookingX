from django.db import models


class Hotel(models.Model):
    name = models.CharField(max_length=200)

    description = models.TextField()

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

