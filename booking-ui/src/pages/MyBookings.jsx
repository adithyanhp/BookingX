import { useEffect, useState } from "react";
import "./MyBookings.css";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelMessage, setCancelMessage] = useState("");
    const [sessionExpired, setSessionExpired] = useState(false);

    const loadBookings = async () => {
        const token = localStorage.getItem("access_token");

        // No token
        if (!token) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://127.0.0.1:8000/api/bookings/",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Handle expired/invalid JWT only
            if (response.status === 401) {
                console.error("Authentication failed.");

                setSessionExpired(true);
                setBookings([]);
                setLoading(false);

                return;
            }

            const data = await response.json();

            if (response.ok) {
                // Make sure we actually received an array
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    console.error("Unexpected bookings response:", data);
                    setBookings([]);
                }
            } else {
                console.error("Failed to load bookings:", data);
                setBookings([]);
            }
        } catch (error) {
            console.error("Error loading bookings:", error);

            // Important:
            // A network error should NOT log the user out.
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchBookings = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/bookings/",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!isMounted) return;

                if (response.status === 401) {
                    setSessionExpired(true);
                    setBookings([]);
                    return;
                }

                const data = await response.json();

                if (response.ok && Array.isArray(data)) {
                    setBookings(data);
                } else {
                    console.error("Failed to load bookings:", data);
                    setBookings([]);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error loading bookings:", error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
        };
    }, []);

    const cancelBooking = async (id) => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setSessionExpired(true);
            return;
        }

        setCancellingId(id);
        setCancelMessage("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/bookings/${id}/cancel/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            // Only 401 means authentication problem
            if (response.status === 401) {
                setSessionExpired(true);
                setCancelMessage("Your login session has expired.");
                return;
            }

            if (response.ok) {
                setBookingToCancel(null);
                setCancelMessage("");

                // Reload bookings after successful cancellation
                await loadBookings();
            } else {
                console.error("Cancellation failed:", data);

                setCancelMessage(
                    data.detail ||
                        data.message ||
                        data.error ||
                        "Unable to cancel booking."
                );
            }
        } catch (error) {
            console.error("Cancellation error:", error);

            setCancelMessage(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setCancellingId(null);
        }
    };

    /* =========================================
       SESSION EXPIRED
    ========================================= */
    if (sessionExpired) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <h2>Your login session has expired</h2>

                        <p>
                            Please log in again to view and manage your
                            bookings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================
       NOT LOGGED IN
    ========================================= */
    const token = localStorage.getItem("access_token");

    if (!token) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-person-lock"></i>
                        </div>

                        <h2>Login required</h2>

                        <p>
                            Please login to view and manage your bookings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================
       LOADING
    ========================================= */
    if (loading) {
        return (
            <div className="bookings-page">
                <div className="bookings-container">
                    <div className="bookings-loading">
                        <div className="spinner"></div>

                        <h3>Loading your bookings...</h3>

                        <p>Please wait a moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <div className="bookings-container">

                {/* =========================================
                    PAGE HEADER
                ========================================= */}
                <div className="bookings-header">
                    <div>
                        <span className="bookings-label">
                            <i className="bi bi-calendar-check"></i>
                            YOUR TRIPS
                        </span>

                        <h1>My Bookings</h1>

                        <p>
                            Manage your hotel reservations and view your
                            booking details.
                        </p>
                    </div>

                    <div className="booking-count">
                        <span>{bookings.length}</span>

                        <small>
                            {bookings.length === 1
                                ? "Booking"
                                : "Bookings"}
                        </small>
                    </div>
                </div>

                {/* =========================================
                    EMPTY STATE
                ========================================= */}
                {bookings.length === 0 ? (
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-calendar-x"></i>
                        </div>

                        <h2>No bookings yet</h2>

                        <p>
                            You haven't made any hotel bookings yet.
                            Your reservations will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="bookings-list">

                        {bookings.map((booking) => (
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

                                {/* =========================================
                                    CARD HEADER
                                ========================================= */}
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

                                {/* =========================================
                                    DATES
                                ========================================= */}
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

                                {/* =========================================
                                    BOOKING DETAILS
                                ========================================= */}
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

                                {/* =========================================
                                    FOOTER
                                ========================================= */}
                                <div className="booking-card-footer">

                                    <div className="booking-created">
                                        <i className="bi bi-clock"></i>

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
                                            <i className="bi bi-check-circle"></i>

                                            Booking completed
                                        </div>

                                    ) : booking.status === "cancelled" ? (

                                        <div className="cancelled-message">
                                            <i className="bi bi-x-circle"></i>

                                            Booking cancelled
                                        </div>

                                    ) : null}

                                </div>

                            </div>
                        ))}

                    </div>
                )}
            </div>

            {/* =========================================
                CANCELLATION MODAL
            ========================================= */}
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

