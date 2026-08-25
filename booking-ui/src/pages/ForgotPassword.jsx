import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import "./ForgotPassword.css";


function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);


    /* =========================================================
       SEND PASSWORD RESET LINK
    ========================================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            // -------------------------------------------------
            // VALIDATE EMAIL
            // -------------------------------------------------

            const trimmedEmail = email.trim();

            if (!trimmedEmail) {

                setError(
                    "Please enter your email address."
                );

                return;
            }


            // -------------------------------------------------
            // SEND REQUEST TO DJANGO
            // -------------------------------------------------

            const data = await forgotPassword(
                trimmedEmail
            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------
            //
            // The backend intentionally returns the same
            // response whether the email exists or not.
            //
            // This prevents account/email enumeration.
            //

            setSuccess(
                data.detail ||
                "If an account exists with this email address, a password reset link has been sent."
            );


            // Clear email field after successful request.

            setEmail("");


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            // -------------------------------------------------
            // HANDLE API VALIDATION ERRORS
            // -------------------------------------------------

            if (
                error?.data?.email
            ) {

                setError(
                    Array.isArray(
                        error.data.email
                    )
                        ? error.data.email[0]
                        : error.data.email
                );

            } else if (
                error?.data?.detail
            ) {

                setError(
                    error.data.detail
                );

            } else {

                setError(
                    "Unable to send password reset link. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="auth-page">


            {/* =================================================
                LEFT SIDE
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

                            Get back

                            <br />

                            <span>access</span> securely.

                        </h1>


                        <p>

                            Don't worry if you've forgotten your password.
                            We'll help you securely regain access to your
                            BookingX account.

                        </p>

                    </div>


                    {/* =================================================
                        TRUST ITEMS
                    ================================================= */}

                    <div className="auth-trust">


                        <div className="auth-trust-item">

                            <i className="bi bi-shield-check"></i>

                            <span>
                                Secure recovery
                            </span>

                        </div>


                        <div className="auth-trust-item">

                            <i className="bi bi-envelope-check"></i>

                            <span>
                                Email verification
                            </span>

                        </div>


                    </div>

                </div>

            </div>


            {/* =================================================
                RIGHT SIDE
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

                            PASSWORD RECOVERY

                        </span>


                        <h2>

                            Forgot your password?

                        </h2>


                        <p>

                            Enter the email address associated with
                            your account and we'll send you a link
                            to reset your password.

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
                        FORGOT PASSWORD FORM
                    ================================================= */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="auth-field">

                            <label htmlFor="email">

                                Email Address

                            </label>


                            <div className="auth-input-wrapper">

                                <i className="bi bi-envelope"></i>


                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {

                                        setEmail(
                                            e.target.value
                                        );

                                        setError("");
                                        setSuccess("");

                                    }}
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================================
                            SUBMIT BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            {loading ? (

                                <>

                                    <span className="auth-spinner"></span>

                                    Sending...

                                </>

                            ) : (

                                <>

                                    Send Reset Link

                                    <i className="bi bi-arrow-right"></i>

                                </>

                            )}

                        </button>

                    </form>


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


export default ForgotPassword;

