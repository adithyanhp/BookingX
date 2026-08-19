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

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sortBy, setSortBy] =
        useState("recommended");


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

                const normalizedHotels = results
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
                        (hotel) => hotel.id !== null
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
    // CLEAR SORT
    // =========================================================

    const handleClearFilters = () => {

        setSortBy("recommended");

    };


    // =========================================================
    // SORT HOTELS
    // =========================================================

    const sortedHotels = [...hotels].sort(
        (a, b) => {

            if (sortBy === "price-low") {

                return (
                    Number(a?.price_from || 0) -
                    Number(b?.price_from || 0)
                );

            }


            if (sortBy === "price-high") {

                return (
                    Number(b?.price_from || 0) -
                    Number(a?.price_from || 0)
                );

            }


            if (sortBy === "rating") {

                return (
                    Number(b?.star_rating || 0) -
                    Number(a?.star_rating || 0)
                );

            }


            // Recommended
            return 0;

        }
    );


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
                            onClick={handleModifySearch}
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

                    {!loading && error && (

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
                                onClick={handleModifySearch}
                            >

                                <i className="bi bi-arrow-left"></i>

                                Back to Search

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        NO RESULTS
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
                                    onClick={handleModifySearch}
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


                                    {/* PRICE */}

                                    <div className="filter-group">

                                        <h4>
                                            Price per night
                                        </h4>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                Under ₹2,000
                                            </span>

                                        </div>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ₹2,000 – ₹5,000
                                            </span>

                                        </div>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ₹5,000 – ₹10,000
                                            </span>

                                        </div>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ₹10,000+
                                            </span>

                                        </div>

                                    </div>


                                    {/* STAR RATING */}

                                    <div className="filter-group">

                                        <h4>
                                            Star rating
                                        </h4>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ★★★★★
                                            </span>

                                        </div>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ★★★★
                                            </span>

                                        </div>


                                        <div className="filter-option disabled">

                                            <span className="custom-checkbox"></span>

                                            <span>
                                                ★★★
                                            </span>

                                        </div>

                                    </div>


                                    {/* INFO */}

                                    <div className="filter-info">

                                        <i className="bi bi-info-circle"></i>

                                        <p>
                                            More filters will
                                            be available soon.
                                        </p>

                                    </div>

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
                                        HOTEL LIST
                                    ================================================= */}

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

                                </div>

                            </div>

                        )}

                </div>

            </section>

        </div>

    );
}


export default Hotels;
