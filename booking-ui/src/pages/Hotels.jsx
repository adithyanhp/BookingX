import { useEffect, useState } from "react";
import {
    useSearchParams,
    Link,
    useNavigate,
} from "react-router-dom";

import HotelCard from "../components/HotelCard";
import { searchHotels } from "../services/api";

import "./Hotels.css";


function Hotels() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();


    // =========================================================
    // SEARCH PARAMETERS
    // =========================================================

    const location =
        searchParams.get("location") || "";

    const checkIn =
        searchParams.get("check_in") || "";

    const checkOut =
        searchParams.get("check_out") || "";

    const adults =
        searchParams.get("adults") || "2";

    const children =
        searchParams.get("children") || "0";

    const guests =
        searchParams.get("guests") || "2";

    const rooms =
        searchParams.get("rooms") || "1";


    // =========================================================
    // STATE
    // =========================================================

    const [hotels, setHotels] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [sortBy, setSortBy] =
        useState("recommended");


    // =========================================================
    // PRICE FILTER STATE
    // =========================================================

    const [selectedPriceRanges, setSelectedPriceRanges] =
        useState([]);


    // =========================================================
    // STAR RATING FILTER STATE
    // =========================================================

    const [selectedStarRatings, setSelectedStarRatings] =
        useState([]);


    // =========================================================
    // PRICE FILTER OPTIONS
    // =========================================================

    const priceRanges = [
        {
            id: "under-2000",
            label: "Under ₹2,000",
            min: 0,
            max: 2000,
        },
        {
            id: "2000-5000",
            label: "₹2,000 – ₹5,000",
            min: 2000,
            max: 5000,
        },
        {
            id: "5000-10000",
            label: "₹5,000 – ₹10,000",
            min: 5000,
            max: 10000,
        },
        {
            id: "10000-plus",
            label: "₹10,000+",
            min: 10000,
            max: Infinity,
        },
    ];


    // =========================================================
    // STAR RATING FILTER OPTIONS
    // =========================================================

    const starRatings = [
        {
            value: 5,
            label: "★★★★★",
        },
        {
            value: 4,
            label: "★★★★",
        },
        {
            value: 3,
            label: "★★★",
        },
    ];


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateString) => {

        if (!dateString) {
            return "Not selected";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =========================================================
    // LOAD HOTELS
    // =========================================================

    useEffect(() => {

        let cancelled = false;


        const loadHotels = async () => {

            try {

                setLoading(true);

                setError("");


                const data = await searchHotels({

                    location,

                    check_in: checkIn,

                    check_out: checkOut,

                    adults,

                    children,

                    guests,

                    rooms,

                });


                if (cancelled) {
                    return;
                }


                // =================================================
                // HANDLE API RESPONSE
                // =================================================

                let results = [];


                if (Array.isArray(data)) {

                    results = data;

                } else if (
                    Array.isArray(data?.results)
                ) {

                    results = data.results;

                } else if (
                    Array.isArray(data?.hotels)
                ) {

                    results = data.hotels;

                }


                // =================================================
                // NORMALIZE HOTEL DATA
                // =================================================

                const normalizedHotels =
                    results
                        .filter(
                            (item) =>
                                item &&
                                typeof item === "object"
                        )
                        .map((item) => {

                            const hotel =
                                item?.hotel &&
                                typeof item.hotel === "object"
                                    ? item.hotel
                                    : item;


                            return {

                                ...hotel,


                                // ID
                                id:
                                    hotel?.id ??
                                    item?.hotel_id ??
                                    item?.id ??
                                    null,


                                // NAME
                                name:
                                    hotel?.name ??
                                    item?.hotel_name ??
                                    "Hotel",


                                // CITY
                                city:
                                    hotel?.city ??
                                    item?.city ??
                                    "",


                                // STATE
                                state:
                                    hotel?.state ??
                                    item?.state ??
                                    "",


                                // DESCRIPTION
                                description:
                                    hotel?.description ??
                                    item?.description ??
                                    "Comfortable accommodation for your stay.",


                                // RATING
                                star_rating:
                                    hotel?.star_rating ??
                                    item?.star_rating ??
                                    0,


                                // PRICE
                                price_from:
                                    hotel?.price_from ??
                                    item?.price_from ??
                                    item?.starting_price ??
                                    item?.price ??
                                    0,


                                // IMAGE
                                image:
                                    hotel?.image ??
                                    hotel?.image_url ??
                                    item?.image ??
                                    item?.image_url ??
                                    item?.photo ??
                                    null,

                            };

                        })
                        .filter(
                            (hotel) =>
                                hotel.id !== null
                        );


                setHotels(normalizedHotels);

            } catch (err) {

                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to search hotels:",
                    err
                );

                setHotels([]);

                setError(
                    "Unable to search hotels. Please try again."
                );

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };


        loadHotels();


        return () => {
            cancelled = true;
        };

    }, [
        location,
        checkIn,
        checkOut,
        adults,
        children,
        guests,
        rooms,
    ]);


    // =========================================================
    // VIEW HOTEL DETAILS
    // =========================================================

    const handleViewDetails = (hotelId) => {

        if (!hotelId) {
            return;
        }

        const query =
            searchParams.toString();


        navigate(
            `/hotels/${hotelId}${query ? `?${query}` : ""}`
        );

    };


    // =========================================================
    // MODIFY SEARCH
    // =========================================================

    const handleModifySearch = () => {

        navigate("/");

    };


    // =========================================================
    // PRICE FILTER CHANGE
    // =========================================================

    const handlePriceFilterChange = (rangeId) => {

        setSelectedPriceRanges((current) => {

            if (current.includes(rangeId)) {

                return current.filter(
                    (id) => id !== rangeId
                );

            }

            return [
                ...current,
                rangeId,
            ];

        });

    };


    // =========================================================
    // STAR FILTER CHANGE
    // =========================================================

    const handleStarFilterChange = (rating) => {

        setSelectedStarRatings((current) => {

            if (current.includes(rating)) {

                return current.filter(
                    (value) => value !== rating
                );

            }

            return [
                ...current,
                rating,
            ];

        });

    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const handleClearFilters = () => {

        setSelectedPriceRanges([]);

        setSelectedStarRatings([]);

        setSortBy("recommended");

    };


    // =========================================================
    // FILTER HOTELS
    // =========================================================

    const filteredHotels = hotels.filter((hotel) => {

        const hotelPrice =
            Number(
                hotel?.price_from || 0
            );

        const hotelRating =
            Number(
                hotel?.star_rating || 0
            );


        // =====================================================
        // PRICE FILTER
        // =====================================================

        let matchesPrice = true;


        if (
            selectedPriceRanges.length > 0
        ) {

            matchesPrice =
                selectedPriceRanges.some(
                    (rangeId) => {

                        const range =
                            priceRanges.find(
                                (item) =>
                                    item.id === rangeId
                            );


                        if (!range) {
                            return false;
                        }


                        if (
                            range.max === Infinity
                        ) {

                            return (
                                hotelPrice >=
                                range.min
                            );

                        }


                        return (
                            hotelPrice >=
                                range.min &&
                            hotelPrice <
                                range.max
                        );

                    }
                );

        }


        // =====================================================
        // STAR RATING FILTER
        // =====================================================

        let matchesRating = true;


        if (
            selectedStarRatings.length > 0
        ) {

            matchesRating =
                selectedStarRatings.includes(
                    hotelRating
                );

        }


        // =====================================================
        // FINAL RESULT
        // =====================================================

        return (
            matchesPrice &&
            matchesRating
        );

    });


    // =========================================================
    // SORT HOTELS
    // =========================================================

    const sortedHotels =
        [...filteredHotels].sort((a, b) => {

            if (sortBy === "price-low") {

                return (
                    Number(
                        a?.price_from || 0
                    ) -
                    Number(
                        b?.price_from || 0
                    )
                );

            }


            if (sortBy === "price-high") {

                return (
                    Number(
                        b?.price_from || 0
                    ) -
                    Number(
                        a?.price_from || 0
                    )
                );

            }


            if (sortBy === "rating") {

                return (
                    Number(
                        b?.star_rating || 0
                    ) -
                    Number(
                        a?.star_rating || 0
                    )
                );

            }


            // Recommended
            return 0;

        });


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="hotels-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="hotels-header">

                <div className="container">


                    {/* =================================================
                        BREADCRUMB
                    ================================================= */}

                    <div className="hotels-breadcrumb">

                        <Link to="/">

                            <i className="bi bi-house"></i>

                            <span>
                                Home
                            </span>

                        </Link>


                        <i className="bi bi-chevron-right"></i>


                        <span>
                            Hotels
                        </span>

                    </div>


                    {/* =================================================
                        HEADER CONTENT
                    ================================================= */}

                    <div className="hotels-header-content">

                        <div>

                            <span className="section-label">
                                HOTEL SEARCH
                            </span>


                            <h1>

                                Hotels in{" "}

                                <span>
                                    {location ||
                                        "your destination"}
                                </span>

                            </h1>


                            <p>
                                Find the perfect stay
                                for your trip.
                            </p>

                        </div>


                        {/* MODIFY SEARCH */}

                        <button
                            type="button"
                            className="modify-search-button"
                            onClick={
                                handleModifySearch
                            }
                        >

                            <i className="bi bi-sliders"></i>

                            <span>
                                Modify Search
                            </span>

                        </button>

                    </div>


                    {/* =================================================
                        SEARCH SUMMARY
                    ================================================= */}

                    <div className="search-summary">


                        {/* LOCATION */}

                        <div className="search-summary-item">

                            <div className="search-summary-icon">

                                <i className="bi bi-geo-alt-fill"></i>

                            </div>


                            <div>

                                <small>
                                    Location
                                </small>

                                <strong>
                                    {location ||
                                        "Not selected"}
                                </strong>

                            </div>

                        </div>


                        {/* CHECK IN */}

                        <div className="search-summary-item">

                            <div className="search-summary-icon">

                                <i className="bi bi-calendar-check"></i>

                            </div>


                            <div>

                                <small>
                                    Check in
                                </small>

                                <strong>
                                    {formatDate(checkIn)}
                                </strong>

                            </div>

                        </div>


                        {/* CHECK OUT */}

                        <div className="search-summary-item">

                            <div className="search-summary-icon">

                                <i className="bi bi-calendar-x"></i>

                            </div>


                            <div>

                                <small>
                                    Check out
                                </small>

                                <strong>
                                    {formatDate(checkOut)}
                                </strong>

                            </div>

                        </div>


                        {/* GUESTS */}

                        <div className="search-summary-item">

                            <div className="search-summary-icon">

                                <i className="bi bi-people-fill"></i>

                            </div>


                            <div>

                                <small>
                                    Guests
                                </small>

                                <strong>

                                    {adults}{" "}

                                    {adults === "1"
                                        ? "Adult"
                                        : "Adults"}

                                    {Number(children) > 0 && (
                                        <>
                                            {" · "}
                                            {children}{" "}

                                            {children === "1"
                                                ? "Child"
                                                : "Children"}
                                        </>
                                    )}

                                </strong>

                            </div>

                        </div>


                        {/* ROOMS */}

                        <div className="search-summary-item">

                            <div className="search-summary-icon">

                                <i className="bi bi-door-open-fill"></i>

                            </div>


                            <div>

                                <small>
                                    Rooms
                                </small>

                                <strong>

                                    {rooms}{" "}

                                    {rooms === "1"
                                        ? "Room"
                                        : "Rooms"}

                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                RESULTS
            ================================================= */}

            <section className="hotels-results-section">

                <div className="container">


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (

                        <div className="hotels-loading">

                            <div className="loading-spinner">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >

                                    <span className="visually-hidden">
                                        Loading...
                                    </span>

                                </div>

                            </div>


                            <h3>
                                Finding available hotels...
                            </h3>


                            <p>
                                Checking rooms for your
                                selected dates.
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {!loading &&
                        error && (

                            <div className="hotels-error">

                                <div className="hotels-state-icon">

                                    <i className="bi bi-exclamation-triangle"></i>

                                </div>


                                <h2>
                                    Something went wrong
                                </h2>


                                <p>
                                    {error}
                                </p>


                                <button
                                    type="button"
                                    className="state-action-button"
                                    onClick={
                                        handleModifySearch
                                    }
                                >

                                    <i className="bi bi-arrow-left"></i>

                                    Back to Search

                                </button>

                            </div>

                        )}


                    {/* =================================================
                        NO RESULTS FROM SEARCH
                    ================================================= */}

                    {!loading &&
                        !error &&
                        hotels.length === 0 && (

                            <div className="no-hotels">

                                <div className="hotels-state-icon">

                                    <i className="bi bi-building"></i>

                                </div>


                                <h2>
                                    No hotels found
                                </h2>


                                <p>
                                    We couldn't find any
                                    available hotels matching
                                    your search.
                                </p>


                                <button
                                    type="button"
                                    className="state-action-button"
                                    onClick={
                                        handleModifySearch
                                    }
                                >

                                    <i className="bi bi-search"></i>

                                    Modify Search

                                </button>

                            </div>

                        )}


                    {/* =================================================
                        HOTEL RESULTS
                    ================================================= */}

                    {!loading &&
                        !error &&
                        hotels.length > 0 && (

                            <div className="hotel-results-layout">


                                {/* =================================================
                                    FILTER SIDEBAR
                                ================================================= */}

                                <aside className="hotel-filters">


                                    <div className="filter-header">

                                        <div>

                                            <span>
                                                FILTERS
                                            </span>

                                            <h3>
                                                Refine your search
                                            </h3>

                                        </div>


                                        <button
                                            type="button"
                                            className="clear-filters-button"
                                            onClick={
                                                handleClearFilters
                                            }
                                        >
                                            Clear
                                        </button>

                                    </div>


                                    {/* =================================================
                                        PRICE FILTER
                                    ================================================= */}

                                    <div className="filter-group">

                                        <h4>
                                            Price per night
                                        </h4>


                                        {priceRanges.map(
                                            (range) => (

                                                <label
                                                    className="filter-option"
                                                    key={range.id}
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedPriceRanges.includes(
                                                                range.id
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handlePriceFilterChange(
                                                                range.id
                                                            )
                                                        }
                                                    />

                                                    <span className="custom-checkbox"></span>

                                                    <span>
                                                        {range.label}
                                                    </span>

                                                </label>

                                            )
                                        )}

                                    </div>


                                    {/* =================================================
                                        STAR RATING FILTER
                                    ================================================= */}

                                    <div className="filter-group">

                                        <h4>
                                            Star rating
                                        </h4>


                                        {starRatings.map(
                                            (rating) => (

                                                <label
                                                    className="filter-option"
                                                    key={
                                                        rating.value
                                                    }
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedStarRatings.includes(
                                                                rating.value
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleStarFilterChange(
                                                                rating.value
                                                            )
                                                        }
                                                    />

                                                    <span className="custom-checkbox"></span>

                                                    <span
                                                        className="star-filter-label"
                                                    >
                                                        {rating.label}
                                                    </span>

                                                </label>

                                            )
                                        )}

                                    </div>


                                    {/* =================================================
                                        ACTIVE FILTER SUMMARY
                                    ================================================= */}

                                    {(selectedPriceRanges.length > 0 ||
                                        selectedStarRatings.length > 0) && (

                                        <div className="active-filter-summary">

                                            <i className="bi bi-funnel-fill"></i>

                                            <span>
                                                {sortedHotels.length}{" "}
                                                {sortedHotels.length === 1
                                                    ? "hotel"
                                                    : "hotels"}{" "}
                                                matching filters
                                            </span>

                                        </div>

                                    )}

                                </aside>


                                {/* =================================================
                                    RESULTS CONTENT
                                ================================================= */}

                                <div className="hotel-results-content">


                                    {/* =================================================
                                        RESULTS HEADING
                                    ================================================= */}

                                    <div className="results-heading">

                                        <div>

                                            <span className="section-label">
                                                AVAILABLE STAYS
                                            </span>


                                            <h2>

                                                {sortedHotels.length}{" "}

                                                {sortedHotels.length === 1
                                                    ? "hotel"
                                                    : "hotels"}

                                                {" "}found

                                            </h2>

                                        </div>


                                        {/* SORT */}

                                        <div className="results-sort">

                                            <span>
                                                Sort by
                                            </span>


                                            <select
                                                value={sortBy}
                                                onChange={(event) =>
                                                    setSortBy(
                                                        event.target.value
                                                    )
                                                }
                                                aria-label="Sort hotels"
                                            >

                                                <option value="recommended">
                                                    Recommended
                                                </option>

                                                <option value="price-low">
                                                    Price: Low to High
                                                </option>

                                                <option value="price-high">
                                                    Price: High to Low
                                                </option>

                                                <option value="rating">
                                                    Guest Rating
                                                </option>

                                            </select>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        NO MATCHING FILTER RESULTS
                                    ================================================= */}

                                    {sortedHotels.length === 0 ? (

                                        <div className="no-hotels">

                                            <div className="hotels-state-icon">

                                                <i className="bi bi-funnel"></i>

                                            </div>


                                            <h2>
                                                No hotels match your filters
                                            </h2>


                                            <p>
                                                Try removing some
                                                filters to see more
                                                available hotels.
                                            </p>


                                            <button
                                                type="button"
                                                className="state-action-button"
                                                onClick={
                                                    handleClearFilters
                                                }
                                            >

                                                <i className="bi bi-x-circle"></i>

                                                Clear Filters

                                            </button>

                                        </div>

                                    ) : (

                                        /* =================================================
                                            HOTEL LIST
                                        ================================================= */

                                        <div className="hotels-list">

                                            {sortedHotels.map(
                                                (hotel, index) => (

                                                    <HotelCard
                                                        key={
                                                            hotel.id ??
                                                            `hotel-${index}`
                                                        }
                                                        hotel={hotel}
                                                        onViewDetails={
                                                            handleViewDetails
                                                        }
                                                    />

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            </div>

                        )}

                </div>

            </section>

        </div>

    );

}


export default Hotels;

