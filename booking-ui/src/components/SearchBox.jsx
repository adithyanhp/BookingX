function SearchBox() {
  return (
    <div className="booking-search">

      {/* Location */}
      <div className="search-item">

        <div className="search-icon">
          <i className="bi bi-geo-alt"></i>
        </div>

        <div className="search-content">
          <small>Location</small>
          <strong>Where are you going?</strong>
        </div>

      </div>


      {/* Check in */}
      <div className="search-item">

        <div className="search-icon">
          <i className="bi bi-calendar3"></i>
        </div>

        <div className="search-content">
          <small>Check in</small>
          <strong>Select date</strong>
        </div>

      </div>


      {/* Check out */}
      <div className="search-item">

        <div className="search-icon">
          <i className="bi bi-calendar3"></i>
        </div>

        <div className="search-content">
          <small>Check out</small>
          <strong>Select date</strong>
        </div>

      </div>


      {/* Guests */}
      <div className="search-item">

        <div className="search-icon">
          <i className="bi bi-people"></i>
        </div>

        <div className="search-content">
          <small>Guests & Rooms</small>
          <strong>2 Guests, 1 Room</strong>
        </div>

      </div>


      {/* Search button */}
      <button className="search-button">

        <i className="bi bi-search"></i>

        Search

      </button>

    </div>
  )
}

export default SearchBox
