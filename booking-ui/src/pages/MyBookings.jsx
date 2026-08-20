import { useEffect, useState } from "react";
import { authenticatedFetch } from "../services/api";
import "./MyBookings.css";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelMessage, setCancelMessage] = useState("");
    const [sessionExpired, setSessionExpired] = useState(false);

    // =========================================================
    // LOAD BOOKINGS
    // =========================================================

    const loadBookings = async () => {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            setBookings([]);
            setLoading(false);
            setSessionExpired(true);
            return;
        }

        try {
            setLoading(true);

            const response = await authenticatedFetch(
                "http://127.0.0.1:8000/api/bookings/",
                {
                    method: "GET",
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                console.error(
                    "Authentication failed. Refresh token may have expired."
                );

                setSessionExpired(true);
                setBookings([]);

                return;
            }

            if (response.ok) {
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    console.error(
                        "Unexpected bookings response:",
                        data
                    );

                    setBookings([]);
                }
            } else {
                console.error(
                    "Failed to load bookings:",
                    data
                );

                setBookings([]);
            }
        } catch (error) {
            console.error(
                "Error loading bookings:",
                error
            );

            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD BOOKINGS WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {
        loadBookings();
    }, []);

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    const cancelBooking = async (id) => {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            setSessionExpired(true);
            return;
        }

        setCancellingId(id);
        setCancelMessage("");

        try {
            const response = await authenticatedFetch(
                `http://127.0.0.1:8000/api/bookings/${id}/cancel/`,
                {
                    method: "PATCH",
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                setSessionExpired(true);

                setCancelMessage(
                    "Your login session has expired."
                );

                return;
            }

            if (response.ok) {
                setBookingToCancel(null);
                setCancelMessage("");

                await loadBookings();
            } else {
                console.error(
                    "Cancellation failed:",
                    data
                );

                setCancelMessage(
                    data.detail ||
                    data.message ||
                    data.error ||
                    "Unable to cancel booking."
                );
            }
        } catch (error) {
            console.error(
                "Cancellation error:",
                error
            );

            setCancelMessage(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // =========================================================
    // GET HOTEL NAME
    // =========================================================

    const getHotelName = (booking) => {
        return (
            booking.hotel_name ||
            booking.hotel?.name ||
            booking.room?.hotel?.name ||
            booking.room_details?.hotel?.name ||
            "Hotel"
        );
    };

    // =========================================================
    // GET HOTEL LOCATION
    // =========================================================

    const getHotelLocation = (booking) => {
        return (
            booking.hotel_location ||
            booking.location ||
            booking.hotel?.city ||
            booking.room?.hotel?.city ||
            booking.room_details?.hotel?.city ||
            "Location unavailable"
        );
    };

    // =========================================================
    // GET ROOM TYPE
    // =========================================================

    const getRoomType = (booking) => {
        return (
            booking.room_type ||
            booking.room?.room_type_display ||
            booking.room?.room_type ||
            booking.room?.name ||
            booking.room_details?.room_type ||
            booking.room_details?.name ||
            "Room"
        );
    };

    // =========================================================
    // SESSION EXPIRED
    // =========================================================

    if (sessionExpired) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <h2>
                            Your login session has expired
                        </h2>

                        <p>
                            Please log in again to view and manage
                            your bookings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // NOT LOGGED IN
    // =========================================================

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-person-lock"></i>
                        </div>

                        <h2>
                            Login required
                        </h2>

                        <p>
                            Please login to view and manage your
                            bookings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-loading">
                        <div className="spinner"></div>

                        <h3>
                            Loading your bookings...
                        </h3>

                        <p>
                            Please wait a moment.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (
        <div className="bookings-page">

            <div className="bookings-container">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="bookings-header">

                    <div>
                        <span className="bookings-label">
                            <i className="bi bi-calendar-check"></i>
                            YOUR TRIPS
                        </span>

                        <h1>
                            My Bookings
                        </h1>

                        <p>
                            Manage your hotel reservations and view
                            your booking details.
                        </p>
                    </div>

                    <div className="booking-count">
                        <span>
                            {bookings.length}
                        </span>

                        <small>
                            {bookings.length === 1
                                ? "Booking"
                                : "Bookings"}
                        </small>
                    </div>

                </div>


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {bookings.length === 0 ? (

                    <div className="bookings-empty">

                        <div className="empty-icon">
                            <i className="bi bi-calendar-x"></i>
                        </div>

                        <h2>
                            No bookings yet
                        </h2>

                        <p>
                            You haven't made any hotel bookings yet.
                            Your reservations will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="bookings-list">

                        {bookings.map((booking) => {

                            const hotelName =
                                getHotelName(booking);

                            const hotelLocation =
                                getHotelLocation(booking);

                            const roomType =
                                getRoomType(booking);

                            return (

                                <div
                                    className={`booking-card ${
                                        booking.status === "cancelled"
                                            ? "booking-cancelled"
                                            : booking.status === "completed"
                                            ? "booking-completed"
                                            : ""
                                    }`}
                                    key={booking.id}
                                >

                                    {/* =================================================
                                        CARD HEADER
                                    ================================================= */}

                                    <div className="booking-card-header">

                                        <div className="booking-reference">

                                            <div className="booking-icon">
                                                <i className="bi bi-buildings"></i>
                                            </div>

                                            <div>
                                                <span>
                                                    BOOKING REFERENCE
                                                </span>

                                                <strong>
                                                    {booking.booking_reference}
                                                </strong>
                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div
                                            className={`booking-status ${
                                                booking.status === "cancelled"
                                                    ? "status-cancelled"
                                                    : booking.status === "completed"
                                                    ? "status-completed"
                                                    : booking.status === "confirmed"
                                                    ? "status-confirmed"
                                                    : "status-pending"
                                            }`}
                                        >

                                            <span className="status-dot"></span>

                                            {booking.status}

                                        </div>

                                    </div>


                                    {/* =================================================
                                        HOTEL INFORMATION
                                    ================================================= */}

                                    <div className="booking-hotel">

                                        {/* HOTEL */}

                                        <div className="booking-hotel-main">

                                            <div className="hotel-main-icon">
                                                <i className="bi bi-building"></i>
                                            </div>

                                            <div className="hotel-info">

                                                <span className="hotel-info-label">
                                                    HOTEL
                                                </span>

                                                <h2>
                                                    {hotelName}
                                                </h2>

                                                <div className="hotel-location">

                                                    <i className="bi bi-geo-alt-fill"></i>

                                                    <span>
                                                        {hotelLocation}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ROOM TYPE */}

                                        <div className="room-type-badge">

                                            <i className="bi bi-door-open"></i>

                                            <span>
                                                {roomType}
                                            </span>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        DATES
                                    ================================================= */}

                                    <div className="booking-dates">

                                        <div className="date-block">

                                            <span className="date-label">
                                                CHECK-IN
                                            </span>

                                            <strong>
                                                {booking.check_in}
                                            </strong>

                                            <small>
                                                Arrival
                                            </small>

                                        </div>


                                        <div className="date-divider">

                                            <span></span>

                                            <i className="bi bi-arrow-right"></i>

                                            <span></span>

                                        </div>


                                        <div className="date-block">

                                            <span className="date-label">
                                                CHECK-OUT
                                            </span>

                                            <strong>
                                                {booking.check_out}
                                            </strong>

                                            <small>
                                                Departure
                                            </small>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        BOOKING DETAILS
                                    ================================================= */}

                                    <div className="booking-details">

                                        <div className="detail-item">

                                            <div className="detail-icon">
                                                <i className="bi bi-people"></i>
                                            </div>

                                            <div>
                                                <span>
                                                    Guests
                                                </span>

                                                <strong>
                                                    {booking.guests}
                                                </strong>
                                            </div>

                                        </div>


                                        <div className="detail-item">

                                            <div className="detail-icon">
                                                <i className="bi bi-credit-card"></i>
                                            </div>

                                            <div>
                                                <span>
                                                    Total price
                                                </span>

                                                <strong>
                                                    ₹{booking.total_price}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        FOOTER
                                    ================================================= */}

                                    <div className="booking-card-footer">

                                        <div className="booking-created">

                                            <i className="bi bi-clock-history"></i>

                                            <span>
                                                Booking #{booking.id}
                                            </span>

                                        </div>


                                        {/* PENDING / CONFIRMED */}

                                        {(
                                            booking.status === "pending" ||
                                            booking.status === "confirmed"
                                        ) ? (

                                            <button
                                                className="cancel-booking-btn"
                                                onClick={() => {
                                                    setBookingToCancel(booking);
                                                    setCancelMessage("");
                                                }}
                                                disabled={
                                                    cancellingId === booking.id
                                                }
                                            >

                                                <i
                                                    className={
                                                        cancellingId === booking.id
                                                            ? "bi bi-arrow-repeat"
                                                            : "bi bi-x-circle"
                                                    }
                                                ></i>

                                                {cancellingId === booking.id
                                                    ? "Cancelling..."
                                                    : "Cancel Booking"}

                                            </button>

                                        ) : booking.status === "completed" ? (

                                            <div className="completed-message">

                                                <i className="bi bi-check-circle-fill"></i>

                                                Booking completed

                                            </div>

                                        ) : booking.status === "cancelled" ? (

                                            <div className="cancelled-message">

                                                <i className="bi bi-x-circle-fill"></i>

                                                Booking cancelled

                                            </div>

                                        ) : null}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>


            {/* =========================================================
                CANCELLATION MODAL
            ========================================================= */}

            {bookingToCancel && (

                <div
                    className="cancel-modal-overlay"
                    onClick={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            cancellingId === null
                        ) {
                            setBookingToCancel(null);
                            setCancelMessage("");
                        }

                    }}
                >

                    <div className="cancel-modal">

                        {/* CLOSE */}

                        <button
                            className="cancel-modal-close"
                            onClick={() => {
                                setBookingToCancel(null);
                                setCancelMessage("");
                            }}
                            disabled={cancellingId !== null}
                            aria-label="Close"
                        >

                            <i className="bi bi-x"></i>

                        </button>


                        {/* ICON */}

                        <div className="cancel-modal-icon">

                            <i className="bi bi-calendar-x"></i>

                        </div>


                        {/* HEADING */}

                        <h2>
                            Cancel this booking?
                        </h2>

                        <p className="cancel-modal-description">
                            Are you sure you want to cancel this
                            reservation? This action cannot be undone.
                        </p>


                        {/* BOOKING SUMMARY */}

                        <div className="cancel-booking-summary">

                            <div className="cancel-summary-row">

                                <span>
                                    Hotel
                                </span>

                                <strong>
                                    {getHotelName(bookingToCancel)}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Location
                                </span>

                                <strong>
                                    {getHotelLocation(bookingToCancel)}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Room type
                                </span>

                                <strong>
                                    {getRoomType(bookingToCancel)}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Booking reference
                                </span>

                                <strong>
                                    {bookingToCancel.booking_reference}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Check-in
                                </span>

                                <strong>
                                    {bookingToCancel.check_in}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Check-out
                                </span>

                                <strong>
                                    {bookingToCancel.check_out}
                                </strong>

                            </div>


                            <div className="cancel-summary-row">

                                <span>
                                    Total price
                                </span>

                                <strong>
                                    ₹{bookingToCancel.total_price}
                                </strong>

                            </div>

                        </div>


                        {/* ERROR */}

                        {cancelMessage && (

                            <div className="cancel-error-message">

                                <i className="bi bi-exclamation-circle"></i>

                                <span>
                                    {cancelMessage}
                                </span>

                            </div>

                        )}


                        {/* ACTIONS */}

                        <div className="cancel-modal-actions">

                            <button
                                className="keep-booking-btn"
                                onClick={() => {
                                    setBookingToCancel(null);
                                    setCancelMessage("");
                                }}
                                disabled={cancellingId !== null}
                            >
                                Keep Booking
                            </button>


                            <button
                                className="confirm-cancel-btn"
                                onClick={() =>
                                    cancelBooking(bookingToCancel.id)
                                }
                                disabled={cancellingId !== null}
                            >

                                {cancellingId !== null ? (

                                    <>
                                        <span className="cancel-spinner"></span>

                                        Cancelling...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-trash3"></i>

                                        Cancel Reservation
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default MyBookings;

