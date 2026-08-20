import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    /* =========================================================
       ERROR MESSAGE HELPER
    ========================================================= */

    const getErrorMessage = (error) => {
        if (!error) {
            return "Unable to create your account.";
        }

        // API error structure:
        // {
        //     status: 400,
        //     data: {...}
        // }

        if (error.data) {
            const data = error.data;

            if (typeof data === "string") {
                return data;
            }

            if (data.detail) {
                return data.detail;
            }

            if (data.message) {
                return data.message;
            }

            // Django validation errors
            if (data.username) {
                return Array.isArray(data.username)
                    ? data.username[0]
                    : data.username;
            }

            if (data.email) {
                return Array.isArray(data.email)
                    ? data.email[0]
                    : data.email;
            }

            if (data.password) {
                return Array.isArray(data.password)
                    ? data.password[0]
                    : data.password;
            }

            if (data.password2) {
                return Array.isArray(data.password2)
                    ? data.password2[0]
                    : data.password2;
            }

            // Handle non-field errors
            if (data.non_field_errors) {
                return Array.isArray(data.non_field_errors)
                    ? data.non_field_errors[0]
                    : data.non_field_errors;
            }
        }

        if (error.message) {
            return error.message;
        }

        return "Unable to create your account.";
    };


    /* =========================================================
       REGISTER
    ========================================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");


        // Password confirmation
        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }


        setLoading(true);

        try {
            await registerUser({
                username,
                email,
                password,
                password2,
            });


            // Registration successful
            navigate("/login", {
                state: {
                    successMessage:
                        "Registration successful. Please login to continue.",
                },
            });

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setError(
                getErrorMessage(error)
            );

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

                    {/* Logo */}
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


                    {/* Visual text */}
                    <div className="auth-visual-text">

                        <span className="auth-eyebrow">
                            <i className="bi bi-globe2"></i>

                            YOUR JOURNEY BEGINS HERE
                        </span>

                        <h1>
                            Find your
                            <br />
                            perfect <span>stay.</span>
                        </h1>

                        <p>
                            Create your BookingX account and make
                            hotel reservations simple, fast, and
                            stress-free.
                        </p>

                    </div>


                    {/* Trust items */}
                    <div className="auth-trust">

                        <div className="auth-trust-item">
                            <i className="bi bi-search"></i>

                            <span>
                                Find great stays
                            </span>
                        </div>

                        <div className="auth-trust-item">
                            <i className="bi bi-calendar-check"></i>

                            <span>
                                Manage bookings
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

                    {/* Mobile Logo */}
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


                    {/* Heading */}
                    <div className="auth-heading">

                        <span className="auth-label">
                            GET STARTED
                        </span>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Join BookingX and start planning your
                            next stay.
                        </p>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="auth-message auth-error">

                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Username */}
                        <div className="auth-field">

                            <label htmlFor="register-username">
                                Username
                            </label>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-person"></i>

                                <input
                                    id="register-username"
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* Email */}
                        <div className="auth-field">

                            <label htmlFor="register-email">
                                Email address
                            </label>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-envelope"></i>

                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="auth-field">

                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-lock"></i>

                                <input
                                    id="register-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
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


                        {/* Confirm Password */}
                        <div className="auth-field">

                            <label htmlFor="register-password2">
                                Confirm password
                            </label>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-shield-lock"></i>

                                <input
                                    id="register-password2"
                                    type={
                                        showPassword2
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm your password"
                                    value={password2}
                                    onChange={(e) =>
                                        setPassword2(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
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


                        {/* Submit */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="auth-spinner"></span>

                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account

                                    <i className="bi bi-arrow-right"></i>
                                </>
                            )}

                        </button>

                    </form>


                    {/* Login */}
                    <div className="auth-switch">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in

                            <i className="bi bi-arrow-up-right"></i>
                        </Link>

                    </div>


                    {/* Back Home */}
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

export default Register;

