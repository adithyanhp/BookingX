import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedHotels } from "../services/api";

function FeaturedHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeaturedHotels = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getFeaturedHotels();

        // Supports both normal arrays and DRF paginated responses
        setHotels(
          Array.isArray(data)
            ? data
            : data.results || []
        );

      } catch (error) {
        console.error(
          "Failed to load featured hotels:",
          error
        );

        setError(
          "Unable to load featured hotels. Please try again."
        );

      } finally {
        setLoading(false);
      }
    };

    loadFeaturedHotels();
  }, []);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="featured-section">

        <div className="container">

          <div className="section-heading">

            <span className="section-label">
              FEATURED HOTELS
            </span>

            <h2>
              Find Your Perfect Stay
            </h2>

            <p>
              Discover comfortable and affordable hotels
              for your next trip.
            </p>

          </div>


          <div className="text-center py-4">

            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-3">
              Loading featured hotels...
            </p>

          </div>

        </div>

      </section>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <section className="featured-section">

        <div className="container">

          <div className="section-heading">

            <span className="section-label">
              FEATURED HOTELS
            </span>

            <h2>
              Find Your Perfect Stay
            </h2>

            <p>
              Discover comfortable and affordable hotels
              for your next trip.
            </p>

          </div>


          <div className="text-center py-4">

            <i className="bi bi-exclamation-circle fs-3 text-danger"></i>

            <p className="mt-2 text-muted">
              {error}
            </p>

          </div>

        </div>

      </section>
    );
  }


  return (
    <section className="featured-section">

      <div className="container">

        {/* =================================================
            SECTION HEADING
        ================================================= */}

        <div className="section-heading">

          <span className="section-label">
            FEATURED HOTELS
          </span>

          <h2>
            Find Your Perfect Stay
          </h2>

          <p>
            Discover comfortable and affordable hotels
            for your next trip.
          </p>

        </div>


        {/* =================================================
            HOTELS
        ================================================= */}

        <div className="row g-4">

          {hotels.length > 0 ? (

            hotels.map((hotel) => (

              <div
                className="col-lg-4 col-md-6"
                key={hotel.id}
              >

                <div className="hotel-card">

                  {/* =========================================
                      HOTEL IMAGE
                  ========================================= */}

                  <div className="hotel-image">

                    <img
                      src={
                        hotel.image ||
                        "/hotel.jpg"
                      }
                      alt={hotel.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/hotel.jpg";
                      }}
                    />


                    <button
                      className="favorite-button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label={
                        `Add ${hotel.name} to favorites`
                      }
                    >
                      <i className="bi bi-heart"></i>
                    </button>

                  </div>


                  {/* =========================================
                      HOTEL CONTENT
                  ========================================= */}

                  <div className="hotel-content">

                    {/* =======================================
                        RATING
                    ======================================= */}

                    <div className="hotel-rating">

                      <span>

                        <i className="bi bi-star-fill"></i>

                        {hotel.star_rating}

                      </span>


                      <small>
                        {hotel.star_rating >= 5
                          ? "Exceptional"
                          : hotel.star_rating >= 4
                          ? "Excellent"
                          : "Very Good"}
                      </small>

                    </div>


                    {/* =======================================
                        HOTEL NAME
                    ======================================= */}

                    <h3>
                      {hotel.name}
                    </h3>


                    {/* =======================================
                        LOCATION
                    ======================================= */}

                    <div className="hotel-location">

                      <i className="bi bi-geo-alt"></i>

                      <span>

                        {hotel.city}

                        {hotel.state
                          ? `, ${hotel.state}`
                          : ""}

                      </span>

                    </div>


                    {/* =======================================
                        BOTTOM
                    ======================================= */}

                    <div className="hotel-bottom">

                      {/* PRICE */}

                      <div className="hotel-price">

                        <strong>
                          ₹{hotel.price_from}
                        </strong>

                        <small>
                          / night
                        </small>

                      </div>


                      {/* VIEW HOTEL */}

                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="view-hotel-button"
                      >

                        <span>
                          View Hotel
                        </span>

                        <i className="bi bi-arrow-right"></i>

                      </Link>

                    </div>

                  </div>

                </div>

              </div>

            ))

          ) : (

            /* =============================================
               NO FEATURED HOTELS
            ============================================= */

            <div className="col-12">

              <div className="text-center py-4">

                <div className="mb-2">

                  <i className="bi bi-building fs-2 text-muted"></i>

                </div>

                <p className="text-muted mb-0">

                  No featured hotels are available
                  at the moment.

                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </section>
  );
}

export default FeaturedHotels;

