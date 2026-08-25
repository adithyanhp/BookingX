import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ResetPassword.css";

// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000/api";

// =========================================================
// RESET PASSWORD PAGE
// =========================================================

function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // -----------------------------------------------------
        // CHECK RESET LINK
        // -----------------------------------------------------

        if (!uid || !token) {
            setError(
                "This password reset link is invalid or incomplete."
            );
            return;
        }

        // -----------------------------------------------------
        // CHECK PASSWORD
        // -----------------------------------------------------

        if (!newPassword) {
            setError("Please enter a new password.");
            return;
        }

        // -----------------------------------------------------
        // CHECK PASSWORD LENGTH
        // -----------------------------------------------------

        if (newPassword.length < 8) {
            setError(
                "Password must be at least 8 characters long."
            );
            return;
        }

        // -----------------------------------------------------
        // CHECK PASSWORD CONFIRMATION
        // -----------------------------------------------------

        if (!newPassword2) {
            setError("Please confirm your new password.");
            return;
        }

        // -----------------------------------------------------
        // CHECK PASSWORD MATCH
        // -----------------------------------------------------

        if (newPassword !== newPassword2) {
            setError("New passwords do not match.");
            return;
        }

        // -----------------------------------------------------
        // START LOADING
        // -----------------------------------------------------

        setLoading(true);

        try {
            // =================================================
            // SEND RESET PASSWORD REQUEST
            // =================================================

            const response = await fetch(
                `${API_BASE_URL}/auth/reset-password/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        uid: uid,
                        token: token,
                        new_password: newPassword,
                        new_password2: newPassword2,
                    }),
                }
            );

            // -------------------------------------------------
            // READ RESPONSE
            // -------------------------------------------------

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            // =================================================
            // HANDLE API ERROR
            // =================================================

            if (!response.ok) {
                console.error(
                    "Reset password API error:",
                    response.status,
                    data
                );

                // ---------------------------------------------
                // PASSWORD ERROR
                // ---------------------------------------------

                if (data.new_password) {
                    setError(
                        Array.isArray(data.new_password)
                            ? data.new_password[0]
                            : data.new_password
                    );
                }

                // ---------------------------------------------
                // PASSWORD CONFIRMATION ERROR
                // ---------------------------------------------

                else if (data.new_password2) {
                    setError(
                        Array.isArray(data.new_password2)
                            ? data.new_password2[0]
                            : data.new_password2
                    );
                }

                // ---------------------------------------------
                // TOKEN ERROR
                // ---------------------------------------------

                else if (data.token) {
                    setError(
                        Array.isArray(data.token)
                            ? data.token[0]
                            : data.token
                    );
                }

                // ---------------------------------------------
                // UID ERROR
                // ---------------------------------------------

                else if (data.uid) {
                    setError(
                        Array.isArray(data.uid)
                            ? data.uid[0]
                            : data.uid
                    );
                }

                // ---------------------------------------------
                // DETAIL ERROR
                // ---------------------------------------------

                else if (data.detail) {
                    setError(
                        Array.isArray(data.detail)
                            ? data.detail[0]
                            : data.detail
                    );
                }

                // ---------------------------------------------
                // NON-FIELD ERROR
                // ---------------------------------------------

                else if (typeof data === "string") {
                    setError(data);
                }

                // ---------------------------------------------
                // UNKNOWN ERROR
                // ---------------------------------------------

                else {
                    setError(
                        "Unable to reset your password. Please try again."
                    );
                }

                return;
            }

            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                data.detail ||
                    "Your password has been reset successfully."
            );

            // -------------------------------------------------
            // CLEAR PASSWORD FIELDS
            // -------------------------------------------------

            setNewPassword("");
            setNewPassword2("");
        } catch (error) {
            // =================================================
            // CONNECTION ERROR
            // =================================================

            console.error(
                "Reset password connection error:",
                error
            );

            setError(
                "Unable to connect to the server. Please make sure the Django server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="auth-page">

            {/* =================================================
                LEFT VISUAL SECTION
            ================================================= */}

            <div className="auth-visual">

                <div className="auth-visual-overlay"></div>

                <div className="auth-visual-content">

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <Link
                        to="/"
                        className="auth-logo"
                    >
                        <span className="auth-logo-icon">
                            <i className="bi bi-buildings"></i>
                        </span>

                        <span>
                            Booking<span>X</span>
                        </span>
                    </Link>

                    {/* =================================================
                        VISUAL TEXT
                    ================================================= */}

                    <div className="auth-visual-text">

                        <span className="auth-eyebrow">
                            <i className="bi bi-shield-lock"></i>
                            ACCOUNT SECURITY
                        </span>

                        <h1>
                            Create a
                            <br />
                            <span>new password.</span>
                        </h1>

                        <p>
                            Choose a strong password to keep
                            your BookingX account secure.
                        </p>

                    </div>

                    {/* =================================================
                        TRUST ITEMS
                    ================================================= */}

                    <div className="auth-trust">

                        <div className="auth-trust-item">
                            <i className="bi bi-shield-check"></i>

                            <span>
                                Secure password reset
                            </span>
                        </div>

                        <div className="auth-trust-item">
                            <i className="bi bi-lock"></i>

                            <span>
                                Your password is encrypted
                            </span>
                        </div>

                    </div>

                </div>
            </div>

            {/* =================================================
                RIGHT FORM SECTION
            ================================================= */}

            <div className="auth-form-section">

                <div className="auth-form-container">

                    {/* =================================================
                        MOBILE LOGO
                    ================================================= */}

                    <div className="auth-mobile-logo">

                        <Link
                            to="/"
                            className="auth-logo"
                        >
                            <span className="auth-logo-icon">
                                <i className="bi bi-buildings"></i>
                            </span>

                            <span>
                                Booking<span>X</span>
                            </span>
                        </Link>

                    </div>

                    {/* =================================================
                        HEADING
                    ================================================= */}

                    <div className="auth-heading">

                        <span className="auth-label">
                            PASSWORD RESET
                        </span>

                        <h2>
                            Set a new password
                        </h2>

                        <p>
                            Enter your new password below.
                            Make sure it is strong and secure.
                        </p>

                    </div>

                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {success && (
                        <div className="auth-message auth-success">

                            <i className="bi bi-check-circle-fill"></i>

                            <span>
                                {success}
                            </span>

                        </div>
                    )}

                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (
                        <div className="auth-message auth-error">

                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}

                    {/* =================================================
                        RESET PASSWORD FORM
                    ================================================= */}

                    {!success && (
                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >

                            {/* =========================================
                                NEW PASSWORD
                            ========================================= */}

                            <div className="auth-field">

                                <label htmlFor="new-password">
                                    New Password
                                </label>

                                <div className="auth-input-wrapper">

                                    <i className="bi bi-lock"></i>

                                    <input
                                        id="new-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
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
                            </div>

                            {/* =========================================
                                CONFIRM PASSWORD
                            ========================================= */}

                            <div className="auth-field">

                                <label htmlFor="new-password2">
                                    Confirm New Password
                                </label>

                                <div className="auth-input-wrapper">

                                    <i className="bi bi-lock-fill"></i>

                                    <input
                                        id="new-password2"
                                        type={
                                            showPassword2
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm your new password"
                                        value={newPassword2}
                                        onChange={(e) => {
                                            setNewPassword2(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword2(
                                                !showPassword2
                                            )
                                        }
                                        aria-label={
                                            showPassword2
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        <i
                                            className={
                                                showPassword2
                                                    ? "bi bi-eye-slash"
                                                    : "bi bi-eye"
                                            }
                                        ></i>
                                    </button>

                                </div>
                            </div>

                            {/* =========================================
                                PASSWORD REQUIREMENT
                            ========================================= */}

                            <div className="auth-password-hint">

                                <i className="bi bi-info-circle"></i>

                                <span>
                                    Password must be at least 8
                                    characters long.
                                </span>

                            </div>

                            {/* =========================================
                                SUBMIT BUTTON
                            ========================================= */}

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="auth-spinner"></span>
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <i className="bi bi-arrow-right"></i>
                                    </>
                                )}
                            </button>

                        </form>
                    )}

                    {/* =================================================
                        AFTER SUCCESS
                    ================================================= */}

                    {success && (
                        <button
                            type="button"
                            className="auth-submit-btn"
                            onClick={() => navigate("/login")}
                        >
                            Continue to Login
                            <i className="bi bi-arrow-right"></i>
                        </button>
                    )}

                    {/* =================================================
                        BACK TO LOGIN
                    ================================================= */}

                    <div className="auth-switch">

                        <span>
                            Remember your password?
                        </span>

                        <Link to="/login">
                            Sign in
                            <i className="bi bi-arrow-up-right"></i>
                        </Link>

                    </div>

                    {/* =================================================
                        BACK HOME
                    ================================================= */}

                    <Link
                        to="/"
                        className="auth-back-home"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to BookingX
                    </Link>

                </div>
            </div>

        </div>
    );
}

export default ResetPassword;

