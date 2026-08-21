import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SpecialOffers from "./components/SpecialOffers";
import WhyChooseUs from "./components/WhyChooseUs";
import FeaturedHotels from "./components/FeaturedHotels";
import PopularDestinations from "./components/PopularDestinations";
import Testimonials from "./components/Testimonials";
import AppSection from "./components/AppSection";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";

import { AuthProvider } from "./context/AuthContext";


// =========================================================
// HOME PAGE
// =========================================================

function Home() {
    return (
        <>
            <Navbar />

            <main>
                <Hero />
                <SpecialOffers />
                <WhyChooseUs />
                <FeaturedHotels />
                <PopularDestinations />
                <Testimonials />
                <AppSection />
            </main>

            <Footer />
        </>
    );
}


// =========================================================
// APP ROUTES
// =========================================================

function App() {
    return (
        <AuthProvider>

            <BrowserRouter>

                <Routes>

                    {/* =================================================
                        HOME
                    ================================================= */}

                    <Route
                        path="/"
                        element={<Home />}
                    />


                    {/* =================================================
                        HOTEL SEARCH RESULTS
                    ================================================= */}

                    <Route
                        path="/hotels"
                        element={<Hotels />}
                    />


                    {/* =================================================
                        HOTEL DETAILS
                    ================================================= */}

                    <Route
                        path="/hotels/:id"
                        element={<HotelDetails />}
                    />


                    {/* =================================================
                        AUTHENTICATION
                    ================================================= */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* =================================================
                        PROTECTED ROUTES
                        Login required
                    ================================================= */}

                    <Route element={<ProtectedRoute />}>


                        {/* =================================================
                            BOOKING
                        ================================================= */}

                        <Route
                            path="/booking/:roomId"
                            element={<BookingForm />}
                        />


                        {/* =================================================
                            MY BOOKINGS
                        ================================================= */}

                        <Route
                            path="/bookings"
                            element={<MyBookings />}
                        />


                        {/* =================================================
                            USER PROFILE
                        ================================================= */}

                        <Route
                            path="/profile"
                            element={<Profile />}
                        />


                        {/* =================================================
                            EDIT PROFILE
                        ================================================= */}

                        <Route
                            path="/edit-profile"
                            element={<EditProfile />}
                        />


                        {/* =================================================
                            CHANGE PASSWORD
                        ================================================= */}

                        <Route
                            path="/change-password"
                            element={<ChangePassword />}
                        />

                    </Route>

                </Routes>

            </BrowserRouter>

        </AuthProvider>
    );
}

export default App;

