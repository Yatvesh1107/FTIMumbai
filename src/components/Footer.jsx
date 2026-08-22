import { Link } from "react-router-dom";
import { categories } from "../data/content";
import Logo from "./Logo";

const socials = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9a2 2 0 0 0-.7-1.1 2 2 0 0 0-1.1-.7c-.4-.1-.8-.3-1.9-.3-1.3-.1-1.7-.1-4.8-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.2-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.51 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_1.1fr]">
        <div>
          <div className="rounded-xl bg-white/95 p-3 inline-block">
            <Logo variant="footer" className="h-12" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Learn to Code, Land Your Dream Job. Get 100% practical trainings
            with job placement assistance.
          </p>
          <ul className="mt-5 flex gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-terracotta"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Quick Links</h2>
          <span className="mt-2 block h-0.5 w-16 bg-terracotta" />
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link className="transition hover:text-white" to="/">Home</Link></li>
            <li><Link className="transition hover:text-white" to="/courses">Courses</Link></li>
            <li><Link className="transition hover:text-white" to="/placement">Placements</Link></li>
            <li><Link className="transition hover:text-white" to="/contactus">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Our Courses</h2>
          <span className="mt-2 block h-0.5 w-16 bg-terracotta" />
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  className="transition hover:text-white"
                  to="/courses"
                  state={{ category: c.category }}
                >
                  {c.category}
                </Link>
              </li>
            ))}
            <li>
              <Link className="font-semibold text-terracotta-light transition hover:text-white" to="/courses">
                View More..
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Contact</h2>
          <span className="mt-2 block h-0.5 w-16 bg-terracotta" />
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-white/60">
              Call Us:{" "}
              <a href="tel:+919000000000" className="block font-medium text-white transition hover:text-terracotta-light">
                +91 90000 00000
              </a>
            </p>
            <p className="text-white/60">
              Email:{" "}
              <a href="mailto:info@ftimumbai.com" className="block font-medium break-all text-white transition hover:text-terracotta-light">
                info@ftimumbai.com
              </a>
            </p>
            <p className="text-white/60">
              Address:
              <span className="mt-1 block font-medium leading-relaxed text-white">
                Shop no 201 /202, Gold crest 369,
                <br />
                Near New ViVa college, Virar West,
                <br />
                Maharashtra 401303
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-6 py-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} FTI Mumbai. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
