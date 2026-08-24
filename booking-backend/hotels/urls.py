from django.urls import path

from .views import (
    HotelListCreateView,
    FeaturedHotelListView,
    HotelDetailView,
    HotelLocationSearchView,
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

    # -----------------------------------------------------
    # LIVE HOTEL LOCATION SEARCH
    # -----------------------------------------------------
    #
    # GET:
    # /api/hotels/locations/?q=koch
    #
    # Returns location suggestions while the user types.
    #
    # Example response:
    #
    # [
    #     {
    #         "city": "Kochi",
    #         "state": "Kerala",
    #         "country": "India",
    #         "label": "Kochi, Kerala, India"
    #     }
    # ]
    #
    # -----------------------------------------------------

    path(
        "hotels/locations/",
        HotelLocationSearchView.as_view(),
        name="hotel-location-search"
    ),

    # -----------------------------------------------------
    # HOTEL SEARCH
    # -----------------------------------------------------

    path(
        "hotels/search/",
        HotelSearchView.as_view(),
        name="hotel-search"
    ),

    # -----------------------------------------------------
    # FEATURED HOTELS
    # -----------------------------------------------------

    path(
        "hotels/featured/",
        FeaturedHotelListView.as_view(),
        name="featured-hotel-list"
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

