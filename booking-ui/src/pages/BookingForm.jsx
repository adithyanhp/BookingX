import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
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

    const formatDate = (date) => {
        if (!date) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) return "Select date";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleGuestChange = (change) => {
        setGuests((current) => {
            const newValue = Number(current) + change;

            if (newValue < 1) return 1;
            if (newValue > 20) return 20;

            return newValue;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!checkIn || !checkOut) {
            setError("Please select both check-in and check-out dates.");
            return;
        }

        if (checkOut <= checkIn) {
            setError("Check-out date must be after the check-in date.");
            return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/bookings/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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

            alert(
                `Booking successful!\nReference: ${data.booking_reference}`
            );

            navigate("/bookings");
        } catch (error) {
            console.error("Booking error:", error);
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-form-page">
            <div className="container">

                <div className="booking-form-wrapper">

                    {/* Header */}
                    <div className="booking-form-header">

                        <div className="booking-label-wrapper">
                            <span className="booking-label">
                                COMPLETE YOUR RESERVATION
                            </span>
                        </div>

                        <h1>Book Your Room</h1>

                        <p>
                            Select your dates and number of guests to
                            complete your reservation.
                        </p>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="booking-error">
                            <i className="bi bi-exclamation-circle-fill"></i>

                            <div>
                                <strong>Booking could not be completed</strong>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}


                    {/* Booking Card */}
                    <form
                        onSubmit={handleSubmit}
                        className="booking-form-card"
                    >

                        {/* Date Section */}
                        <div className="booking-section">

                            <div className="booking-section-header">

                                <div className="booking-section-icon">
                                    <i className="bi bi-calendar3"></i>
                                </div>

                                <div>
                                    <h2>Check-in & Check-out</h2>

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
                                        <small>CHECK-IN</small>

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
                                        <small>CHECK-OUT</small>

                                        <strong>
                                            {formatDisplayDate(checkOut)}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Guests Section */}
                        <div className="booking-section">

                            <div className="booking-section-header">

                                <div className="booking-section-icon">
                                    <i className="bi bi-people"></i>
                                </div>

                                <div>
                                    <h2>Guests</h2>

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
                                        <strong>Guests</strong>
                                        <span>Maximum 20 guests</span>
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


                        {/* Summary */}
                        <div className="booking-summary">

                            <div className="summary-icon">
                                <i className="bi bi-shield-check"></i>
                            </div>

                            <div>
                                <strong>Secure reservation</strong>

                                <span>
                                    Your booking details are securely
                                    processed.
                                </span>
                            </div>

                        </div>


                        {/* Submit */}
                        <button
                            type="submit"
                            className="confirm-booking-button"
                            disabled={
                                loading ||
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
        </div>
    );
}

export default BookingForm;

