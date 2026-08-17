function SpecialOffers() {
  const offers = [
    {
      id: 1,
      title: 'Weekend Escape',
      description: 'Enjoy a relaxing weekend at selected hotels.',
      discount: '20% OFF',
      image: '/offer-1.jpg',
    },
    {
      id: 2,
      title: 'Luxury Stay',
      description: 'Experience premium stays at special prices.',
      discount: '30% OFF',
      image: '/offer-2.jpg',
    },
    {
      id: 3,
      title: 'Family Vacation',
      description: 'Make unforgettable memories with your family.',
      discount: '25% OFF',
      image: '/offer-3.jpg',
    },
  ]

  return (
    <section className="offers-section">

      <div className="container">

        {/* Section heading */}

        <div className="section-heading">

          <span className="section-label">
            SPECIAL OFFERS
          </span>

          <h2>
            Offers you don't want to miss
          </h2>

          <p>
            Save more on your next trip with our exclusive
            hotel deals and seasonal offers.
          </p>

        </div>


        {/* Offers */}

        <div className="row g-4">

          {offers.map((offer) => (

            <div
              className="col-lg-4 col-md-6"
              key={offer.id}
            >

              <div className="offer-card">

                {/* Image */}

                <div className="offer-image">

                  <img
                    src={offer.image}
                    alt={offer.title}
                  />

                  <span className="offer-discount">
                    {offer.discount}
                  </span>

                </div>


                {/* Content */}

                <div className="offer-content">

                  <h3>
                    {offer.title}
                  </h3>

                  <p>
                    {offer.description}
                  </p>

                  <button className="offer-button">
                    View Offer
                    <i className="bi bi-arrow-right"></i>
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}

export default SpecialOffers
