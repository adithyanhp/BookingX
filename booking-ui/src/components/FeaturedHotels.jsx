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
          <h2>Loading hotels...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section">
      <div className="container">

        <div className="section-heading">
          <span className="section-label">FEATURED HOTELS</span>

          <h2>Find Your Perfect Stay</h2>

          <p>
            Discover comfortable and affordable hotels for your next trip.
          </p>
        </div>

        <div className="row g-4">

          {hotels.map((hotel) => (
            <div
              className="col-lg-4 col-md-6"
              key={hotel.id}
            >

              <div className="hotel-card">

                {/* Hotel Image */}
                <div className="hotel-image">

                  <img
                    src="/hotel.jpg"
                    alt={hotel.name}
                  />

                  <button
                    className="favorite-button"
                    type="button"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="bi bi-heart"></i>
                  </button>

                </div>


                {/* Hotel Content */}
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

                    {hotel.city}, {hotel.country}

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


                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="view-hotel-button"
                    >
                      View Hotel

                      <i className="bi bi-arrow-right"></i>
                    </Link>

                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default FeaturedHotels;

