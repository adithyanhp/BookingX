function HotelCard({ hotel, onViewDetails }) {
    return (
        <div className="hotel-card">
            <div className="hotel-image">
                <div>Hotel Image</div>
            </div>

            <div className="hotel-content">
                <div className="hotel-rating">
                    ⭐ {hotel.star_rating}
                </div>

                <h2>{hotel.name}</h2>

                <p className="hotel-location">
                    📍 {hotel.city}, {hotel.state}
                </p>

                <p className="hotel-description">
                    {hotel.description}
                </p>

                <div className="hotel-bottom">
                    <div>
                        <small>Starting from</small>
                        <strong>₹{hotel.price_from}</strong>
                        <span>/night</span>
                    </div>

                    <button onClick={() => onViewDetails(hotel.id)}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HotelCard;
