import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBox() {
    const navigate = useNavigate();

    const [location, setLocation] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] =
        useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    const [showGuests, setShowGuests] = useState(false);
    const [error, setError] = useState("");

    const guestsRef = useRef(null);
    const locationRef = useRef(null);
    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);

    /* =========================================================
       GEOAPIFY API KEY
    ========================================================= */

    const GEOAPIFY_API_KEY =
        import.meta.env.VITE_GEOAPIFY_API_KEY;

    /* =========================================================
       CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                guestsRef.current &&
                !guestsRef.current.contains(event.target)
            ) {
                setShowGuests(false);
            }

            if (
                locationRef.current &&
                !locationRef.current.contains(event.target)
            ) {
                setShowLocationSuggestions(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =========================================================
       GEOAPIFY LOCATION AUTOCOMPLETE
    ========================================================= */

    useEffect(() => {
        const searchText = location.trim();

        if (searchText.length < 2) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        if (!GEOAPIFY_API_KEY) {
            console.error(
                "Geoapify API key is missing."
            );

            setLocationSuggestions([]);
            setShowLocationSuggestions(false);

            return;
        }

        const controller = new AbortController();

        const searchLocation = async () => {
            try {
                const params = new URLSearchParams({
                    text: searchText,
                    filter: "countrycode:in",
                    limit: "10",
                    format: "json",
                    lang: "en",
                    apiKey: GEOAPIFY_API_KEY,
                });

                const response = await fetch(
                    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Geoapify request failed with status ${response.status}`
                    );
                }

                const data = await response.json();

                const results = Array.isArray(
                    data.results
                )
                    ? data.results
                    : [];

                setLocationSuggestions(results);

                setShowLocationSuggestions(
                    results.length > 0
                );
            } catch (error) {
                if (
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Location autocomplete error:",
                    error
                );

                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
            }
        };

        const timeoutId = setTimeout(
            searchLocation,
            300
        );

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [
        location,
        GEOAPIFY_API_KEY,
    ]);

    /* =========================================================
       SELECT LOCATION
    ========================================================= */

    const handleLocationSelect = (place) => {
        const formattedLocation =
            place.formatted ||
            place.name ||
            "";

        const latitude =
            typeof place.lat === "number"
                ? place.lat
                : null;

        const longitude =
            typeof place.lon === "number"
                ? place.lon
                : null;

        setLocation(
            formattedLocation
        );

        setSelectedLocation({
            name: place.name || "",
            formatted:
                formattedLocation,
            city: place.city || "",
            state: place.state || "",
            country:
                place.country || "",
            latitude,
            longitude,
            placeId:
                place.place_id || "",
        });

        setShowLocationSuggestions(
            false
        );

        setLocationSuggestions([]);

        setError("");
    };

    /* =========================================================
       TODAY'S DATE
    ========================================================= */

    const today = new Date()
        .toISOString()
        .split("T")[0];

    /* =========================================================
       MINIMUM CHECKOUT DATE
    ========================================================= */

    const minimumCheckOut = checkIn
        ? new Date(
              new Date(
                  `${checkIn}T00:00:00`
              ).getTime() +
                  24 *
                      60 *
                      60 *
                      1000
          )
              .toISOString()
              .split("T")[0]
        : today;

    /* =========================================================
       TOTAL GUESTS
    ========================================================= */

    const totalGuests =
        adults + children;

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "Select date";
        }

        const dateObject = new Date(
            `${date}T00:00:00`
        );

        return dateObject.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /* =========================================================
       OPEN CHECK-IN PICKER
    ========================================================= */

    const openCheckInPicker = () => {
        if (!checkInRef.current) {
            return;
        }

        if (
            typeof checkInRef.current
                .showPicker === "function"
        ) {
            checkInRef.current.showPicker();
        } else {
            checkInRef.current.focus();
            checkInRef.current.click();
        }
    };

    /* =========================================================
       OPEN CHECK-OUT PICKER
    ========================================================= */

    const openCheckOutPicker = () => {
        if (!checkOutRef.current) {
            return;
        }

        if (
            typeof checkOutRef.current
                .showPicker === "function"
        ) {
            checkOutRef.current.showPicker();
        } else {
            checkOutRef.current.focus();
            checkOutRef.current.click();
        }
    };

    /* =========================================================
       CHECK-IN CHANGE
    ========================================================= */

    const handleCheckInChange = (
        event
    ) => {
        const selectedDate =
            event.target.value;

        setCheckIn(selectedDate);
        setError("");

        if (
            checkOut &&
            selectedDate >= checkOut
        ) {
            setCheckOut("");
        }
    };

    /* =========================================================
       CHECK-OUT CHANGE
    ========================================================= */

    const handleCheckOutChange = (
        event
    ) => {
        const selectedDate =
            event.target.value;

        if (
            checkIn &&
            selectedDate <= checkIn
        ) {
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
        setAdults(
            (current) =>
                current + 1
        );
    };

    const decreaseAdults = () => {
        setAdults(
            (current) =>
                Math.max(
                    1,
                    current - 1
                )
        );
    };

    /* =========================================================
       CHILDREN
    ========================================================= */

    const increaseChildren = () => {
        setChildren(
            (current) =>
                current + 1
        );
    };

    const decreaseChildren = () => {
        setChildren(
            (current) =>
                Math.max(
                    0,
                    current - 1
                )
        );
    };

    /* =========================================================
       ROOMS
    ========================================================= */

    const increaseRooms = () => {
        setRooms(
            (current) =>
                current + 1
        );
    };

    const decreaseRooms = () => {
        setRooms(
            (current) =>
                Math.max(
                    1,
                    current - 1
                )
        );
    };

    /* =========================================================
       GUEST DISPLAY
    ========================================================= */

    const guestDisplayText =
        `${totalGuests} ${
            totalGuests === 1
                ? "Guest"
                : "Guests"
        } ${rooms} ${
            rooms === 1
                ? "Room"
                : "Rooms"
        }`;

    /* =========================================================
       SEARCH
    ========================================================= */

    const handleSearch = () => {
        setError("");

        /* -----------------------------------------------------
           LOCATION VALIDATION
        ----------------------------------------------------- */

        if (!location.trim()) {
            setError(
                "Please enter a destination."
            );

            return;
        }

        /* -----------------------------------------------------
           DATE VALIDATION
        ----------------------------------------------------- */

        if (!checkIn) {
            setError(
                "Please select a check-in date."
            );

            return;
        }

        if (!checkOut) {
            setError(
                "Please select a check-out date."
            );

            return;
        }

        if (checkOut <= checkIn) {
            setError(
                "Check-out date must be after check-in date."
            );

            return;
        }

        /* -----------------------------------------------------
           BUILD SEARCH PARAMETERS
        ----------------------------------------------------- */

        const searchParams =
            new URLSearchParams();

        /*
         * If the user selected a Geoapify suggestion,
         * prefer the city as the Django text-search value.
         *
         * Example:
         *
         * "Kochi, Ernakulam, Kerala, India"
         *
         * becomes:
         *
         * location=Kochi
         *
         * Coordinates are also sent so the backend can
         * perform geographic searching when hotel coordinates
         * are available.
         */

        const searchLocation =
            selectedLocation?.city ||
            selectedLocation?.name ||
            location.trim();

        searchParams.set(
            "location",
            searchLocation
        );

        searchParams.set(
            "check_in",
            checkIn
        );

        searchParams.set(
            "check_out",
            checkOut
        );

        searchParams.set(
            "adults",
            adults.toString()
        );

        searchParams.set(
            "children",
            children.toString()
        );

        searchParams.set(
            "guests",
            totalGuests.toString()
        );

        searchParams.set(
            "rooms",
            rooms.toString()
        );

        /* -----------------------------------------------------
           ADD GEOAPIFY COORDINATES
        ----------------------------------------------------- */

        if (
            selectedLocation &&
            selectedLocation.latitude !==
                null &&
            selectedLocation.longitude !==
                null
        ) {
            searchParams.set(
                "latitude",
                selectedLocation.latitude.toString()
            );

            searchParams.set(
                "longitude",
                selectedLocation.longitude.toString()
            );
        }

        /* -----------------------------------------------------
           NAVIGATE TO HOTEL RESULTS
        ----------------------------------------------------- */

        navigate(
            `/hotels?${searchParams.toString()}`
        );
    };

    return (
        <div className="booking-search">

            {/* =====================================================
                LOCATION
            ===================================================== */}

            <div
                className="search-item search-location"
                ref={locationRef}
            >

                <div className="search-icon">
                    <i className="bi bi-geo-alt"></i>
                </div>

                <div className="search-content">

                    <small>
                        Location
                    </small>

                    <input
                        type="text"
                        className="location-input"
                        value={location}
                        onChange={(event) => {
                            setLocation(
                                event.target.value
                            );

                            /*
                             * Once the user edits the
                             * selected location, the
                             * previous Geoapify selection
                             * is no longer valid.
                             */

                            setSelectedLocation(
                                null
                            );

                            setError("");
                        }}
                        onFocus={() => {
                            if (
                                locationSuggestions.length >
                                0
                            ) {
                                setShowLocationSuggestions(
                                    true
                                );
                            }
                        }}
                        placeholder="Where are you going?"
                        autoComplete="off"
                    />

                    {/* =================================================
                        GEOAPIFY SUGGESTIONS
                    ================================================= */}

                    {showLocationSuggestions &&
                        locationSuggestions.length >
                            0 && (

                        <div className="location-suggestions">

                            {locationSuggestions.map(
                                (place) => (

                                    <button
                                        type="button"
                                        className="location-suggestion"
                                        key={
                                            place.place_id ||
                                            `${place.lat}-${place.lon}`
                                        }
                                        onClick={() =>
                                            handleLocationSelect(
                                                place
                                            )
                                        }
                                    >

                                        <i className="bi bi-geo-alt"></i>

                                        <span>
                                            {
                                                place.formatted ||
                                                place.name
                                            }
                                        </span>

                                    </button>

                                )
                            )}

                        </div>
                    )}

                </div>

            </div>

            {/* =====================================================
                CHECK IN
            ===================================================== */}

            <div
                className="search-item search-date"
                onClick={
                    openCheckInPicker
                }
            >

                <div className="search-icon">
                    <i className="bi bi-calendar3"></i>
                </div>

                <div className="search-content">

                    <small>
                        Check in
                    </small>

                    <div className="date-input-wrapper">

                        <strong>
                            {formatDate(
                                checkIn
                            )}
                        </strong>

                        <input
                            ref={
                                checkInRef
                            }
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
                onClick={
                    openCheckOutPicker
                }
            >

                <div className="search-icon">
                    <i className="bi bi-calendar3"></i>
                </div>

                <div className="search-content">

                    <small>
                        Check out
                    </small>

                    <div className="date-input-wrapper">

                        <strong>
                            {formatDate(
                                checkOut
                            )}
                        </strong>

                        <input
                            ref={
                                checkOutRef
                            }
                            type="date"
                            min={
                                minimumCheckOut
                            }
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
                            (current) =>
                                !current
                        )
                    }
                >

                    <small>
                        Guests & rooms
                    </small>

                    <strong>
                        {guestDisplayText}
                    </strong>

                </button>

                {showGuests && (

                    <div className="guests-dropdown">

                        {/* ADULTS */}

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

                        {/* CHILDREN */}

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

                        {/* ROOMS */}

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

                        {/* DONE */}

                        <button
                            type="button"
                            className="guests-done-btn"
                            onClick={() =>
                                setShowGuests(
                                    false
                                )
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
                onClick={
                    handleSearch
                }
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

