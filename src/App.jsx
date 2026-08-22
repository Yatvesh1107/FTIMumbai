import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Placements from "./pages/Placements";
import ContactUs from "./pages/ContactUs";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/coursedetails" element={<CourseDetails />} />
            <Route path="/placement" element={<Placements />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route
              path="*"
              element={
                <div className="py-32 text-center">
                  <h1 className="font-display text-5xl font-extrabold text-navy">404</h1>
                  <p className="mt-3 text-slate-600">Page not found.</p>
                </div>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
