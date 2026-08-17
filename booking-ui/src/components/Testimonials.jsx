function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sananya Satheesh',
      location: 'Bangalore, India',
      rating: 5,
      image: '/user-1.jpg',
      review:
        'The booking process was incredibly easy. I found a great hotel at a very good price and the entire experience was smooth.',
    },
    {
      id: 2,
      name: 'Ananya Menon',
      location: 'Kochi, India',
      rating: 5,
      image: '/user-2.jpg',
      review:
        'I loved how easy it was to compare hotels and find exactly what I was looking for. Definitely using this again.',
    },
    {
      id: 3,
      name: 'Arjun Nair',
      location: 'Mumbai, India',
      rating: 4,
      image: '/user-3.jpg',
      review:
        'The hotel options were excellent and the booking confirmation was quick. Overall, a really good experience.',
    },
  ]

  return (
    <section className="testimonials-section">

      <div className="container">

        {/* Heading */}

        <div className="section-heading">

          <span className="section-label">
            TESTIMONIALS
          </span>

          <h2>
            What our travelers say
          </h2>

          <p>
            Thousands of travelers trust us to help them
            find their perfect stay.
          </p>

        </div>


        {/* Testimonials */}

        <div className="row g-4">

          {testimonials.map((testimonial) => (

            <div
              className="col-lg-4 col-md-6"
              key={testimonial.id}
            >

              <div className="testimonial-card">

                {/* Stars */}

                <div className="testimonial-rating">

                  {[...Array(testimonial.rating)].map(
                    (_, index) => (
                      <i
                        className="bi bi-star-fill"
                        key={index}
                      ></i>
                    )
                  )}

                </div>


                {/* Review */}

                <p className="testimonial-review">
                  "{testimonial.review}"
                </p>


                {/* User */}

                <div className="testimonial-user">

                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                  />

                  <div>

                    <h3>
                      {testimonial.name}
                    </h3>

                    <span>
                      <i className="bi bi-geo-alt"></i>
                      {testimonial.location}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}

export default Testimonials

