from django.urls import path

from .views import (
    HotelListCreateView,
    HotelDetailView,
    HotelSearchView,
    RoomListCreateView,
    RoomDetailView,
    BookingListCreateView,
    BookingDetailView,
    BookingCancelView,
)


urlpatterns = [

    # =====================================================
    # HOTEL
    # =====================================================

    path(
        "hotels/",
        HotelListCreateView.as_view(),
        name="hotel-list-create"
    ),

    path(
        "hotels/search/",
        HotelSearchView.as_view(),
        name="hotel-search"
    ),

    path(
        "hotels/<int:pk>/",
        HotelDetailView.as_view(),
        name="hotel-detail"
    ),


    # =====================================================
    # ROOMS
    # =====================================================

    path(
        "rooms/",
        RoomListCreateView.as_view(),
        name="room-list-create"
    ),

    path(
        "rooms/<int:pk>/",
        RoomDetailView.as_view(),
        name="room-detail"
    ),


    # =====================================================
    # BOOKINGS
    # =====================================================

    path(
        "bookings/",
        BookingListCreateView.as_view(),
        name="booking-list-create"
    ),

    path(
        "bookings/<int:pk>/",
        BookingDetailView.as_view(),
        name="booking-detail"
    ),

    path(
        "bookings/<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="booking-cancel"
    ),
]
