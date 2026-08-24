import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import EnquiryModal from "./EnquiryModal";
import courseIndex from "../data/courseIndex.json";

const CATEGORY_COURSES = {};
for (const [course, cat] of Object.entries(courseIndex)) {
  (CATEGORY_COURSES[cat] ||= []).push(course);
}
const GROUPS = Object.entries(CATEGORY_COURSES);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdown(false);
    setOpenCat(null);
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
            } fixed inset-x-0 top-20 z-[999] max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-y-auto border-b border-slate-200 bg-cream px-6 py-6 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-8 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <li
              className="relative"
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => {
                setDropdown(false);
                setOpenCat(null);
              }}
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

              {/* Level 1: main course categories */}
              {dropdown && (
                <ul className="mt-2 w-full space-y-0.5 rounded-xl border border-slate-100 bg-white p-2 shadow-lift lg:absolute lg:top-full lg:left-0 lg:mt-0 lg:w-64">
                  {GROUPS.map(([cat, courses], i) => (
                    <li key={cat} className="group/cat relative">
                      <button
                        onClick={() => {
                          if (window.innerWidth <= 1023)
                            setOpenCat(openCat === i ? null : i);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-cream hover:text-navy"
                      >
                        <span>{cat}</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Mobile: inline expand */}
                      {openCat === i && (
                        <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l-2 border-terracotta/40 pl-3 lg:hidden">
                          {courses.map((c) => (
                            <li key={c}>
                              <Link
                                to="/coursedetails"
                                state={{ course: c }}
                                onClick={closeAll}
                                className="block rounded px-2 py-1.5 text-xs text-slate-600 transition hover:bg-cream hover:text-navy"
                              >
                                {c}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Desktop: flyout beside */}
                      <ul className="absolute left-full top-0 z-10 ml-1 hidden max-h-[70vh] w-72 space-y-0.5 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-lift lg:group-hover/cat:block">
                        {courses.map((c) => (
                          <li key={c}>
                            <Link
                              to="/coursedetails"
                              state={{ course: c }}
                              onClick={closeAll}
                              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-cream hover:text-navy"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                              {c}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
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
            <li className="lg:pl-2 flex flex-col sm:flex-row items-center gap-2">
              <Link
                to="/login"
                onClick={closeAll}
                className="w-full text-center rounded-full border border-navy/30 bg-white px-5 py-2 text-xs font-bold text-navy shadow-sm hover:bg-slate-50 transition lg:w-auto"
              >
                Portal Login
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setEnquiryOpen(true);
                }}
                className="w-full rounded-full bg-gradient-to-r from-navy to-navy-light px-5 py-2 text-xs font-bold text-white shadow-md transition hover:shadow-lift hover:brightness-110 lg:w-auto"
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
