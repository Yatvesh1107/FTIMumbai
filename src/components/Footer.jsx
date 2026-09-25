import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ftimumbai/?hl=en",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.7.1-4.8.1s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9a2 2 0 0 0-.7-1.1 2 2 0 0 0-1.1-.7c-.4-.1-.8-.3-1.9-.3-1.3-.1-1.7-.1-4.8-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.2-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/146271926/admin/dashboard/",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593583155642",
    path: "M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.47h-2.8v8.38C19.61 22.95 24 17.99 24 12Z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ftimumbai",
    path: "M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.3.5C1.6 4.3.8 5.1.5 6.2 0 8 0 12 0 12s0 4 .5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.8.5 9.3.5 9.3.5s7.5 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.8.5-5.8.5-5.8s0-4-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z",
  },
];

const columns = [
  {
    title: "FTI Mumbai",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Our Courses", to: "/courses" },
      { label: "Placements", to: "/placement" },
      { label: "Contact Us", to: "/contactus" },
      { label: "Login", to: "/login" },
    ],
  },
  {
    title: "Our Schools",
    links: [
      { label: "Code & Data Careers", to: "/code-data-careers" },
      { label: "Enterprise Tech", to: "/enterprise-tech" },
      { label: "Deep Tech", to: "/deep-tech" },
      { label: "Engineering Design & Drafting", to: "/engineering-design-drafting" },
      { label: "AI-led Supply Chain & Procurement", to: "/ai-supply-chain" },
    ],
  },
];

export default function Footer() {
  const [ctaVisible, setCtaVisible] = useState(true);

  useEffect(() => {
    const banner = document.getElementById("homepage-banner-trigger");
    if (!banner) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="w-full bg-navy-dark pb-[96px] lg:pb-0">
      <div className="relative mx-auto max-w-[1440px] px-[16px] py-[64px] lg:py-[80px]">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          {/* Brand column */}
          <div>
            <div className="inline-block rounded-xl bg-white/95 p-3">
              <Logo variant="footer" className="h-12" />
            </div>
            <p className="mt-5 max-w-[220px] text-sm leading-relaxed text-white/60">
              Learn to Code, Land Your Dream Job. Get 100% practical trainings
              with job placement assistance.
            </p>
            <p className="mt-6 text-[14px] font-[400] text-[#9D999A]">Follow us</p>
            <ul className="mt-4 flex gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 brightness-[0.9] transition-all hover:bg-terracotta hover:text-white hover:brightness-[1]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.1fr_1fr_1.4fr]">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-[16px] font-[700] text-[#C2C2C2]">
                  {col.title}
                </h2>
                <ul className="mt-5 space-y-3 text-[14px] leading-5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1 font-display text-[14px] font-[400] text-[#848081] transition-colors hover:text-terracotta-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>
              <h2 className="font-display text-[16px] font-[700] text-[#C2C2C2]">
                Contact
              </h2>
              <ul className="mt-5 space-y-3 text-[14px] leading-5">
                <li className="text-[#848081]">
                  Call or WhatsApp:
                  <a
                    href="tel:+919769933844"
                    className="block font-medium text-[#9D999A] transition hover:text-terracotta-light"
                  >
                    +91 97699 33844
                  </a>
                  <a
                    href="tel:+917977475658"
                    className="block font-medium text-[#9D999A] transition hover:text-terracotta-light"
                  >
                    +91 79774 75658
                  </a>
                </li>
                <li className="text-[#848081]">
                  Email:{" "}
                  <a
                    href="mailto:hello@ftimumbai.com"
                    className="block break-all font-medium text-[#9D999A] transition hover:text-terracotta-light"
                  >
                    hello@ftimumbai.com
                  </a>
                </li>
                <li className="text-[#848081]">
                  Address:
                  <span className="mt-1 block leading-relaxed text-[#9D999A]">
                    Office 207/208, Mahalaxmi Centre,
                    <br />
                    Opp. Balbharti School, S.V. Road,
                    <br />
                    Kandivali (W), Mumbai, MH - 400067
                  </span>
                </li>
                <li className="text-[#848081]">
                  Website:{" "}
                  <a
                    href="https://www.ftimumbai.com"
                    className="block font-medium text-[#9D999A] transition hover:text-terracotta-light"
                  >
                    www.ftimumbai.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-[16px] py-5 text-center font-body text-xs text-[#848081] lg:text-left">
          © {new Date().getFullYear()} by FTI Mumbai. All Rights Reserved.
        </p>
      </div>

      {/* Mobile fixed "Start Learning" bar (Masai style) */}
      {ctaVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] min-h-[48px] w-screen bg-white p-3 shadow-[0px_1px_2px_0px_rgba(60,64,67,0.3),0px_2px_6px_2px_rgba(60,64,67,0.15)] lg:hidden">
          <Link
            to="/courses"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[40px] bg-gradient-to-r from-terracotta to-terracotta-dark text-[15px] font-[500] tracking-[1.15px] text-white transition active:scale-[0.98]"
          >
            Start Learning
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </footer>
  );
}