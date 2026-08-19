import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBox() {
    const navigate = useNavigate();

    const [location, setLocation] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    const [showGuests, setShowGuests] = useState(false);
    const [error, setError] = useState("");

    const guestsRef = useRef(null);
    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);

    /* =========================================================
       CLOSE GUESTS DROPDOWN WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                guestsRef.current &&
                !guestsRef.current.contains(event.target)
            ) {
                setShowGuests(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =========================================================
       TODAY'S DATE
    ========================================================= */

    const today = new Date().toISOString().split("T")[0];

    /* =========================================================
       MINIMUM CHECKOUT DATE
    ========================================================= */

    const minimumCheckOut = checkIn
        ? new Date(
              new Date(`${checkIn}T00:00:00`).getTime() +
                  24 * 60 * 60 * 1000
          )
              .toISOString()
              .split("T")[0]
        : today;

    /* =========================================================
       TOTAL GUESTS
    ========================================================= */

    const totalGuests = adults + children;

    /* =========================================================
       FORMAT DATE FOR DISPLAY
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "Select date";
        }

        const dateObject = new Date(`${date}T00:00:00`);

        return dateObject.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /* =========================================================
       OPEN CHECK-IN DATE PICKER
    ========================================================= */

    const openCheckInPicker = () => {
        if (checkInRef.current) {
            if (
                typeof checkInRef.current.showPicker ===
                "function"
            ) {
                checkInRef.current.showPicker();
            } else {
                checkInRef.current.focus();
                checkInRef.current.click();
            }
        }
    };

    /* =========================================================
       OPEN CHECK-OUT DATE PICKER
    ========================================================= */

    const openCheckOutPicker = () => {
        if (checkOutRef.current) {
            if (
                typeof checkOutRef.current.showPicker ===
                "function"
            ) {
                checkOutRef.current.showPicker();
            } else {
                checkOutRef.current.focus();
                checkOutRef.current.click();
            }
        }
    };

    /* =========================================================
       CHECK-IN CHANGE
    ========================================================= */

    const handleCheckInChange = (event) => {
        const selectedDate = event.target.value;

        setCheckIn(selectedDate);
        setError("");

        if (checkOut && selectedDate >= checkOut) {
            setCheckOut("");
        }
    };

    /* =========================================================
       CHECK-OUT CHANGE
    ========================================================= */

    const handleCheckOutChange = (event) => {
        const selectedDate = event.target.value;

        if (checkIn && selectedDate <= checkIn) {
            setError(
                "Check-out date must be after check-in date."
            );

            setCheckOut("");

            return;
        }

        setCheckOut(selectedDate);
        setError("");
    };

    /* =========================================================
       ADULTS
    ========================================================= */

    const increaseAdults = () => {
        setAdults((current) => current + 1);
    };

    const decreaseAdults = () => {
        setAdults((current) =>
            Math.max(1, current - 1)
        );
    };

    /* =========================================================
       CHILDREN
    ========================================================= */

    const increaseChildren = () => {
        setChildren((current) => current + 1);
    };

    const decreaseChildren = () => {
        setChildren((current) =>
            Math.max(0, current - 1)
        );
    };

    /* =========================================================
       ROOMS
    ========================================================= */

    const increaseRooms = () => {
        setRooms((current) => current + 1);
    };

    const decreaseRooms = () => {
        setRooms((current) =>
            Math.max(1, current - 1)
        );
    };

    /* =========================================================
       GUEST DISPLAY TEXT
       
       Example:
       2 Guests 1 Room
       3 Guests 2 Rooms
       1 Guest 1 Room
    ========================================================= */

    const guestDisplayText = `${totalGuests} ${
        totalGuests === 1 ? "Guest" : "Guests"
    } ${rooms} ${
        rooms === 1 ? "Room" : "Rooms"
    }`;

    /* =========================================================
       SEARCH
    ========================================================= */

    const handleSearch = () => {
        setError("");

        if (!location.trim()) {
            setError("Please enter a destination.");
            return;
        }

        if (!checkIn) {
            setError("Please select a check-in date.");
            return;
        }

        if (!checkOut) {
            setError("Please select a check-out date.");
            return;
        }

        if (checkOut <= checkIn) {
            setError(
                "Check-out date must be after check-in date."
            );

            return;
        }

        const searchParams = new URLSearchParams({
            location: location.trim(),
            check_in: checkIn,
            check_out: checkOut,
            adults: adults.toString(),
            children: children.toString(),
            guests: totalGuests.toString(),
            rooms: rooms.toString(),
        });

        navigate(
            `/hotels?${searchParams.toString()}`
        );
    };

    return (
        <div className="booking-search">

            {/* =====================================================
                LOCATION
            ===================================================== */}

            <div className="search-item search-location">

                <div className="search-icon">
                    <i className="bi bi-geo-alt"></i>
                </div>

                <div className="search-content">

                    <small>Location</small>

                    <input
                        type="text"
                        className="location-input"
                        value={location}
                        onChange={(event) => {
                            setLocation(
                                event.target.value
                            );

                            setError("");
                        }}
                        placeholder="Where are you going?"
                        autoComplete="off"
                    />

                </div>

            </div>


            {/* =====================================================
                CHECK IN
            ===================================================== */}

            <div
                className="search-item search-date"
                onClick={openCheckInPicker}
            >

                <div className="search-icon">
                    <i className="bi bi-calendar3"></i>
                </div>

                <div className="search-content">

                    <small>Check in</small>

                    <div className="date-input-wrapper">

                        <strong>
                            {formatDate(checkIn)}
                        </strong>

                        <input
                            ref={checkInRef}
                            type="date"
                            min={today}
                            value={checkIn}
                            onChange={
                                handleCheckInChange
                            }
                            aria-label="Check-in date"
                        />

                    </div>

                </div>

            </div>


            {/* =====================================================
                CHECK OUT
            ===================================================== */}

            <div
                className="search-item search-date"
                onClick={openCheckOutPicker}
            >

                <div className="search-icon">
                    <i className="bi bi-calendar3"></i>
                </div>

                <div className="search-content">

                    <small>Check out</small>

                    <div className="date-input-wrapper">

                        <strong>
                            {formatDate(checkOut)}
                        </strong>

                        <input
                            ref={checkOutRef}
                            type="date"
                            min={minimumCheckOut}
                            value={checkOut}
                            onChange={
                                handleCheckOutChange
                            }
                            aria-label="Check-out date"
                        />

                    </div>

                </div>

            </div>


            {/* =====================================================
                GUESTS & ROOMS
            ===================================================== */}

            <div
                className="search-item search-guests"
                ref={guestsRef}
            >

                <div className="search-icon">
                    <i className="bi bi-people"></i>
                </div>

                <button
                    type="button"
                    className="guest-selector"
                    onClick={() =>
                        setShowGuests(
                            (current) => !current
                        )
                    }
                >

                    {/* Label */}

                    <small>Guests & rooms</small>

                    {/* 
                        Display:
                        2 Guests 1 Room
                    */}

                    <strong>
                        {guestDisplayText}
                    </strong>

                </button>


                {/* =================================================
                    GUESTS DROPDOWN
                ================================================= */}

                {showGuests && (

                    <div className="guests-dropdown">

                        {/* =================================================
                            ADULTS
                        ================================================= */}

                        <div className="guest-row">

                            <div>
                                <strong>
                                    Adults
                                </strong>

                                <small>
                                    Age 13+
                                </small>
                            </div>

                            <div className="guest-counter">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseAdults
                                    }
                                    disabled={
                                        adults <= 1
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {adults}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseAdults
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            CHILDREN
                        ================================================= */}

                        <div className="guest-row">

                            <div>
                                <strong>
                                    Children
                                </strong>

                                <small>
                                    Age 0–12
                                </small>
                            </div>

                            <div className="guest-counter">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseChildren
                                    }
                                    disabled={
                                        children <= 0
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {children}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseChildren
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            ROOMS
                        ================================================= */}

                        <div className="guest-row">

                            <div>
                                <strong>
                                    Rooms
                                </strong>

                                <small>
                                    Number of rooms
                                </small>
                            </div>

                            <div className="guest-counter">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseRooms
                                    }
                                    disabled={
                                        rooms <= 1
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {rooms}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseRooms
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            DONE BUTTON
                        ================================================= */}

                        <button
                            type="button"
                            className="guests-done-btn"
                            onClick={() =>
                                setShowGuests(false)
                            }
                        >
                            Done
                        </button>

                    </div>

                )}

            </div>


            {/* =====================================================
                SEARCH BUTTON
            ===================================================== */}

            <button
                type="button"
                className="search-button"
                onClick={handleSearch}
            >
                <i className="bi bi-search"></i>
                Search
            </button>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="search-error">

                    <i className="bi bi-exclamation-circle"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}

        </div>
    );
}

export default SearchBox;

