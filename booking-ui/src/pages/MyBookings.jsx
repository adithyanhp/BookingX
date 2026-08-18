import { useEffect, useState } from "react";
import "./MyBookings.css";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const token = localStorage.getItem("access_token");

    const loadBookings = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/bookings/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setBookings(data);
            } else {
                console.error(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadBookings();
        } else {
            setLoading(false);
        }
    }, []);

    const cancelBooking = async (id) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) {
            return;
        }

        setCancellingId(id);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/bookings/${id}/cancel/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Booking cancelled successfully.");
                await loadBookings();
            } else {
                console.error(data);

                alert(
                    data.detail ||
                    data.message ||
                    "Unable to cancel booking."
                );
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to server.");
        } finally {
            setCancellingId(null);
        }
    };

    /* Not logged in */
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

    /* Loading */
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

                {/* Page Header */}
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

                {/* Empty State */}
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
                                        : ""
                                }`}
                                key={booking.id}
                            >

                                {/* Card Header */}
                                <div className="booking-card-header">

                                    <div className="booking-reference">

                                        <div className="booking-icon">
                                            <i className="bi bi-buildings"></i>
                                        </div>

                                        <div>
                                            <span>BOOKING REFERENCE</span>

                                            <strong>
                                                {booking.booking_reference}
                                            </strong>
                                        </div>

                                    </div>

                                    <div
                                        className={`booking-status ${
                                            booking.status === "cancelled"
                                                ? "status-cancelled"
                                                : booking.status === "confirmed"
                                                ? "status-confirmed"
                                                : "status-pending"
                                        }`}
                                    >
                                        <span className="status-dot"></span>
                                        {booking.status}
                                    </div>

                                </div>


                                {/* Dates */}
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


                                {/* Booking Details */}
                                <div className="booking-details">

                                    <div className="detail-item">

                                        <div className="detail-icon">
                                            <i className="bi bi-people"></i>
                                        </div>

                                        <div>
                                            <span>Guests</span>
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
                                            <span>Total price</span>
                                            <strong>
                                                ₹{booking.total_price}
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* Footer */}
                                <div className="booking-card-footer">

                                    <div className="booking-created">

                                        <i className="bi bi-clock"></i>

                                        <span>
                                            Booking #{booking.id}
                                        </span>

                                    </div>


                                    {booking.status !== "cancelled" ? (

                                        <button
                                            className="cancel-booking-btn"
                                            onClick={() =>
                                                cancelBooking(booking.id)
                                            }
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

                                    ) : (

                                        <div className="cancelled-message">

                                            <i className="bi bi-check-circle"></i>

                                            Booking cancelled

                                        </div>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default MyBookings;

