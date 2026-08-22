import { Link } from "react-router-dom";
import studentsImg from "../assets/companies/students.png";
import wipro from "../assets/companies/wipro.png";
import cleanify from "../assets/companies/cleanify.png";
import xyst from "../assets/companies/xyst.png";
import asap from "../assets/companies/asap.png";
import codehub from "../assets/companies/codehub.png";
import oracle from "../assets/companies/oracle.png";

const logos = [wipro, cleanify, xyst, asap, codehub, oracle];

const stats = [
  { value: "12,000+", label: ["Placement Drives Conducted by", "institute."] },
  { value: "20LPA", label: ["Highest Package Received by", "Alumini"] },
  { value: "80+", label: ["Hiring Companies"] },
];

export default function Placements() {
  return (
    <main>
      {/* Headline + illustration */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 overflow-hidden px-6 pt-14 lg:flex-row lg:gap-4">
        <h1 className="font-display order-2 text-center text-3xl leading-snug font-medium text-slate-600 sm:text-4xl lg:order-1 lg:w-3/5 lg:text-left lg:text-[2.75rem] lg:leading-[1.35]">
          Our customized courses &amp; employment focused training have helped
          our students get placed in{" "}
          <span className="font-bold text-navy">top companies!</span>
        </h1>
        <img
          src={studentsImg}
          alt="Students placed in top companies"
          loading="lazy"
          className="order-1 h-auto w-full max-w-md object-contain lg:order-2 lg:h-[26rem] lg:w-auto"
        />
      </section>

      {/* Logo marquee */}
      <section className="overflow-hidden py-10">
        <div className="animate-marquee flex w-max items-center">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="mx-8 shrink-0">
              <img
                src={logo}
                alt="Hiring partner logo"
                loading="lazy"
                className="h-24 w-auto object-contain sm:h-32"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="flex flex-col items-center justify-evenly gap-10 px-6 pb-16 text-center sm:flex-row">
        {stats.map((s) => (
          <div key={s.value}>
            <p className="font-display text-4xl font-bold text-navy sm:text-[2.6rem]">
              {s.value}
            </p>
            {s.label.map((line) => (
              <p key={line} className="text-lg text-slate-700 sm:text-xl">
                {line}
              </p>
            ))}
          </div>
        ))}
      </section>

      {/* Enquiry banner */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-2xl bg-terracotta/15 px-6 py-8 text-center shadow-card ring-1 ring-terracotta/25 sm:px-10">
          <p className="text-lg leading-relaxed text-slate-700 sm:text-2xl">
            For <strong className="text-navy">Placement Enquiries,</strong>{" "}
            contact us on{" "}
            <a
              href="mailto:info@ftimumbai.com"
              className="break-all font-bold text-navy underline decoration-terracotta decoration-2 underline-offset-4 transition hover:text-terracotta"
            >
              info@ftimumbai.com
            </a>
            {" / "}
            <a
              href="tel:+919000000000"
              className="font-bold text-navy underline decoration-terracotta decoration-2 underline-offset-4 transition hover:text-terracotta"
            >
              +91 90000 00000
            </a>
          </p>
          <Link
            to="/contactus"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-navy to-navy-light px-9 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lift hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
