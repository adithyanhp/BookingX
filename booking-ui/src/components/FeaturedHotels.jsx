import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHotels } from "../services/api";

function FeaturedHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotels()
      .then((data) => {
        setHotels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load hotels:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">FEATURED HOTELS</span>
            <h2>Find Your Perfect Stay</h2>
            <p>Discover comfortable and affordable hotels for your next trip.</p>
          </div>

          <div className="text-center">
            <p>Loading hotels...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section">
      <div className="container">

        {/* Section Heading */}
        <div className="section-heading">
          <span className="section-label">FEATURED HOTELS</span>

          <h2>Find Your Perfect Stay</h2>

          <p>
            Discover comfortable and affordable hotels for your next trip.
          </p>
        </div>

        {/* Hotels */}
        <div className="row g-4">

          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div
                className="col-lg-4 col-md-6"
                key={hotel.id}
              >
                <div className="hotel-card">

                  {/* =========================
                      HOTEL IMAGE
                  ========================= */}
                  <div className="hotel-image">

                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      onError={(e) => {
                        e.currentTarget.src = "/hotel.jpg";
                      }}
                    />

                    <button
                      className="favorite-button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label={`Add ${hotel.name} to favorites`}
                    >
                      <i className="bi bi-heart"></i>
                    </button>

                  </div>


                  {/* =========================
                      HOTEL CONTENT
                  ========================= */}
                  <div className="hotel-content">

                    {/* Rating */}
                    <div className="hotel-rating">

                      <span>
                        <i className="bi bi-star-fill"></i>
                        {hotel.star_rating}
                      </span>

                      <small>
                        Excellent
                      </small>

                    </div>


                    {/* Hotel Name */}
                    <h3>
                      {hotel.name}
                    </h3>


                    {/* Location */}
                    <div className="hotel-location">

                      <i className="bi bi-geo-alt"></i>

                      <span>
                        {hotel.city}, {hotel.country}
                      </span>

                    </div>


                    {/* Bottom */}
                    <div className="hotel-bottom">

                      <div className="hotel-price">

                        <strong>
                          ₹{hotel.price_from}
                        </strong>

                        <small>
                          / night
                        </small>

                      </div>


                      {/* View Hotel */}
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="view-hotel-button"
                      >
                        <span>View Hotel</span>

                        <i className="bi bi-arrow-right"></i>
                      </Link>

                    </div>

                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center">
                <p className="text-muted">
                  No hotels available at the moment.
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

