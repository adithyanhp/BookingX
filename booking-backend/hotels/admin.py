from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

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
# USER BOOKING FILTER
# =========================================================

class UserBookingFilter(admin.SimpleListFilter):

    title = "User"

    parameter_name = "user"

    def lookups(self, request, model_admin):

        users = (
            User.objects
            .filter(
                bookings__isnull=False
            )
            .distinct()
            .order_by("username")
        )

        return [
            (
                user.id,
                user.username
            )
            for user in users
        ]

    def queryset(self, request, queryset):

        if self.value():

            return queryset.filter(
                user_id=self.value()
            )

        return queryset


# =========================================================
# BOOKING ADMIN
# =========================================================

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        "booking_reference",
        "user",
        "get_hotel",
        "room",
        "check_in",
        "check_out",
        "guests",
        "total_price",
        "status",
        "created_at",
    )

    list_filter = (
        UserBookingFilter,
        "status",
        "check_in",
        "check_out",
        "room__hotel",
    )

    search_fields = (
        "booking_reference",
        "user__username",
        "user__email",
        "room__name",
        "room__hotel__name",
    )

    readonly_fields = (
        "booking_reference",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    # ---------------------------------------------------------
    # HOTEL BOOKED
    # ---------------------------------------------------------

    @admin.display(
        description="Hotel",
        ordering="room__hotel__name"
    )
    def get_hotel(self, obj):

        return obj.room.hotel.name


# =========================================================
# USER ADMIN
# =========================================================

class CustomUserAdmin(UserAdmin):

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "get_booking_count",
        "is_staff",
        "is_active",
        "date_joined",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "date_joined",
    )

    ordering = (
        "-date_joined",
    )

    # ---------------------------------------------------------
    # NUMBER OF BOOKINGS
    # ---------------------------------------------------------

    @admin.display(
        description="Bookings",
        ordering="bookings__count"
    )
    def get_booking_count(self, obj):

        return obj.bookings.count()


# =========================================================
# REGISTER CUSTOM USER ADMIN
# =========================================================

admin.site.unregister(User)

admin.site.register(
    User,
    CustomUserAdmin
)

