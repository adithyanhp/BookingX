import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getUserProfile,
    updateUserProfile,
} from "../services/api";

import "./EditProfile.css";

function EditProfile() {
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getUserProfile();

                setProfile(data);

                setFormData({
                    first_name: data?.first_name || "",
                    last_name: data?.last_name || "",
                    username: data?.username || "",
                    email: data?.email || "",
                });

                setImagePreview(data?.profile_image || "");
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
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Clear messages while editing
        setError("");
        setSuccess("");
    };

    // =========================================================
    // HANDLE PROFILE IMAGE
    // =========================================================

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // -----------------------------------------------------
        // Validate file type
        // -----------------------------------------------------

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );

            return;
        }

        // -----------------------------------------------------
        // Validate file size
        // Maximum: 5 MB
        // -----------------------------------------------------

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Profile image must be smaller than 5 MB."
            );

            return;
        }

        setSelectedImage(file);

        setError("");
        setSuccess("");

        // -----------------------------------------------------
        // Create preview
        // -----------------------------------------------------

        const previewUrl = URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    // =========================================================
    // REMOVE SELECTED IMAGE
    // =========================================================

    const handleRemoveImage = () => {
        setSelectedImage(null);

        if (profile?.profile_image) {
            setImagePreview(profile.profile_image);
        } else {
            setImagePreview("");
        }
    };

    // =========================================================
    // SAVE PROFILE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const data = await updateUserProfile({
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                profile_image: selectedImage,
            });

            // -------------------------------------------------
            // Update local profile state
            // -------------------------------------------------

            setProfile(data);

            // -------------------------------------------------
            // Update form values using response
            // -------------------------------------------------

            setFormData({
                first_name: data?.first_name || "",
                last_name: data?.last_name || "",
                username: data?.username || "",
                email: data?.email || "",
            });

            setSelectedImage(null);

            setImagePreview(
                data?.profile_image || ""
            );

            setSuccess(
                "Your profile has been updated successfully."
            );

            // -------------------------------------------------
            // Return to profile after a short delay
            // -------------------------------------------------

            setTimeout(() => {
                navigate("/profile");
            }, 1200);
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            // -------------------------------------------------
            // Handle Django validation errors
            // -------------------------------------------------

            const responseData = error?.data;

            if (responseData) {
                if (responseData.username) {
                    setError(
                        Array.isArray(responseData.username)
                            ? responseData.username[0]
                            : responseData.username
                    );
                } else if (responseData.email) {
                    setError(
                        Array.isArray(responseData.email)
                            ? responseData.email[0]
                            : responseData.email
                    );
                } else if (responseData.profile_image) {
                    setError(
                        Array.isArray(
                            responseData.profile_image
                        )
                            ? responseData.profile_image[0]
                            : responseData.profile_image
                    );
                } else {
                    setError(
                        "Unable to update your profile. Please check your information."
                    );
                }
            } else {
                setError(
                    "Unable to update your profile. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="edit-profile-page">
                <div className="edit-profile-container">
                    <div className="edit-profile-loading">
                        <div className="edit-profile-spinner"></div>

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
    // ERROR WHILE LOADING
    // =========================================================

    if (!profile && error) {
        return (
            <div className="edit-profile-page">
                <div className="edit-profile-container">
                    <div className="edit-profile-error">
                        <div className="edit-profile-error-icon">
                            <i className="bi bi-person-x"></i>
                        </div>

                        <h2>
                            Unable to load profile
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="edit-profile-back-button"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <i className="bi bi-arrow-left"></i>

                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN EDIT PROFILE
    // =========================================================

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="edit-profile-header">

                    <button
                        type="button"
                        className="edit-profile-back-link"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <i className="bi bi-arrow-left"></i>

                        Back to Profile
                    </button>

                    <span className="edit-profile-label">
                        <i className="bi bi-pencil-square"></i>

                        ACCOUNT SETTINGS
                    </span>

                    <h1>
                        Edit Profile
                    </h1>

                    <p>
                        Update your personal information
                        and profile picture.
                    </p>
                </div>

                {/* =================================================
                    EDIT CARD
                ================================================= */}

                <div className="edit-profile-card">

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="edit-profile-card-header">

                        <div>
                            <span className="edit-profile-section-label">
                                PROFILE INFORMATION
                            </span>

                            <h2>
                                Personal Details
                            </h2>

                            <p>
                                Keep your BookingX account
                                information up to date.
                            </p>
                        </div>

                    </div>

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="edit-profile-form"
                    >

                        {/* =================================================
                            PROFILE IMAGE
                        ================================================= */}

                        <div className="edit-profile-image-section">

                            <div className="edit-profile-image-wrapper">

                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className="edit-profile-image"
                                    />
                                ) : (
                                    <div className="edit-profile-image-placeholder">
                                        <i className="bi bi-person-fill"></i>
                                    </div>
                                )}

                            </div>

                            <div className="edit-profile-image-content">

                                <h3>
                                    Profile Picture
                                </h3>

                                <p>
                                    JPG, PNG or WEBP.
                                    Maximum size 5 MB.
                                </p>

                                <div className="edit-profile-image-actions">

                                    <label
                                        htmlFor="profile-image"
                                        className="edit-profile-upload-button"
                                    >
                                        <i className="bi bi-camera"></i>

                                        Choose Image
                                    </label>

                                    <input
                                        id="profile-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        hidden
                                    />

                                    {selectedImage && (
                                        <button
                                            type="button"
                                            className="edit-profile-remove-image"
                                            onClick={
                                                handleRemoveImage
                                            }
                                        >
                                            <i className="bi bi-x-circle"></i>

                                            Cancel Image
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div className="edit-profile-divider"></div>

                        {/* =================================================
                            FORM GRID
                        ================================================= */}

                        <div className="edit-profile-form-grid">

                            {/* FIRST NAME */}

                            <div className="edit-profile-field">

                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <div className="edit-profile-input-wrapper">

                                    <i className="bi bi-person"></i>

                                    <input
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your first name"
                                        autoComplete="given-name"
                                    />

                                </div>
                            </div>

                            {/* LAST NAME */}

                            <div className="edit-profile-field">

                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <div className="edit-profile-input-wrapper">

                                    <i className="bi bi-person"></i>

                                    <input
                                        id="last_name"
                                        type="text"
                                        name="last_name"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your last name"
                                        autoComplete="family-name"
                                    />

                                </div>
                            </div>

                            {/* USERNAME */}

                            <div className="edit-profile-field">

                                <label htmlFor="username">
                                    Username
                                </label>

                                <div className="edit-profile-input-wrapper">

                                    <i className="bi bi-at"></i>

                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                    />

                                </div>
                            </div>

                            {/* EMAIL */}

                            <div className="edit-profile-field">

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="edit-profile-input-wrapper">

                                    <i className="bi bi-envelope"></i>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />

                                </div>
                            </div>

                        </div>

                        {/* =================================================
                            ERROR MESSAGE
                        ================================================= */}

                        {error && (
                            <div className="edit-profile-message edit-profile-error-message">

                                <i className="bi bi-exclamation-circle"></i>

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}

                        {/* =================================================
                            SUCCESS MESSAGE
                        ================================================= */}

                        {success && (
                            <div className="edit-profile-message edit-profile-success-message">

                                <i className="bi bi-check-circle"></i>

                                <span>
                                    {success}
                                </span>

                            </div>
                        )}

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="edit-profile-actions">

                            <button
                                type="button"
                                className="edit-profile-cancel-button"
                                onClick={() =>
                                    navigate("/profile")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="edit-profile-save-button"
                                disabled={saving}
                            >

                                {saving ? (
                                    <>
                                        <span className="edit-profile-button-spinner"></span>

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2"></i>

                                        Save Changes
                                    </>
                                )}

                            </button>

                        </div>

                    </form>
                </div>

                {/* =================================================
                    SECURITY CARD
                ================================================= */}

                <div className="edit-profile-security-card">

                    <div className="edit-profile-security-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>

                    <div className="edit-profile-security-content">

                        <span>
                            ACCOUNT SECURITY
                        </span>

                        <h3>
                            Password
                        </h3>

                        <p>
                            Keep your account secure by
                            regularly updating your password.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="edit-profile-password-button"
                        onClick={() =>
                            navigate("/change-password")
                        }
                    >
                        Change Password

                        <i className="bi bi-arrow-right"></i>
                    </button>

                </div>

            </div>
        </div>
    );
}

export default EditProfile;

