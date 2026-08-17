const offers = [
  {
    title: 'Weekend Getaway',
    description: 'Save up to 30% on selected stays.',
    image: '/offer1.jpg',
  },
  {
    title: 'Early Bird',
    description: 'Book early and save more.',
    image: '/offer2.jpg',
  },
  {
    title: 'Luxury Escape',
    description: 'Premium stays at special prices.',
    image: '/offer3.jpg',
  },
]

function Offers() {
  return (
    <section className="offers-section">

      <div className="container">

        <div className="section-heading">
          <span>Best deals</span>

          <h2>
            Exclusive offers for you
          </h2>

          <p>
            Save more on your next trip with our
            special booking offers.
          </p>
        </div>

        <div className="row g-4">

          {offers.map((offer, index) => (

            <div className="col-md-6 col-lg-4" key={index}>

              <div className="offer-card">

                <img
                  src={offer.image}
                  alt={offer.title}
                />

                <div className="offer-content">

                  <h4>
                    {offer.title}
                  </h4>

                  <p>
                    {offer.description}
                  </p>

                  <button className="btn btn-outline-primary">
                    View offer
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

export default Offers
