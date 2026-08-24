import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getUserProfile,
    deleteAccount,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

import "./Profile.css";


function Profile() {

    const navigate = useNavigate();

    const { logout } = useAuth();


    // =========================================================
    // PROFILE STATE
    // =========================================================

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // DELETE ACCOUNT STATE
    // =========================================================

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState("");


    // =========================================================
    // LOAD USER PROFILE
    // =========================================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getUserProfile();

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
    // PREVENT BODY SCROLL WHEN DELETE MODAL IS OPEN
    // =========================================================

    useEffect(() => {

        if (showDeleteModal) {

            document.body.style.overflow = "hidden";

        } else {

            document.body.style.overflow = "";
        }


        return () => {

            document.body.style.overflow = "";

        };

    }, [showDeleteModal]);


    // =========================================================
    // OPEN DELETE MODAL
    // =========================================================

    const openDeleteModal = () => {

        setCurrentPassword("");

        setDeleteError("");

        setShowPassword(false);

        setShowDeleteModal(true);
    };


    // =========================================================
    // CLOSE DELETE MODAL
    // =========================================================

    const closeDeleteModal = () => {

        // Do not allow the user to close the modal while
        // the account deletion request is being processed.

        if (deleteLoading) {

            return;
        }


        setShowDeleteModal(false);

        setCurrentPassword("");

        setDeleteError("");

        setShowPassword(false);
    };


    // =========================================================
    // DELETE ACCOUNT
    // =========================================================

    const handleDeleteAccount = async (event) => {

        event.preventDefault();


        // -----------------------------------------------------
        // Prevent duplicate submission
        // -----------------------------------------------------

        if (deleteLoading) {

            return;
        }


        // -----------------------------------------------------
        // Validate current password
        // -----------------------------------------------------

        if (!currentPassword.trim()) {

            setDeleteError(
                "Please enter your current password."
            );

            return;
        }


        try {

            setDeleteLoading(true);

            setDeleteError("");


            // -------------------------------------------------
            // PERMANENT ACCOUNT DELETION
            // -------------------------------------------------

            await deleteAccount(
                currentPassword
            );


            // -------------------------------------------------
            // Close modal and clear local state
            // -------------------------------------------------

            setShowDeleteModal(false);

            setCurrentPassword("");

            setDeleteError("");

            setShowPassword(false);


            // -------------------------------------------------
            // LOGOUT
            //
            // AuthContext is responsible for clearing:
            //
            // access_token
            // refresh_token
            //
            // and updating authentication state.
            // -------------------------------------------------

            await logout();


            // -------------------------------------------------
            // REDIRECT TO LOGIN
            // -------------------------------------------------
            //
            // replace:true prevents the user from returning
            // to the deleted account using the browser Back
            // button.
            //
            // accountDeleted allows the Login page to display
            // an optional success message.
            // -------------------------------------------------

            navigate(
                "/login",
                {
                    replace: true,
                    state: {
                        accountDeleted: true,
                    },
                }
            );


        } catch (error) {

            console.error(
                "Failed to delete account:",
                error
            );


            // -------------------------------------------------
            // INCORRECT PASSWORD
            // -------------------------------------------------

            if (error?.status === 400) {

                setDeleteError(
                    error?.data?.detail ||
                    "The password you entered is incorrect."
                );


            // -------------------------------------------------
            // AUTHENTICATION / SESSION EXPIRED
            // -------------------------------------------------

            } else if (error?.status === 401) {

                setDeleteError(
                    "Your login session has expired. Please login again."
                );


            // -------------------------------------------------
            // OTHER SERVER ERRORS
            // -------------------------------------------------

            } else {

                setDeleteError(
                    "Unable to delete your account. Please try again."
                );
            }


        } finally {

            setDeleteLoading(false);
        }
    };


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
    // PROFILE ERROR
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
                            onClick={() =>
                                navigate("/login")
                            }
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

    const profileImage =
        profile?.profile_image || null;


    // =========================================================
    // DISPLAY NAME
    // =========================================================

    const displayName =
        profile?.first_name ||
        profile?.last_name
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
                        PROFILE CARD HEADER
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


                        {/* FIRST NAME */}

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


                        {/* LAST NAME */}

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


                        {/* USERNAME */}

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


                        {/* EMAIL */}

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


                        {/* FOOTER INFORMATION */}

                        <div className="profile-footer-info">

                            <i className="bi bi-shield-check"></i>


                            <span>
                                Your account information is securely
                                connected to BookingX.
                            </span>

                        </div>


                        {/* PROFILE ACTIONS */}

                        <div className="profile-actions">


                            {/* EDIT PROFILE */}

                            <button
                                className="profile-action-button profile-edit-button"
                                onClick={() =>
                                    navigate("/edit-profile")
                                }
                            >

                                <i className="bi bi-pencil-square"></i>

                                Edit Profile

                                <i className="bi bi-arrow-right"></i>

                            </button>


                            {/* MY BOOKINGS */}

                            <button
                                className="profile-action-button profile-bookings-button"
                                onClick={() =>
                                    navigate("/bookings")
                                }
                            >

                                <i className="bi bi-calendar-check"></i>

                                My Bookings

                                <i className="bi bi-arrow-right"></i>

                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    DELETE ACCOUNT SECTION
                ================================================= */}

                <div className="profile-danger-card">


                    <div className="profile-danger-content">

                        <div className="profile-danger-icon">

                            <i className="bi bi-trash3"></i>

                        </div>


                        <div>

                            <h3>
                                Delete Account
                            </h3>


                            <p>
                                Permanently delete your BookingX
                                account and associated data.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="profile-delete-button"
                        onClick={openDeleteModal}
                    >

                        <i className="bi bi-trash3"></i>

                        Delete Account

                    </button>

                </div>

            </div>


            {/* =====================================================
                DELETE ACCOUNT MODAL
            ===================================================== */}

            {showDeleteModal && (

                <div
                    className="profile-delete-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeDeleteModal();
                        }

                    }}
                >

                    <div
                        className="profile-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                    >


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="profile-delete-modal-header">

                            <div className="profile-delete-modal-icon">

                                <i className="bi bi-exclamation-triangle"></i>

                            </div>


                            <button
                                type="button"
                                className="profile-delete-modal-close"
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                                aria-label="Close"
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* =================================================
                            MODAL CONTENT
                        ================================================= */}

                        <div className="profile-delete-modal-content">

                            <h2 id="delete-account-title">
                                Delete your account?
                            </h2>


                            <p>
                                This action is permanent. Your
                                BookingX account, profile, bookings,
                                and associated user data will be
                                permanently deleted.
                            </p>


                            {/* WARNING */}

                            <div className="profile-delete-warning">

                                <i className="bi bi-shield-exclamation"></i>


                                <span>
                                    This cannot be undone once
                                    your account is deleted.
                                </span>

                            </div>


                            {/* =================================================
                                PASSWORD FORM
                            ================================================= */}

                            <form
                                onSubmit={handleDeleteAccount}
                                className="profile-delete-form"
                            >

                                <label
                                    htmlFor="delete-account-password"
                                >
                                    Current Password
                                </label>


                                <div className="profile-password-wrapper">

                                    <input
                                        id="delete-account-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={currentPassword}
                                        onChange={(event) => {

                                            setCurrentPassword(
                                                event.target.value
                                            );


                                            if (deleteError) {

                                                setDeleteError("");
                                            }

                                        }}
                                        placeholder="Enter your current password"
                                        autoComplete="current-password"
                                        disabled={deleteLoading}
                                    />


                                    <button
                                        type="button"
                                        className="profile-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        disabled={deleteLoading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        <i
                                            className={
                                                showPassword
                                                    ? "bi bi-eye-slash"
                                                    : "bi bi-eye"
                                            }
                                        ></i>

                                    </button>

                                </div>


                                {/* DELETE ERROR */}

                                {deleteError && (

                                    <div className="profile-delete-error">

                                        <i className="bi bi-exclamation-circle"></i>


                                        <span>
                                            {deleteError}
                                        </span>

                                    </div>

                                )}


                                {/* MODAL ACTIONS */}

                                <div className="profile-delete-modal-actions">


                                    {/* CANCEL */}

                                    <button
                                        type="button"
                                        className="profile-delete-cancel-button"
                                        onClick={closeDeleteModal}
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </button>


                                    {/* CONFIRM DELETE */}

                                    <button
                                        type="submit"
                                        className="profile-delete-confirm-button"
                                        disabled={
                                            deleteLoading ||
                                            !currentPassword.trim()
                                        }
                                    >

                                        {deleteLoading ? (

                                            <>

                                                <span
                                                    className="profile-delete-spinner"
                                                ></span>

                                                Deleting...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-trash3"></i>

                                                Permanently Delete

                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default Profile;
