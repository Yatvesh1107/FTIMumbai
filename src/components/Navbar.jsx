import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/about", label: "About Us" },
    { to: "/for-students", label: "For Students" },
    { to: "/for-graduates", label: "For Graduates" },
    { to: "/for-professionals", label: "For Professionals" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-[1000] px-4 pt-3 sm:px-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-white/85 py-2 pr-2 pl-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_40px_-16px_rgba(11,60,104,0.28)] backdrop-blur-xl sm:pl-5">
          <Link to="/" onClick={closeMenu} aria-label="FTI Mumbai — home">
            <Logo className="h-9 w-auto" />
          </Link>

          {/* Desktop links */}
          <ul className="mx-2 hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-[15px] font-[500] transition ${
                      isActive
                        ? "bg-navy/10 font-semibold text-navy"
                        : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              to="/courses"
              className="hidden items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-3.5 py-1.5 text-[12px] font-[600] text-terracotta transition hover:bg-terracotta/20 xl:inline-flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta" />
              </span>
              Admissions Open
            </Link>
            <Link
              to="/courses"
              className="hidden items-center rounded-full bg-navy-dark px-5 py-2 text-[14px] font-[600] text-white transition hover:bg-navy active:scale-[0.98] sm:inline-flex"
            >
              Our Courses
            </Link>
            <Link
              to="/login"
              aria-label="Login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-navy transition hover:border-terracotta hover:text-terracotta"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-navy lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-[0_24px_48px_-16px_rgba(11,60,104,0.3)] backdrop-blur-xl lg:hidden">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-navy/10 font-semibold text-navy"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <Link
              to="/courses"
              onClick={closeMenu}
              className="mt-2 block rounded-2xl bg-navy-dark px-4 py-3 text-center text-sm font-bold text-white"
            >
              Our Courses
            </Link>
          </div>
        )}
      </header>
    </>
  );
}