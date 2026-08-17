function PopularDestinations() {
  const destinations = [
    {
      id: 1,
      name: 'Munnar',
      location: 'Kerala, India',
      hotels: '120+ Hotels',
      image: '/destination-1.jpg',
    },
    {
      id: 2,
      name: 'Goa',
      location: 'Goa, India',
      hotels: '250+ Hotels',
      image: '/destination-2.jpg',
    },
    {
      id: 3,
      name: 'Wayanad',
      location: 'Kerala, India',
      hotels: '95+ Hotels',
      image: '/destination-3.jpg',
    },
    {
      id: 4,
      name: 'Kochi',
      location: 'Kerala, India',
      hotels: '180+ Hotels',
      image: '/destination-4.jpg',
    },
    {
      id: 5,
      name: 'Jaipur',
      location: 'Rajasthan, India',
      hotels: '200+ Hotels',
      image: '/destination-5.jpg',
    },
    {
      id: 6,
      name: 'Manali',
      location: 'Himachal Pradesh, India',
      hotels: '150+ Hotels',
      image: '/destination-6.jpg',
    },
  ]

  return (
    <section className="destinations-section">

      <div className="container">

        {/* Section heading */}

        <div className="section-heading">

          <span className="section-label">
            POPULAR DESTINATIONS
          </span>

          <h2>
            Explore places travelers love
          </h2>

          <p>
            Discover beautiful destinations and find
            the perfect stay for your next adventure.
          </p>

        </div>


        {/* Destination cards */}

        <div className="row g-4">

          {destinations.map((destination) => (

            <div
              className="col-xl-4 col-md-6"
              key={destination.id}
            >

              <div className="destination-card">

                <img
                  src={destination.image}
                  alt={destination.name}
                />


                {/* Overlay */}

                <div className="destination-overlay"></div>


                {/* Content */}

                <div className="destination-content">

                  <div>

                    <h3>
                      {destination.name}
                    </h3>

                    <p>
                      <i className="bi bi-geo-alt"></i>
                      {destination.location}
                    </p>

                  </div>

                  <span className="destination-hotels">
                    {destination.hotels}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}

export default PopularDestinations
