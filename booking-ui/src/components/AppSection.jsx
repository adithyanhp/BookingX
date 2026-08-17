function AppSection() {
  return (
    <section className="app-section">

      <div className="container">

        <div className="row align-items-center g-5">

          {/* Left content */}

          <div className="col-lg-6">

            <span className="section-label">
              TRAVEL WITH US
            </span>

            <h2 className="app-title">
              Your next adventure
              is just a tap away
            </h2>

            <p className="app-description">
              Discover hotels, manage your bookings and
              find your next destination wherever you go.
              Everything you need for your trip in one place.
            </p>

            {/* Trust points */}

            <div className="app-features">

              <div className="app-feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Easy and secure booking</span>
              </div>

              <div className="app-feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Exclusive deals and offers</span>
              </div>

              <div className="app-feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>24/7 customer support</span>
              </div>

            </div>


            {/* Download buttons */}

            <div className="app-buttons">

              <button className="store-button">

                <i className="bi bi-google-play"></i>

                <div>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </div>

              </button>


              <button className="store-button">

                <i className="bi bi-apple"></i>

                <div>
                  <small>DOWNLOAD ON THE</small>
                  <strong>App Store</strong>
                </div>

              </button>

            </div>

          </div>


          {/* Right visual */}

          <div className="col-lg-6">

            <div className="app-visual">

              <div className="app-circle"></div>

              <img
                src="/app-preview.png"
                alt="Booking app preview"
                className="app-preview"
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default AppSection

