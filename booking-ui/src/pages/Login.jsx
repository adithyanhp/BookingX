import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";


function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const successMessage = location.state?.successMessage || "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/auth/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.detail || "Invalid username or password."
                );
                return;
            }

            localStorage.setItem(
                "access_token",
                data.access
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );

            navigate("/");
        } catch (error) {
            console.error(error);
            setError("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* Left Side */}
            <div className="auth-visual">

                <div className="auth-visual-overlay"></div>

                <div className="auth-visual-content">

                    <Link to="/" className="auth-logo">
                        <span className="auth-logo-icon">
                            <i className="bi bi-buildings"></i>
                        </span>

                        <span>
                            Booking<span>X</span>
                        </span>
                    </Link>

                    <div className="auth-visual-text">

                        <span className="auth-eyebrow">
                            <i className="bi bi-stars"></i>
                            TRAVEL WITH CONFIDENCE
                        </span>

                        <h1>
                            Your next
                            <br />
                            <span>stay</span> starts here.
                        </h1>

                        <p>
                            Discover comfortable stays, book with ease,
                            and manage all your reservations in one place.
                        </p>

                    </div>

                    <div className="auth-trust">

                        <div className="auth-trust-item">
                            <i className="bi bi-shield-check"></i>
                            <span>Secure booking</span>
                        </div>

                        <div className="auth-trust-item">
                            <i className="bi bi-clock-history"></i>
                            <span>Easy management</span>
                        </div>

                    </div>

                </div>

            </div>


            {/* Right Side */}
            <div className="auth-form-section">

                <div className="auth-form-container">

                    <div className="auth-mobile-logo">

                        <Link to="/" className="auth-logo">
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
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Continue your journey with BookingX.
                        </p>

                    </div>


                    {/* Success Message */}
                    {successMessage && (
                        <div className="auth-message auth-success">
                            <i className="bi bi-check-circle-fill"></i>

                            <span>
                                {successMessage}
                            </span>
                        </div>
                    )}


                    {/* Error Message */}
                    {error && (
                        <div className="auth-message auth-error">
                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>
                        </div>
                    )}


                    {/* Form */}
                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Username */}
                        <div className="auth-field">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-person"></i>

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="auth-field">

                            <div className="auth-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                            </div>

                            <div className="auth-input-wrapper">

                                <i className="bi bi-lock"></i>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
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


                        {/* Submit */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="auth-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <i className="bi bi-arrow-right"></i>
                                </>
                            )}

                        </button>

                    </form>


                    {/* Register */}
                    <div className="auth-switch">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create one
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

export default Login;

