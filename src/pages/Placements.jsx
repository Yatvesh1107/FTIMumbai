import { Link } from "react-router-dom";
import { companies } from "../data/content";

export default function Placements() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="font-display mx-auto max-w-3xl text-3xl font-extrabold sm:text-4xl">
            Our customized courses &amp; employment focused training have helped
            our students get placed in{" "}
            <span className="text-terracotta-light">top companies!</span>
          </h1>
        </div>
      </section>

      {/* Company marquee */}
      <section className="overflow-hidden border-y border-slate-200 bg-white py-8">
        <div className="animate-marquee flex w-max items-center gap-14 pr-14">
          {[...companies, ...companies].map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="font-display shrink-0 rounded-xl bg-cream px-8 py-3 text-lg font-extrabold tracking-wide text-navy/70 ring-1 ring-slate-200"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cream py-14">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 text-center sm:grid-cols-3">
          {[
            { stat: "12,000+", label: "Placement Drives Conducted by institute." },
            { stat: "20LPA", label: "Highest Package Received by Alumini" },
            { stat: "80+", label: "Hiring Companies" },
          ].map((s) => (
            <div key={s.stat}>
              <p className="font-display text-4xl font-extrabold text-navy sm:text-5xl">
                {s.stat}
              </p>
              <p className="mt-2 font-medium text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry strip */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:text-left">
          <p className="text-sm leading-relaxed sm:text-base">
            For <strong>Placement Enquiries,</strong> contact us on{" "}
            <a
              href="mailto:info@ftimumbai.com"
              className="font-bold break-all underline decoration-terracotta decoration-2 underline-offset-4 transition hover:text-terracotta-light"
            >
              info@ftimumbai.com
            </a>{" "}
            /{" "}
            <a href="tel:+919000000000" className="font-bold underline decoration-terracotta decoration-2 underline-offset-4 transition hover:text-terracotta-light">
              +91 90000 00000
            </a>
          </p>
          <Link
            to="/contactus"
            className="shrink-0 rounded-full bg-terracotta px-8 py-3 text-sm font-semibold shadow-md transition hover:bg-terracotta-dark hover:shadow-lift"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
