function WhyChooseUs() {
  const features = [
    {
      icon: 'bi-tag',
      title: 'Best Price Guarantee',
      description:
        'Find competitive prices and great deals for your next stay.',
    },
    {
      icon: 'bi-shield-check',
      title: 'Secure Booking',
      description:
        'Your booking information and personal details are protected.',
    },
    {
      icon: 'bi-headset',
      title: '24/7 Support',
      description:
        'Our support team is available whenever you need assistance.',
    },
    {
      icon: 'bi-star',
      title: 'Trusted Experiences',
      description:
        'Choose from carefully selected hotels and highly rated stays.',
    },
  ]

  return (
    <section className="why-section">

      <div className="container">

        <div className="row align-items-center g-5">

          {/* Left side */}

          <div className="col-lg-5">

            <span className="section-label">
              WHY CHOOSE US
            </span>

            <h2 className="why-title">
              Everything you need for a better stay
            </h2>

            <p className="why-description">
              We make hotel booking simple, secure and
              convenient so you can focus on enjoying
              your trip.
            </p>

            <button className="btn btn-primary mt-3">
              Learn More
              <i className="bi bi-arrow-right ms-2"></i>
            </button>

          </div>


          {/* Right side */}

          <div className="col-lg-7">

            <div className="row g-4">

              {features.map((feature) => (

                <div
                  className="col-md-6"
                  key={feature.title}
                >

                  <div className="feature-card">

                    <div className="feature-icon">
                      <i className={`bi ${feature.icon}`}></i>
                    </div>

                    <h3>
                      {feature.title}
                    </h3>

                    <p>
                      {feature.description}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default WhyChooseUs
