import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {

    const navigate = useNavigate();

    const {
        isAuthenticated,
        logout,
    } = useAuth();


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        logout();

        navigate("/");
    };


    return (
        <header className="site-header">

            <nav className="navbar navbar-expand-lg">

                <div className="container">


                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <Link
                        className="navbar-brand booking-logo"
                        to="/"
                    >

                        <span className="logo-icon">
                            <i className="bi bi-buildings"></i>
                        </span>

                        <span>
                            Booking<span className="logo-x">X</span>
                        </span>

                    </Link>


                    {/* =================================================
                        MOBILE MENU BUTTON
                    ================================================= */}

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >

                        <i className="bi bi-list"></i>

                    </button>


                    {/* =================================================
                        NAVIGATION
                    ================================================= */}

                    <div
                        className="collapse navbar-collapse"
                        id="mainNavbar"
                    >


                        {/* =================================================
                            MAIN NAVIGATION
                        ================================================= */}

                        <ul className="navbar-nav mx-auto booking-nav">


                            {/* Hotels */}

                            <li className="nav-item">

                                <Link
                                    className="nav-link active"
                                    to="/"
                                >

                                    <i className="bi bi-building"></i>

                                    Hotels

                                </Link>

                            </li>


                            {/* Flights */}

                            <li className="nav-item">

                                <Link
                                    className="nav-link"
                                    to="/"
                                >

                                    <i className="bi bi-airplane"></i>

                                    Flights

                                </Link>

                            </li>


                            {/* Tours */}

                            <li className="nav-item">

                                <Link
                                    className="nav-link"
                                    to="/"
                                >

                                    <i className="bi bi-map"></i>

                                    Tours

                                </Link>

                            </li>


                            {/* Cabs */}

                            <li className="nav-item">

                                <Link
                                    className="nav-link"
                                    to="/"
                                >

                                    <i className="bi bi-car-front"></i>

                                    Cabs

                                </Link>

                            </li>

                        </ul>


                        {/* =================================================
                            RIGHT SIDE ACTIONS
                        ================================================= */}

                        <div className="navbar-actions">


                            {isAuthenticated ? (

                                <>


                                    {/* =================================================
                                        PROFILE
                                    ================================================= */}

                                    <Link
                                        to="/profile"
                                        className="login-button"
                                    >

                                        <i className="bi bi-person-circle"></i>

                                        Profile

                                    </Link>


                                    {/* =================================================
                                        MY BOOKINGS
                                    ================================================= */}

                                    <Link
                                        to="/bookings"
                                        className="login-button"
                                    >

                                        <i className="bi bi-calendar-check"></i>

                                        My Bookings

                                    </Link>


                                    {/* =================================================
                                        LOGOUT
                                    ================================================= */}

                                    <button
                                        onClick={handleLogout}
                                        className="register-button"
                                    >

                                        <i className="bi bi-box-arrow-right"></i>

                                        Logout

                                    </button>

                                </>

                            ) : (

                                <>


                                    {/* =================================================
                                        LOGIN
                                    ================================================= */}

                                    <Link
                                        to="/login"
                                        className="login-button"
                                    >

                                        <i className="bi bi-person"></i>

                                        Login

                                    </Link>


                                    {/* =================================================
                                        REGISTER
                                    ================================================= */}

                                    <Link
                                        to="/register"
                                        className="register-button"
                                    >

                                        Register

                                        <i className="bi bi-arrow-right"></i>

                                    </Link>

                                </>

                            )}

                        </div>

                    </div>

                </div>

            </nav>

        </header>
    );
}


export default Navbar;

