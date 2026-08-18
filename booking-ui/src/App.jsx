// import Navbar from "./components/Navbar";
// import Hero from "./components/Hero";
// import SpecialOffers from "./components/SpecialOffers";
// import WhyChooseUs from "./components/WhyChooseUs";
// import FeaturedHotels from "./components/FeaturedHotels";
// import PopularDestinations from "./components/PopularDestinations";
// import Testimonials from './components/Testimonials'
// import AppSection from './components/AppSection'
// import Footer from './components/Footer'

// function App() {
//   return (
//     <>
//       <Navbar />

//       <main>
//         <Hero />
//         <SpecialOffers />
//         <WhyChooseUs />
//         <FeaturedHotels />
//         <PopularDestinations />
//         <Testimonials />
//         <AppSection />
//       </main>
//       <Footer />
//     </>
//   );
// }

// export default App;

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

import Register from "./pages/Register";
import Login from "./pages/Login";
import HotelDetails from "./pages/HotelDetails";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/hotels/:id" element={<HotelDetails />} />

        <Route path="/booking/:roomId" element={<BookingForm />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
