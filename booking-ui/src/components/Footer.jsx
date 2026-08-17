function Footer() {
  return (
    <footer className="site-footer">

      <div className="container">

        <div className="row g-5">

          {/* Brand */}

          <div className="col-lg-4 col-md-6">

            <a
              href="/"
              className="footer-brand"
            >

              <span className="footer-logo-icon">
                <i className="bi bi-buildings"></i>
              </span>

              <span>
                Booking<span>X</span>
              </span>

            </a>


            <p className="footer-description">
              Your trusted travel partner for finding
              hotels, flights, tours and more. Discover
              your next adventure with BookingX.
            </p>


            {/* Social icons */}

            <div className="footer-social">

              <a href="/" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>

              <a href="/" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>

              <a href="/" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>

              <a href="/" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>

            </div>

          </div>


          {/* Company */}

          <div className="col-lg-2 col-md-6">

            <h3 className="footer-title">
              Company
            </h3>

            <ul className="footer-links">

              <li>
                <a href="/">
                  About Us
                </a>
              </li>

              <li>
                <a href="/">
                  Careers
                </a>
              </li>

              <li>
                <a href="/">
                  Blog
                </a>
              </li>

              <li>
                <a href="/">
                  Contact Us
                </a>
              </li>

            </ul>

          </div>


          {/* Support */}

          <div className="col-lg-2 col-md-6">

            <h3 className="footer-title">
              Support
            </h3>

            <ul className="footer-links">

              <li>
                <a href="/">
                  Help Center
                </a>
              </li>

              <li>
                <a href="/">
                  FAQs
                </a>
              </li>

              <li>
                <a href="/">
                  Cancellation
                </a>
              </li>

              <li>
                <a href="/">
                  Terms & Conditions
                </a>
              </li>

            </ul>

          </div>


          {/* Contact */}

          <div className="col-lg-4 col-md-6">

            <h3 className="footer-title">
              Contact Us
            </h3>


            <div className="footer-contact">

              <div className="footer-contact-item">

                <i className="bi bi-geo-alt"></i>

                <span>
                  Kochi, Kerala, India
                </span>

              </div>


              <div className="footer-contact-item">

                <i className="bi bi-envelope"></i>

                <span>
                  support@bookingx.com
                </span>

              </div>


              <div className="footer-contact-item">

                <i className="bi bi-telephone"></i>

                <span>
                  +91 98765 43210
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Bottom */}

        <div className="footer-bottom">

          <p>
            © 2026 BookingX. All rights reserved.
          </p>

          <div>

            <a href="/">
              Privacy Policy
            </a>

            <a href="/">
              Terms of Service
            </a>

          </div>

        </div>

      </div>

    </footer>
  )
}

export default Footer

