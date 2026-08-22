import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { categories } from "../data/content";
import Logo from "./Logo";
import EnquiryModal from "./EnquiryModal";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdown(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-[1000] w-full border-b border-slate-200/80 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" onClick={closeAll} aria-label="FTI Mumbai home">
            <Logo className="h-12" />
          </Link>

          <ul
            className={`${
              menuOpen
                ? "flex"
                : "hidden lg:flex"
            } fixed inset-x-0 top-20 z-[999] flex-col gap-2 border-b border-slate-200 bg-cream px-6 py-6 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <li
              className="relative"
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
            >
              <button
                className="flex items-center gap-1 py-2 text-base font-semibold text-slate-800 transition hover:text-navy"
                onClick={() => setDropdown((d) => !d)}
              >
                Courses
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform ${dropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdown && (
                <div className="static max-h-[60vh] overflow-y-auto rounded-xl border border-slate-100 bg-white p-4 shadow-lift lg:absolute lg:top-full lg:left-1/2 lg:w-[42rem] lg:-translate-x-1/2 lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to="/courses"
                        state={{ category: cat.category }}
                        onClick={closeAll}
                        className="group rounded-lg px-3 py-2 transition hover:bg-cream"
                      >
                        <p className="flex items-center gap-2 text-sm font-bold text-navy group-hover:text-terracotta">
                          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                          {cat.category}
                        </p>
                        <p className="mt-0.5 pl-3.5 text-xs text-slate-500">
                          {cat.topics.slice(0, 3).join(" · ")}
                          {cat.topics.length > 3 && " +more"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li>
              <NavLink
                to="/placement"
                onClick={closeAll}
                className={({ isActive }) =>
                  `block py-2 text-base font-semibold transition hover:text-navy ${
                    isActive ? "text-navy" : "text-slate-800"
                  }`
                }
              >
                Placements
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contactus"
                onClick={closeAll}
                className={({ isActive }) =>
                  `block py-2 text-base font-semibold transition hover:text-navy ${
                    isActive ? "text-navy" : "text-slate-800"
                  }`
                }
              >
                Contact Us
              </NavLink>
            </li>
            <li className="lg:pl-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setEnquiryOpen(true);
                }}
                className="w-full rounded-full bg-gradient-to-r from-navy to-navy-light px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lift hover:brightness-110 lg:w-auto"
              >
                Enquire Now
              </button>
            </li>
          </ul>

          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#0B3C68" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#0B3C68" strokeWidth="2.5">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>
      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  );
}
