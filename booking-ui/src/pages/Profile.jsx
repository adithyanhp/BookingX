import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/api";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD USER PROFILE
    // =========================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getUserProfile();

                setProfile(data);
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );

                if (error?.status === 401) {
                    setError(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setError(
                        "Unable to load your profile. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-loading">
                        <div className="profile-spinner"></div>

                        <h3>
                            Loading your profile...
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
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-error">
                        <div className="profile-error-icon">
                            <i className="bi bi-person-x"></i>
                        </div>

                        <h2>
                            Unable to load profile
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="profile-login-button"
                            onClick={() => navigate("/login")}
                        >
                            <i className="bi bi-box-arrow-in-right"></i>

                            Login Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // PROFILE IMAGE
    // =========================================================

    const profileImage = profile?.profile_image || null;

    // =========================================================
    // DISPLAY NAME
    // =========================================================

    const displayName =
        profile?.first_name || profile?.last_name
            ? `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
            : profile?.username || "User";

    // =========================================================
    // MAIN PROFILE
    // =========================================================

    return (
        <div className="profile-page">

            <div className="profile-container">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="profile-header">

                    <span className="profile-label">
                        <i className="bi bi-person-circle"></i>
                        ACCOUNT
                    </span>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your account information and manage
                        your BookingX reservations.
                    </p>

                </div>


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <div className="profile-card">


                    {/* =================================================
                        PROFILE HEADER
                    ================================================= */}

                    <div className="profile-card-header">


                        {/* PROFILE IMAGE */}

                        <div className="profile-avatar">

                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={`${profile?.username || "User"} profile`}
                                    className="profile-avatar-image"
                                />
                            ) : (
                                <i className="bi bi-person-fill"></i>
                            )}

                        </div>


                        {/* USER INFORMATION */}

                        <div className="profile-user-heading">

                            <span>
                                ACCOUNT HOLDER
                            </span>

                            <h2>
                                {displayName}
                            </h2>

                            <p>
                                @{profile?.username}
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        PROFILE INFORMATION
                    ================================================= */}

                    <div className="profile-information">


                        {/* =================================================
                            FIRST NAME
                        ================================================= */}

                        <div className="profile-info-item">

                            <div className="profile-info-icon">
                                <i className="bi bi-person"></i>
                            </div>

                            <div className="profile-info-content">

                                <span>
                                    First Name
                                </span>

                                <strong>
                                    {profile?.first_name ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            LAST NAME
                        ================================================= */}

                        <div className="profile-info-item">

                            <div className="profile-info-icon">
                                <i className="bi bi-person"></i>
                            </div>

                            <div className="profile-info-content">

                                <span>
                                    Last Name
                                </span>

                                <strong>
                                    {profile?.last_name ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            USERNAME
                        ================================================= */}

                        <div className="profile-info-item">

                            <div className="profile-info-icon">
                                <i className="bi bi-at"></i>
                            </div>

                            <div className="profile-info-content">

                                <span>
                                    Username
                                </span>

                                <strong>
                                    {profile?.username ||
                                        "Not available"}
                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="profile-info-item">

                            <div className="profile-info-icon">
                                <i className="bi bi-envelope"></i>
                            </div>

                            <div className="profile-info-content">

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {profile?.email ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        PROFILE FOOTER
                    ================================================= */}

                    <div className="profile-card-footer">

                        <div className="profile-footer-info">

                            <i className="bi bi-shield-check"></i>

                            <span>
                                Your account information is securely
                                connected to BookingX.
                            </span>

                        </div>


                        {/* MY BOOKINGS */}

                        <button
                            className="profile-bookings-button"
                            onClick={() => navigate("/bookings")}
                        >

                            <i className="bi bi-calendar-check"></i>

                            My Bookings

                            <i className="bi bi-arrow-right"></i>

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Profile;

