from django.contrib import admin

from .models import Hotel, Room, Booking


# =========================================================
# HOTEL ADMIN
# =========================================================

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "city",
        "state",
        "star_rating",
        "price_from",
        "is_featured",
        "is_active",
    )

    list_filter = (
        "is_featured",
        "is_active",
        "star_rating",
        "city",
    )

    search_fields = (
        "name",
        "city",
        "address",
    )


# =========================================================
# ROOM ADMIN
# =========================================================

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "hotel",
        "room_type",
        "price_per_night",
        "max_guests",
        "is_available",
        "is_active",
    )

    list_filter = (
        "hotel",
        "room_type",
        "is_available",
        "is_active",
    )

    search_fields = (
        "name",
        "hotel__name",
    )


# =========================================================
# BOOKING ADMIN
# =========================================================

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        "booking_reference",
        "user",
        "room",
        "check_in",
        "check_out",
        "guests",
        "total_price",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "check_in",
        "check_out",
    )

    search_fields = (
        "booking_reference",
        "user__username",
        "room__name",
        "room__hotel__name",
    )

    readonly_fields = (
        "booking_reference",
        "created_at",
        "updated_at",
    )

    