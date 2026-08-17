function Navbar() {
  return (
    <header className="site-header">

      <nav className="navbar navbar-expand-lg">

        <div className="container">

          {/* Logo */}

          <a className="navbar-brand booking-logo" href="/">

            <span className="logo-icon">
              <i className="bi bi-buildings"></i>
            </span>

            <span>
              Booking<span className="logo-x">X</span>
            </span>

          </a>


          {/* Mobile menu button */}

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list"></i>
          </button>


          {/* Navigation */}

          <div
            className="collapse navbar-collapse"
            id="mainNavbar"
          >

            <ul className="navbar-nav mx-auto booking-nav">

              <li className="nav-item">
                <a
                  className="nav-link active"
                  href="/"
                >
                  <i className="bi bi-building"></i>
                  Hotels
                </a>
              </li>


              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/"
                >
                  <i className="bi bi-airplane"></i>
                  Flights
                </a>
              </li>


              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/"
                >
                  <i className="bi bi-map"></i>
                  Tours
                </a>
              </li>


              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/"
                >
                  <i className="bi bi-car-front"></i>
                  Cabs
                </a>
              </li>

            </ul>


            {/* Right side */}

            <div className="navbar-actions">

              <button className="login-button">
                <i className="bi bi-person"></i>
                Login
              </button>

              <button className="register-button">
                Register
                <i className="bi bi-arrow-right"></i>
              </button>

            </div>

          </div>

        </div>

      </nav>

    </header>
  )
}

export default Navbar

