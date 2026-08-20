import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import {
    authenticatedFetch,
    getRoom,
    getHotel,
} from "../services/api";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

function BookingForm() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState([null, null]);
    const [checkIn, checkOut] = dateRange;

    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Room / hotel details
    const [roomDetails, setRoomDetails] = useState(null);
    const [hotelDetails, setHotelDetails] = useState(null);
    const [roomLoading, setRoomLoading] = useState(true);

    // Booking success modal
    const [bookingSuccess, setBookingSuccess] = useState(null);


    /*
    =========================================================
    LOAD ROOM + HOTEL DETAILS
    =========================================================
    */

    useEffect(() => {
        const loadRoomDetails = async () => {
            try {
                setRoomLoading(true);
                setError("");

                const room = await getRoom(roomId);

                console.log("ROOM API RESPONSE:", room);

                setRoomDetails(room);


                /*
                =================================================
                FIND HOTEL ID
                =================================================
                */

                let hotelId = null;

                // Case 1:
                // room.hotel is an ID
                if (
                    room?.hotel !== undefined &&
                    room?.hotel !== null &&
                    typeof room.hotel !== "object"
                ) {
                    hotelId = room.hotel;
                }

                // Case 2:
                // room.hotel is an object
                else if (
                    room?.hotel &&
                    typeof room.hotel === "object"
                ) {
                    hotelId =
                        room.hotel.id ||
                        room.hotel.pk;
                }

                // Case 3:
                // Some serializers may return hotel_id
                else if (room?.hotel_id) {
                    hotelId = room.hotel_id;
                }


                /*
                =================================================
                LOAD HOTEL DETAILS
                =================================================
                */

                if (hotelId) {
                    try {
                        const hotel = await getHotel(hotelId);

                        console.log(
                            "HOTEL API RESPONSE:",
                            hotel
                        );

                        setHotelDetails(hotel);

                    } catch (hotelError) {
                        console.error(
                            "Failed to load hotel details:",
                            hotelError
                        );
                    }
                }

            } catch (error) {
                console.error(
                    "Failed to load room details:",
                    error
                );

                setError(
                    "Unable to load room details. Please try again."
                );

            } finally {
                setRoomLoading(false);
            }
        };

        loadRoomDetails();
    }, [roomId]);


    /*
    =========================================================
    FORMAT DATE FOR API
    =========================================================
    */

    const formatDate = (date) => {
        if (!date) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    /*
    =========================================================
    FORMAT DATE FOR DISPLAY
    =========================================================
    */

    const formatDisplayDate = (date) => {
        if (!date) return "Select date";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    /*
    =========================================================
    GUEST COUNTER
    =========================================================
    */

    const handleGuestChange = (change) => {
        setGuests((current) => {
            const newValue = Number(current) + change;

            if (newValue < 1) return 1;
            if (newValue > 20) return 20;

            return newValue;
        });
    };


    /*
    =========================================================
    GET HOTEL NAME
    =========================================================
    */

    const getHotelName = () => {
        return (
            hotelDetails?.name ||
            hotelDetails?.hotel_name ||
            roomDetails?.hotel?.name ||
            roomDetails?.hotel_name ||
            "Hotel"
        );
    };


    /*
    =========================================================
    GET HOTEL LOCATION
    =========================================================
    */

    const getHotelLocation = () => {
        if (hotelDetails) {

            // Most likely field
            if (hotelDetails.city) {
                return hotelDetails.city;
            }

            if (hotelDetails.location) {
                return hotelDetails.location;
            }

            if (hotelDetails.address) {
                return hotelDetails.address;
            }

            // If your API uses destination
            if (hotelDetails.destination) {
                return hotelDetails.destination;
            }
        }

        // Fallback to room response
        return (
            roomDetails?.hotel?.city ||
            roomDetails?.hotel?.location ||
            roomDetails?.city ||
            roomDetails?.location ||
            "Location unavailable"
        );
    };


    /*
    =========================================================
    GET ROOM TYPE
    =========================================================
    */

    const getRoomType = () => {
        return (
            roomDetails?.room_type ||
            roomDetails?.room_name ||
            roomDetails?.roomType ||
            roomDetails?.type ||
            roomDetails?.name ||
            "Room"
        );
    };


    /*
    =========================================================
    BOOKING SUBMIT
    =========================================================
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Validate dates
        if (!checkIn || !checkOut) {
            setError(
                "Please select both check-in and check-out dates."
            );
            return;
        }

        if (checkOut <= checkIn) {
            setError(
                "Check-out date must be after the check-in date."
            );
            return;
        }

        // Check refresh token
        const refreshToken =
            localStorage.getItem("refresh_token");

        if (!refreshToken) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await authenticatedFetch(
                "http://127.0.0.1:8000/api/bookings/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        room: Number(roomId),
                        check_in: formatDate(checkIn),
                        check_out: formatDate(checkOut),
                        guests: Number(guests),
                    }),
                }
            );

            const data = await response.json();

            /*
            =================================================
            BOOKING ERROR
            =================================================
            */

            if (!response.ok) {
                setError(
                    data.room?.[0] ||
                    data.check_in?.[0] ||
                    data.check_out?.[0] ||
                    data.guests?.[0] ||
                    data.detail ||
                    "Booking failed. Please try again."
                );

                return;
            }


            /*
            =================================================
            BOOKING SUCCESS
            =================================================
            */

            console.log(
                "BOOKING API RESPONSE:",
                data
            );

            setBookingSuccess({
                reference:
                    data.booking_reference ||
                    data.reference ||
                    "Booking confirmed",

                hotelName: getHotelName(),

                location: getHotelLocation(),

                roomType: getRoomType(),

                checkIn: formatDisplayDate(checkIn),

                checkOut: formatDisplayDate(checkOut),

                guests: Number(guests),
            });

        } catch (error) {
            console.error(
                "Booking error:",
                error
            );

            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };


    /*
    =========================================================
    SUCCESS MODAL - VIEW BOOKINGS
    =========================================================
    */

    const handleViewBookings = () => {
        navigate("/bookings");
    };


    /*
    =========================================================
    SUCCESS MODAL - CLOSE
    =========================================================
    */

    const handleCloseSuccess = () => {
        setBookingSuccess(null);
    };


    return (
        <div className="booking-form-page">

            <div className="container">

                <div className="booking-form-wrapper">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="booking-form-header">

                        <div className="booking-label-wrapper">

                            <span className="booking-label">
                                COMPLETE YOUR RESERVATION
                            </span>

                        </div>

                        <h1>
                            Book Your Room
                        </h1>

                        <p>
                            Select your dates and number of guests to
                            complete your reservation.
                        </p>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="booking-error">

                            <i className="bi bi-exclamation-circle-fill"></i>

                            <div>

                                <strong>
                                    Booking could not be completed
                                </strong>

                                <span>
                                    {error}
                                </span>

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        MAIN BOOKING FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="booking-form-card"
                    >

                        {/* =================================================
                            DATE SECTION
                        ================================================= */}

                        <div className="booking-section">

                            <div className="booking-section-header">

                                <div className="booking-section-icon">

                                    <i className="bi bi-calendar3"></i>

                                </div>

                                <div>

                                    <h2>
                                        Check-in & Check-out
                                    </h2>

                                    <p>
                                        Select your arrival and departure
                                        dates.
                                    </p>

                                </div>

                            </div>


                            <DatePicker
                                selected={checkIn}
                                onChange={(update) => {
                                    setDateRange(update);
                                }}
                                startDate={checkIn}
                                endDate={checkOut}
                                selectsRange
                                minDate={new Date()}
                                monthsShown={1}
                                dateFormat="dd MMM yyyy"
                                placeholderText="Select your stay dates"
                                className="booking-date-input"
                                wrapperClassName="booking-datepicker"
                            />


                            {/* Selected Dates */}

                            <div className="selected-dates">

                                <div
                                    className={`selected-date-box ${
                                        checkIn
                                            ? "date-selected"
                                            : ""
                                    }`}
                                >

                                    <div className="selected-date-icon">

                                        <i className="bi bi-box-arrow-in-right"></i>

                                    </div>

                                    <div>

                                        <small>
                                            CHECK-IN
                                        </small>

                                        <strong>
                                            {formatDisplayDate(checkIn)}
                                        </strong>

                                    </div>

                                </div>


                                <div className="date-arrow">

                                    <i className="bi bi-arrow-right"></i>

                                </div>


                                <div
                                    className={`selected-date-box ${
                                        checkOut
                                            ? "date-selected"
                                            : ""
                                    }`}
                                >

                                    <div className="selected-date-icon">

                                        <i className="bi bi-box-arrow-right"></i>

                                    </div>

                                    <div>

                                        <small>
                                            CHECK-OUT
                                        </small>

                                        <strong>
                                            {formatDisplayDate(checkOut)}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            GUEST SECTION
                        ================================================= */}

                        <div className="booking-section">

                            <div className="booking-section-header">

                                <div className="booking-section-icon">

                                    <i className="bi bi-people"></i>

                                </div>

                                <div>

                                    <h2>
                                        Guests
                                    </h2>

                                    <p>
                                        How many guests will be staying?
                                    </p>

                                </div>

                            </div>


                            <div className="guest-selector">

                                <div className="guest-info">

                                    <div className="guest-icon">

                                        <i className="bi bi-person"></i>

                                    </div>

                                    <div>

                                        <strong>
                                            Guests
                                        </strong>

                                        <span>
                                            Maximum 20 guests
                                        </span>

                                    </div>

                                </div>


                                <div className="guest-controls">

                                    <button
                                        type="button"
                                        className="guest-button"
                                        onClick={() =>
                                            handleGuestChange(-1)
                                        }
                                        disabled={guests <= 1}
                                        aria-label="Decrease guests"
                                    >
                                        <i className="bi bi-dash"></i>
                                    </button>


                                    <span className="guest-count">
                                        {guests}
                                    </span>


                                    <button
                                        type="button"
                                        className="guest-button"
                                        onClick={() =>
                                            handleGuestChange(1)
                                        }
                                        disabled={guests >= 20}
                                        aria-label="Increase guests"
                                    >
                                        <i className="bi bi-plus"></i>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            SECURITY SUMMARY
                        ================================================= */}

                        <div className="booking-summary">

                            <div className="summary-icon">

                                <i className="bi bi-shield-check"></i>

                            </div>

                            <div>

                                <strong>
                                    Secure reservation
                                </strong>

                                <span>
                                    Your booking details are securely
                                    processed.
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            SUBMIT BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="confirm-booking-button"
                            disabled={
                                loading ||
                                roomLoading ||
                                !checkIn ||
                                !checkOut
                            }
                        >

                            {loading ? (
                                <>

                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>

                                    Processing Booking...

                                </>
                            ) : (
                                <>

                                    <i className="bi bi-calendar-check"></i>

                                    Confirm Booking

                                    <i className="bi bi-arrow-right"></i>

                                </>
                            )}

                        </button>


                        <p className="booking-footer-text">

                            By confirming your booking, you agree to
                            our booking terms and conditions.

                        </p>

                    </form>

                </div>

            </div>


            {/* =========================================================
                BOOKING SUCCESS MODAL
            ========================================================= */}

            {bookingSuccess && (

                <div
                    className="booking-success-overlay"
                    onClick={handleCloseSuccess}
                >

                    <div
                        className="booking-success-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Success Icon */}

                        <div className="booking-success-icon">

                            <i className="bi bi-check-lg"></i>

                        </div>


                        {/* Heading */}

                        <div className="booking-success-heading">

                            <span className="booking-success-label">
                                BOOKING CONFIRMED
                            </span>

                            <h2>
                                Your stay is booked!
                            </h2>

                            <p>
                                Your reservation has been successfully
                                confirmed.
                            </p>

                        </div>


                        {/* Booking Reference */}

                        <div className="booking-reference">

                            <span>
                                BOOKING REFERENCE
                            </span>

                            <strong>
                                {bookingSuccess.reference}
                            </strong>

                        </div>


                        {/* Hotel Details */}

                        <div className="booking-success-details">

                            <div className="booking-success-detail">

                                <div className="booking-success-detail-icon">
                                    <i className="bi bi-building"></i>
                                </div>

                                <div>

                                    <small>
                                        HOTEL
                                    </small>

                                    <strong>
                                        {bookingSuccess.hotelName}
                                    </strong>

                                </div>

                            </div>


                            <div className="booking-success-detail">

                                <div className="booking-success-detail-icon">
                                    <i className="bi bi-geo-alt"></i>
                                </div>

                                <div>

                                    <small>
                                        LOCATION
                                    </small>

                                    <strong>
                                        {bookingSuccess.location}
                                    </strong>

                                </div>

                            </div>


                            <div className="booking-success-detail">

                                <div className="booking-success-detail-icon">
                                    <i className="bi bi-door-open"></i>
                                </div>

                                <div>

                                    <small>
                                        ROOM TYPE
                                    </small>

                                    <strong>
                                        {bookingSuccess.roomType}
                                    </strong>

                                </div>

                            </div>


                            <div className="booking-success-detail">

                                <div className="booking-success-detail-icon">
                                    <i className="bi bi-people"></i>
                                </div>

                                <div>

                                    <small>
                                        GUESTS
                                    </small>

                                    <strong>
                                        {bookingSuccess.guests}
                                        {bookingSuccess.guests === 1
                                            ? " Guest"
                                            : " Guests"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* Dates */}

                        <div className="booking-success-dates">

                            <div>

                                <small>
                                    CHECK-IN
                                </small>

                                <strong>
                                    {bookingSuccess.checkIn}
                                </strong>

                            </div>


                            <div className="booking-success-date-arrow">

                                <i className="bi bi-arrow-right"></i>

                            </div>


                            <div>

                                <small>
                                    CHECK-OUT
                                </small>

                                <strong>
                                    {bookingSuccess.checkOut}
                                </strong>

                            </div>

                        </div>


                        {/* Actions */}

                        <div className="booking-success-actions">

                            <button
                                type="button"
                                className="booking-success-primary"
                                onClick={handleViewBookings}
                            >

                                <i className="bi bi-calendar-check"></i>

                                View My Bookings

                            </button>


                            <button
                                type="button"
                                className="booking-success-secondary"
                                onClick={handleCloseSuccess}
                            >

                                Continue Browsing

                            </button>

                        </div>


                        <p className="booking-success-note">

                            <i className="bi bi-shield-check"></i>

                            Your booking has been securely saved.

                        </p>

                    </div>

                </div>

            )}

        </div>
    );
}

export default BookingForm;
