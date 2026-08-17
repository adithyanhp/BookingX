import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SpecialOffers from "./components/SpecialOffers";
import WhyChooseUs from "./components/WhyChooseUs";
import FeaturedHotels from "./components/FeaturedHotels";
import PopularDestinations from "./components/PopularDestinations";
import Testimonials from './components/Testimonials'
import AppSection from './components/AppSection'
import Footer from './components/Footer'

function App() {
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

export default App;
