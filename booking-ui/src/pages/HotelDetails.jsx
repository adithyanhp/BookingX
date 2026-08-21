import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getHotel, getRoomsByHotel } from "../services/api";
import "./HotelDetails.css";

function HotelDetails() {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHotelDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [hotelData, roomData] = await Promise.all([
          getHotel(id),
          getRoomsByHotel(id),
        ]);

        setHotel(hotelData);

        // Supports both normal arrays and DRF paginated responses
        const fetchedRooms = Array.isArray(roomData)
          ? roomData
          : roomData.results || [];

        // -------------------------------------------------
        // SAFETY CHECK
        //
        // Only keep rooms belonging to the currently
        // opened hotel.
        // -------------------------------------------------

        const hotelRooms = fetchedRooms.filter(
          (room) =>
            String(room.hotel) === String(hotelData.id)
        );

        setRooms(hotelRooms);

      } catch (error) {
        console.error(
          "Failed to load hotel details:",
          error
        );

        setError(
          "Unable to load hotel details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHotelDetails();
  }, [id]);


  // =========================================================
  // HOTEL IMAGE
  // =========================================================

  const hotelImage =
    hotel?.image || "/hotel.jpg";


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="hotel-details-page">
        <div className="container py-5">

          <div className="hotel-loading">

            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <h4>
              Loading hotel details...
            </h4>

            <p>
              Please wait a moment.
            </p>

          </div>

        </div>
      </div>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error || !hotel) {
    return (
      <div className="hotel-details-page">

        <div className="container py-5">

          <div className="hotel-error">

            <i className="bi bi-exclamation-circle"></i>

            <h2>
              Hotel not found
            </h2>

            <p>
              {error ||
                "The hotel you're looking for could not be found."}
            </p>

            <Link
              to="/"
              className="btn btn-primary"
            >
              <i className="bi bi-arrow-left"></i>
              Back to Hotels
            </Link>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="hotel-details-page">

      {/* =========================
          BREADCRUMB
      ========================= */}

      <div className="container">

        <div className="hotel-breadcrumb">

          <Link to="/">
            <i className="bi bi-house"></i>
            Home
          </Link>

          <i className="bi bi-chevron-right"></i>

          <span>
            Hotels
          </span>

          <i className="bi bi-chevron-right"></i>

          <span>
            {hotel.name}
          </span>

        </div>

      </div>


      {/* =========================
          HOTEL HERO
      ========================= */}

      <section className="hotel-detail-hero">

        <div className="container">

          <div className="hotel-detail-image">

            <img
              src={hotelImage}
              alt={hotel.name}
              onError={(event) => {
                event.currentTarget.src = "/hotel.jpg";
              }}
            />

            <div className="hotel-image-overlay"></div>

            <div className="hotel-hero-content">

              <div className="hotel-star-badge">

                <i className="bi bi-star-fill"></i>

                {hotel.star_rating} Star Hotel

              </div>

              <h1>
                {hotel.name}
              </h1>

              <p>

                <i className="bi bi-geo-alt-fill"></i>

                {hotel.address},{" "}
                {hotel.city},{" "}
                {hotel.country}

              </p>

            </div>

            <button
              className="hotel-favorite-button"
              type="button"
              aria-label="Add hotel to favorites"
            >

              <i className="bi bi-heart"></i>

            </button>

          </div>

        </div>

      </section>


      {/* =========================
          HOTEL INFORMATION
      ========================= */}

      <section className="hotel-info-section">

        <div className="container">

          <div className="row g-4">

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <div className="col-lg-8">

              {/* =========================
                  ABOUT HOTEL
              ========================= */}

              <div className="hotel-info-card">

                <div className="hotel-title-row">

                  <div>

                    <span className="hotel-section-label">
                      ABOUT THE HOTEL
                    </span>

                    <h2>
                      {hotel.name}
                    </h2>

                  </div>

                  <div className="hotel-rating-large">

                    <i className="bi bi-star-fill"></i>

                    <strong>
                      {hotel.star_rating}
                    </strong>

                    <span>
                      / 5
                    </span>

                  </div>

                </div>


                <p className="hotel-description">

                  {hotel.description ||
                    "Enjoy a comfortable and memorable stay at this beautiful hotel. Discover excellent hospitality, convenient facilities and a great location for your trip."}

                </p>


                {/* =========================
                    HOTEL HIGHLIGHTS
                ========================= */}

                <div className="hotel-highlights">

                  <div className="hotel-highlight">

                    <div className="highlight-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>

                    <div>

                      <strong>
                        Great Location
                      </strong>

                      <span>
                        {hotel.city}
                      </span>

                    </div>

                  </div>


                  <div className="hotel-highlight">

                    <div className="highlight-icon">
                      <i className="bi bi-star"></i>
                    </div>

                    <div>

                      <strong>
                        Highly Rated
                      </strong>

                      <span>
                        {hotel.star_rating} Star Hotel
                      </span>

                    </div>

                  </div>


                  <div className="hotel-highlight">

                    <div className="highlight-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>

                    <div>

                      <strong>
                        Secure Booking
                      </strong>

                      <span>
                        Easy & reliable
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* =========================
                  ROOMS
              ========================= */}

              <div
                className="rooms-section"
                id="rooms"
              >

                <div className="rooms-heading">

                  <div>

                    <span className="hotel-section-label">
                      ACCOMMODATION
                    </span>

                    <h2>
                      Choose Your Room
                    </h2>

                  </div>

                  <span className="room-count">

                    {rooms.length}{" "}

                    {rooms.length === 1
                      ? "Room"
                      : "Rooms"}

                  </span>

                </div>


                {rooms.length === 0 ? (

                  <div className="no-rooms">

                    <div className="no-rooms-icon">

                      <i className="bi bi-door-closed"></i>

                    </div>

                    <h3>
                      No rooms available
                    </h3>

                    <p>
                      There are currently no rooms
                      available for this hotel.
                    </p>

                  </div>

                ) : (

                  <div className="rooms-list">

                    {rooms.map((room) => (

                      <div
                        className="room-card"
                        key={room.id}
                      >

                        {/* =========================
                            ROOM IMAGE
                        ========================= */}

                        <div className="room-image">

                          <img
                            src={
                              room.image ||
                              hotel.image ||
                              "/hotel-room.jpg"
                            }
                            alt={room.name}
                            onError={(event) => {

                              // First fallback:
                              // hotel image

                              if (
                                hotel.image &&
                                event.currentTarget.src !==
                                  hotel.image
                              ) {
                                event.currentTarget.src =
                                  hotel.image;
                                return;
                              }

                              // Final fallback

                              event.currentTarget.src =
                                "/hotel-room.jpg";
                            }}
                          />

                          <span className="room-type-badge">

                            <i className="bi bi-house"></i>

                            {room.room_type
                              ? room.room_type
                                  .charAt(0)
                                  .toUpperCase() +
                                room.room_type.slice(1)
                              : "Room"}

                          </span>

                        </div>


                        {/* =========================
                            ROOM CONTENT
                        ========================= */}

                        <div className="room-content">

                          <div className="room-top">

                            <div>

                              <h3>
                                {room.name}
                              </h3>

                              <p className="room-description">

                                {room.description ||
                                  "Comfortable room with modern facilities for a relaxing stay."}

                              </p>

                            </div>

                          </div>


                          {/* =========================
                              ROOM FEATURES
                          ========================= */}

                          <div className="room-features">

                            <span>

                              <i className="bi bi-people"></i>

                              Up to{" "}
                              {room.max_guests} guests

                            </span>


                            <span>

                              <i className="bi bi-moon"></i>

                              Per night

                            </span>


                            <span>

                              <i className="bi bi-bed"></i>

                              {room.bed_count}{" "}

                              {room.bed_count === 1
                                ? "Bed"
                                : "Beds"}

                            </span>

                          </div>


                          {/* =========================
                              ROOM PRICE + BOOK
                          ========================= */}

                          <div className="room-bottom">

                            <div className="room-price">

                              <small>
                                From
                              </small>

                              <strong>
                                ₹
                                {room.price_per_night}
                              </strong>

                              <span>
                                / night
                              </span>

                            </div>


                            <Link
                              to={`/booking/${room.id}`}
                              className="room-book-button"
                            >

                              Book Now

                              <i className="bi bi-arrow-right"></i>

                            </Link>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>


            {/* =========================
                SIDEBAR
            ========================= */}

            <div className="col-lg-4">

              <div className="hotel-sidebar">

                {/* =========================
                    PRICE CARD
                ========================= */}

                <div className="price-card">

                  <span className="price-label">
                    Starting from
                  </span>

                  <div className="starting-price">

                    <strong>
                      ₹{hotel.price_from}
                    </strong>

                    <span>
                      / night
                    </span>

                  </div>

                  <p>
                    Select a room below to
                    continue with your booking.
                  </p>

                  <a
                    href="#rooms"
                    className="sidebar-book-button"
                  >

                    <i className="bi bi-calendar-check"></i>

                    View Available Rooms

                  </a>

                </div>


                {/* =========================
                    WHY BOOK
                ========================= */}

                <div className="why-book-card">

                  <h3>
                    Why book with BookingX?
                  </h3>


                  <div className="why-book-item">

                    <div>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>

                    <span>
                      Easy and secure booking
                    </span>

                  </div>


                  <div className="why-book-item">

                    <div>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>

                    <span>
                      Best available hotel prices
                    </span>

                  </div>


                  <div className="why-book-item">

                    <div>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>

                    <span>
                      Instant booking confirmation
                    </span>

                  </div>


                  <div className="why-book-item">

                    <div>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>

                    <span>
                      Manage bookings easily
                    </span>

                  </div>

                </div>


                {/* =========================
                    LOCATION
                ========================= */}

                <div className="location-card">

                  <div className="location-icon">

                    <i className="bi bi-geo-alt-fill"></i>

                  </div>

                  <div>

                    <h4>
                      Location
                    </h4>

                    <p>

                      {hotel.address}

                      <br />

                      {hotel.city},{" "}
                      {hotel.country}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default HotelDetails;

