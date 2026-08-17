function FeaturedHotels() {
  const hotels = [
    {
      id: 1,
      name: 'Grand Palace Resort',
      location: 'Munnar, Kerala',
      rating: '4.8',
      reviews: '245',
      price: '₹4,500',
      image: '/hotel-1.jpg',
    },
    {
      id: 2,
      name: 'Ocean View Resort',
      location: 'Kovalam, Kerala',
      rating: '4.7',
      reviews: '189',
      price: '₹5,200',
      image: '/hotel-2.jpg',
    },
    {
      id: 3,
      name: 'Mountain Breeze',
      location: 'Wayanad, Kerala',
      rating: '4.9',
      reviews: '312',
      price: '₹3,800',
      image: '/hotel-3.jpg',
    },
    {
      id: 4,
      name: 'The Heritage Hotel',
      location: 'Kochi, Kerala',
      rating: '4.6',
      reviews: '156',
      price: '₹6,100',
      image: '/hotel-4.jpg',
    },
  ]

  return (
    <section className="featured-section">

      <div className="container">

        {/* Section heading */}

        <div className="section-heading">

          <span className="section-label">
            FEATURED HOTELS
          </span>

          <h2>
            Stay somewhere you'll love
          </h2>

          <p>
            Discover some of our most popular hotels
            and resorts for your next trip.
          </p>

        </div>


        {/* Hotel cards */}

        <div className="row g-4">

          {hotels.map((hotel) => (

            <div
              className="col-xl-3 col-lg-4 col-md-6"
              key={hotel.id}
            >

              <div className="hotel-card">

                {/* Hotel image */}

                <div className="hotel-image">

                  <img
                    src={hotel.image}
                    alt={hotel.name}
                  />

                  <button
                    className="favorite-button"
                    aria-label={`Add ${hotel.name} to favorites`}
                  >
                    <i className="bi bi-heart"></i>
                  </button>

                </div>


                {/* Hotel details */}

                <div className="hotel-content">

                  <div className="hotel-rating">

                    <span>
                      <i className="bi bi-star-fill"></i>
                      {hotel.rating}
                    </span>

                    <small>
                      ({hotel.reviews} reviews)
                    </small>

                  </div>

                  <h3>
                    {hotel.name}
                  </h3>

                  <p className="hotel-location">
                    <i className="bi bi-geo-alt"></i>
                    {hotel.location}
                  </p>

                  <div className="hotel-bottom">

                    <div className="hotel-price">
                      <strong>{hotel.price}</strong>
                      <small>/night</small>
                    </div>

                    <button className="view-hotel-button">
                      View
                      <i className="bi bi-arrow-right"></i>
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>


        {/* View all */}

        <div className="text-center mt-5">

          <button className="btn btn-outline-primary px-4 py-2">
            View All Hotels
            <i className="bi bi-arrow-right ms-2"></i>
          </button>

        </div>

      </div>

    </section>
  )
}

export default FeaturedHotels
