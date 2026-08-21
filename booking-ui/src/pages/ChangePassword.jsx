import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePassword } from "../services/api";

import "./ChangePassword.css";


function ChangePassword() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        new_password2: "",
    });


    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));


        // Clear messages while editing

        setError("");
        setSuccess("");
    };


    // =========================================================
    // VALIDATE PASSWORD
    // =========================================================

    const validateForm = () => {

        const currentPassword =
            formData.current_password.trim();

        const newPassword =
            formData.new_password;

        const confirmPassword =
            formData.new_password2;


        // -----------------------------------------------------
        // Current password
        // -----------------------------------------------------

        if (!currentPassword) {

            return "Please enter your current password.";
        }


        // -----------------------------------------------------
        // New password
        // -----------------------------------------------------

        if (!newPassword) {

            return "Please enter your new password.";
        }


        // -----------------------------------------------------
        // Confirm password
        // -----------------------------------------------------

        if (!confirmPassword) {

            return "Please confirm your new password.";
        }


        // -----------------------------------------------------
        // Minimum length
        // -----------------------------------------------------

        if (newPassword.length < 8) {

            return (
                "Your new password must contain at least 8 characters."
            );
        }


        // -----------------------------------------------------
        // Password match
        // -----------------------------------------------------

        if (newPassword !== confirmPassword) {

            return "New passwords do not match.";
        }


        // -----------------------------------------------------
        // New password must be different
        // -----------------------------------------------------

        if (
            currentPassword ===
            newPassword
        ) {

            return (
                "Your new password must be different from your current password."
            );
        }


        return "";
    };


    // =========================================================
    // EXTRACT BACKEND ERROR MESSAGE
    // =========================================================

    const getErrorMessage = (responseData) => {

        if (!responseData) {

            return null;
        }


        // -----------------------------------------------------
        // Field errors
        // -----------------------------------------------------

        const fields = [
            "current_password",
            "new_password",
            "new_password2",
        ];


        for (const field of fields) {

            if (responseData[field]) {

                const fieldError =
                    responseData[field];


                if (Array.isArray(fieldError)) {

                    return fieldError[0];
                }


                if (
                    typeof fieldError === "string"
                ) {

                    return fieldError;
                }


                if (
                    typeof fieldError === "object"
                ) {

                    const values =
                        Object.values(fieldError);

                    if (values.length > 0) {

                        return Array.isArray(values[0])
                            ? values[0][0]
                            : values[0];
                    }
                }
            }
        }


        // -----------------------------------------------------
        // Django REST Framework non-field errors
        // -----------------------------------------------------

        if (
            responseData.non_field_errors
        ) {

            const message =
                responseData.non_field_errors;


            if (Array.isArray(message)) {

                return message[0];
            }


            return message;
        }


        // -----------------------------------------------------
        // Detail
        // -----------------------------------------------------

        if (responseData.detail) {

            if (
                Array.isArray(
                    responseData.detail
                )
            ) {

                return responseData.detail[0];
            }


            return responseData.detail;
        }


        // -----------------------------------------------------
        // Message
        // -----------------------------------------------------

        if (responseData.message) {

            if (
                Array.isArray(
                    responseData.message
                )
            ) {

                return responseData.message[0];
            }


            return responseData.message;
        }


        // -----------------------------------------------------
        // Error
        // -----------------------------------------------------

        if (responseData.error) {

            if (
                Array.isArray(
                    responseData.error
                )
            ) {

                return responseData.error[0];
            }


            return responseData.error;
        }


        return null;
    };


    // =========================================================
    // HANDLE SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError("");
        setSuccess("");


        // -----------------------------------------------------
        // Frontend validation
        // -----------------------------------------------------

        const validationError =
            validateForm();


        if (validationError) {

            setError(validationError);

            return;
        }


        setSaving(true);


        try {

            // -------------------------------------------------
            // Change password
            // -------------------------------------------------

            const response =
                await changePassword({

                    current_password:
                        formData.current_password,

                    new_password:
                        formData.new_password,

                    new_password2:
                        formData.new_password2,

                });


            console.log(
                "Password changed successfully:",
                response
            );


            // -------------------------------------------------
            // Show success
            // -------------------------------------------------

            setSuccess(
                "Your password has been changed successfully."
            );


            // -------------------------------------------------
            // Clear password fields
            // -------------------------------------------------

            setFormData({
                current_password: "",
                new_password: "",
                new_password2: "",
            });


            // -------------------------------------------------
            // Return to profile
            // -------------------------------------------------

            setTimeout(() => {

                navigate("/profile");

            }, 1500);


        } catch (error) {

            console.error(
                "Failed to change password:",
                error
            );


            const responseData =
                error?.data;


            console.error(
                "Change password backend response:",
                responseData
            );


            // -------------------------------------------------
            // Extract backend error
            // -------------------------------------------------

            const backendMessage =
                getErrorMessage(
                    responseData
                );


            if (backendMessage) {

                setError(
                    backendMessage
                );

            } else if (
                error?.status === 401
            ) {

                setError(
                    "Your login session has expired. Please login again."
                );

            } else if (
                error?.status === 400
            ) {

                setError(
                    "The password information you entered is invalid. Please check your current password and try again."
                );

            } else if (
                error?.status === 404
            ) {

                setError(
                    "Password change service was not found. Please check the API endpoint."
                );

            } else {

                setError(
                    "Unable to change your password. Please try again."
                );
            }

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (

        <div className="change-password-page">

            <div className="change-password-container">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="change-password-header">

                    <button
                        type="button"
                        className="change-password-back-link"
                        onClick={() =>
                            navigate("/edit-profile")
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Edit Profile

                    </button>


                    <span className="change-password-label">

                        <i className="bi bi-shield-lock"></i>

                        ACCOUNT SECURITY

                    </span>


                    <h1>
                        Change Password
                    </h1>


                    <p>
                        Update your password to keep your
                        BookingX account secure.
                    </p>

                </div>


                {/* =================================================
                    PASSWORD CARD
                ================================================= */}

                <div className="change-password-card">


                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="change-password-card-header">

                        <div className="change-password-card-icon">

                            <i className="bi bi-lock"></i>

                        </div>


                        <div>

                            <span className="change-password-section-label">
                                PASSWORD SETTINGS
                            </span>

                            <h2>
                                Update Your Password
                            </h2>

                            <p>
                                Enter your current password and
                                choose a new secure password.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="change-password-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            CURRENT PASSWORD
                        ================================================= */}

                        <div className="change-password-field">

                            <label htmlFor="current_password">
                                Current Password
                            </label>


                            <div className="change-password-input-wrapper">

                                <i className="bi bi-lock"></i>


                                <input
                                    id="current_password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="current_password"
                                    value={
                                        formData.current_password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your current password"
                                    autoComplete="current-password"
                                    disabled={saving}
                                />


                                <button
                                    type="button"
                                    className="change-password-visibility"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showCurrentPassword
                                            ? "Hide current password"
                                            : "Show current password"
                                    }
                                    disabled={saving}
                                >

                                    <i
                                        className={
                                            showCurrentPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            NEW PASSWORD
                        ================================================= */}

                        <div className="change-password-field">

                            <label htmlFor="new_password">
                                New Password
                            </label>


                            <div className="change-password-input-wrapper">

                                <i className="bi bi-key"></i>


                                <input
                                    id="new_password"
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="new_password"
                                    value={
                                        formData.new_password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your new password"
                                    autoComplete="new-password"
                                    disabled={saving}
                                />


                                <button
                                    type="button"
                                    className="change-password-visibility"
                                    onClick={() =>
                                        setShowNewPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? "Hide new password"
                                            : "Show new password"
                                    }
                                    disabled={saving}
                                >

                                    <i
                                        className={
                                            showNewPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>


                            <span className="change-password-hint">
                                Use at least 8 characters for your new password.
                            </span>

                        </div>


                        {/* =================================================
                            CONFIRM PASSWORD
                        ================================================= */}

                        <div className="change-password-field">

                            <label htmlFor="new_password2">
                                Confirm New Password
                            </label>


                            <div className="change-password-input-wrapper">

                                <i className="bi bi-check2-circle"></i>


                                <input
                                    id="new_password2"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="new_password2"
                                    value={
                                        formData.new_password2
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Confirm your new password"
                                    autoComplete="new-password"
                                    disabled={saving}
                                />


                                <button
                                    type="button"
                                    className="change-password-visibility"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                    disabled={saving}
                                >

                                    <i
                                        className={
                                            showConfirmPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            ERROR MESSAGE
                        ================================================= */}

                        {error && (

                            <div className="change-password-message change-password-error-message">

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

                            <div className="change-password-message change-password-success-message">

                                <i className="bi bi-check-circle"></i>

                                <span>
                                    {success}
                                </span>

                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="change-password-actions">

                            <button
                                type="button"
                                className="change-password-cancel-button"
                                onClick={() =>
                                    navigate("/edit-profile")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="change-password-save-button"
                                disabled={saving}
                            >

                                {saving ? (

                                    <>

                                        <span className="change-password-button-spinner"></span>

                                        Changing Password...

                                    </>

                                ) : (

                                    <>

                                        <i className="bi bi-shield-check"></i>

                                        Change Password

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </div>


                {/* =================================================
                    SECURITY INFORMATION
                ================================================= */}

                <div className="change-password-security-card">

                    <div className="change-password-security-icon">

                        <i className="bi bi-shield-check"></i>

                    </div>


                    <div className="change-password-security-content">

                        <span>
                            ACCOUNT SECURITY
                        </span>

                        <h3>
                            Keep your account protected
                        </h3>

                        <p>
                            Never share your password with anyone.
                            Use a unique password that you do not
                            reuse on other websites.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default ChangePassword;

