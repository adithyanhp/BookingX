import SearchBox from './SearchBox'

function Hero() {
  return (
    <section className="hero-section">

      <div className="hero-overlay"></div>

      <div className="container position-relative">

        <div className="hero-content">

          <div className="hero-badge">
            <i className="bi bi-stars"></i>
            Find your perfect stay
          </div>

          <h1>
            Discover your next
            <br />
            <span>unforgettable stay.</span>
          </h1>

          <p>
            Search hotels, resorts and unique stays
            at the best prices.
          </p>

        </div>

      </div>

      <SearchBox />

    </section>
  )
}

export default Hero
