function HotelCard({ hotel, onViewDetails }) {

    // =========================================================
    // SAFETY CHECK
    // =========================================================

    if (!hotel || typeof hotel !== "object") {
        return null;
    }


    // =========================================================
    // HOTEL DATA
    // =========================================================

    const hotelId = hotel.id;

    const hotelName =
        hotel.name || "Hotel";

    const city =
        hotel.city || "Unknown City";

    const state =
        hotel.state || "";

    const description =
        hotel.description ||
        "Enjoy a comfortable and memorable stay with excellent hospitality and convenient facilities.";

    const rating =
        hotel.star_rating !== null &&
        hotel.star_rating !== undefined &&
        hotel.star_rating !== ""
            ? hotel.star_rating
            : "N/A";

    const price =
        hotel.price_from !== null &&
        hotel.price_from !== undefined &&
        hotel.price_from !== ""
            ? Number(hotel.price_from)
            : 0;


    // =========================================================
    // HOTEL IMAGE
    // =========================================================

    const rawImage =
        hotel.image ||
        hotel.image_url ||
        hotel.hotel_image ||
        hotel.hotel_image_url ||
        hotel.photo ||
        hotel.photo_url ||
        null;


    // Django backend URL
    const API_BASE_URL = "http://127.0.0.1:8000";


    let image = null;


    if (rawImage) {

        // If Django returns:
        // /media/hotels/hotel.jpg
        if (rawImage.startsWith("/")) {

            image = `${API_BASE_URL}${rawImage}`;

        }

        // If API already returns:
        // http://127.0.0.1:8000/media/...
        else if (
            rawImage.startsWith("http://") ||
            rawImage.startsWith("https://")
        ) {

            image = rawImage;

        }

        // Fallback
        else {

            image = `${API_BASE_URL}/${rawImage}`;

        }

    }


    // =========================================================
    // VIEW DETAILS
    // =========================================================

    const handleViewDetails = () => {

        if (!hotelId) {

            console.warn(
                "Cannot view hotel details: hotel ID is missing.",
                hotel
            );

            return;

        }


        if (typeof onViewDetails === "function") {

            onViewDetails(hotelId);

        }

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <article className="hotel-card">


            {/* =================================================
                HOTEL IMAGE
            ================================================= */}

            <div className="hotel-image">

                {image ? (

                    <img
                        src={image}
                        alt={hotelName}
                        loading="lazy"
                        onError={(event) => {

                            console.error(
                                "Hotel image failed to load:",
                                image
                            );

                            event.currentTarget.style.display = "none";

                        }}
                    />

                ) : (

                    <div className="hotel-image-placeholder">

                        <i className="bi bi-building"></i>

                        <span>
                            Hotel Image
                        </span>

                    </div>

                )}

            </div>


            {/* =================================================
                HOTEL CONTENT
            ================================================= */}

            <div className="hotel-content">


                {/* =================================================
                    RATING
                ================================================= */}

                <div className="hotel-rating">

                    <i className="bi bi-star-fill"></i>

                    <span>
                        {rating}
                    </span>

                </div>


                {/* =================================================
                    HOTEL NAME
                ================================================= */}

                <h2>
                    {hotelName}
                </h2>


                {/* =================================================
                    LOCATION
                ================================================= */}

                <p className="hotel-location">

                    <i className="bi bi-geo-alt-fill"></i>

                    <span>

                        {city}

                        {state && (
                            <>
                                , {state}
                            </>
                        )}

                    </span>

                </p>


                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <p className="hotel-description">

                    {description}

                </p>


                {/* =================================================
                    BOTTOM
                ================================================= */}

                <div className="hotel-bottom">


                    {/* PRICE */}

                    <div className="hotel-price">

                        <small>
                            Starting from
                        </small>


                        <div>

                            <strong>
                                ₹{price.toLocaleString("en-IN")}
                            </strong>

                            <span>
                                /night
                            </span>

                        </div>

                    </div>


                    {/* VIEW DETAILS */}

                    <button
                        type="button"
                        className="hotel-details-button"
                        onClick={handleViewDetails}
                        disabled={!hotelId}
                    >

                        <span>
                            View Details
                        </span>

                        <i className="bi bi-arrow-right"></i>

                    </button>

                </div>

            </div>

        </article>

    );

}


export default HotelCard;
