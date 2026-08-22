import { Link, useNavigate } from "react-router-dom";
import { categories, testimonials } from "../data/content";
import heroBg from "../assets/hero-bg.png";
import heroBoy from "../assets/hero-boy.png";
import whyDesktop from "../assets/why-desktop.png";
import whyMobile from "../assets/why-mobile.png";
import TrainingRoadmap from "../components/TrainingRoadmap";

function SectionHeading({ children }) {
  return (
    <h2 className="font-display inline-block border-b-4 border-terracotta pb-1 text-3xl font-bold text-navy sm:text-4xl">
      {children}
    </h2>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section
        className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-navy-dark bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/55 to-transparent" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-0">
          <div className="animate-fade-up text-center lg:text-left">
            <h1 className="font-display text-4xl leading-tight font-extrabold text-white sm:text-5xl xl:text-6xl">
              A COURSE FOR
              <br />
              <span className="text-terracotta-light">EVERYONE</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85 lg:mx-0">
              Learn to Code, Land Your Dream Job. Get 100% Practical trainings
              with Job Placement Guarantee on Paper.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                to="/contactus"
                className="rounded-lg bg-white px-9 py-3.5 font-bold text-navy shadow-md transition hover:bg-terracotta hover:text-white hover:shadow-lift"
              >
                Get In Touch
              </Link>
              <Link
                to="/courses"
                className="rounded-lg border-2 border-white px-9 py-3.5 font-semibold text-white transition hover:bg-white hover:text-navy"
              >
                Explore Courses
              </Link>
            </div>
          </div>
          <div className="animate-fade-up hidden justify-center [animation-delay:150ms] sm:flex">
            <img
              src={heroBoy}
              alt="Student with laptop"
              className="animate-float max-h-[70vh] w-auto max-w-full object-contain transition-transform duration-700 hover:scale-110"
            />
          </div>
        </div>
      </section>

      {/* ---------- What we offer (stats) ---------- */}
      <section className="bg-navy py-14 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display mb-10 inline-block border-b-4 border-terracotta pb-1 text-3xl font-bold sm:text-4xl">
            What we offer
          </h2>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-10">
            {[
              { stat: "100%", label: "Student Placement Records" },
              { stat: "No.1", label: "Awarded Institute in Mumbai" },
              { stat: "250+", label: "Graduated Students" },
            ].map((s) => (
              <div key={s.label} className="max-w-[16rem]">
                <p className="font-display bg-gradient-to-r from-terracotta-light to-white bg-clip-text text-5xl font-extrabold text-transparent">
                  {s.stat}
                </p>
                <p className="mt-2 font-medium text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Our Courses ---------- */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SectionHeading>Our Courses</SectionHeading>
          <div className="mt-12 flex flex-wrap justify-center gap-7">
            {categories.map((cat) => (
              <article
                key={cat.id}
                className="flex w-[21rem] flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <img
                  src={cat.image}
                  alt={cat.category}
                  loading="lazy"
                  className="h-44 w-full object object-top transition duration-500 hover:scale-105"
                />
                <div className="px-5 pt-5 text-left">
                  <h3 className="font-display text-lg font-bold text-navy">{cat.category}</h3>
                  <p className="text-sm text-slate-500 italic">Topics covered</p>
                </div>
                <div className="flex flex-wrap content-start gap-1.5 p-5 text-left">
                  {cat.topics.map((t) => (
                    <button
                      key={t}
                      className="pointer-events-none rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy ring-1 ring-slate-200"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Link
                  to="/courses"
                  state={{ category: cat.category }}
                  className="group mt-auto flex h-14 items-center justify-center bg-gradient-to-r from-navy to-navy-light font-semibold tracking-wide text-white transition hover:brightness-110"
                >
                  KNOW MORE{" "}
                  <span className="ml-2 transition group-hover:translate-x-1">→</span>
                </Link>
              </article>
            ))}
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="mt-12 rounded-xl bg-terracotta px-10 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-terracotta-dark hover:shadow-lift"
          >
            View More
          </button>
        </div>
      </section>

      {/* ---------- Our Training Process ---------- */}
      <section className="relative overflow-hidden bg-cream py-16 text-center">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-navy/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeading>Our Training Process</SectionHeading>
          <span className="mx-auto mt-8 mb-10 block h-0.5 w-64 bg-white sm:w-96" />
          <TrainingRoadmap />
        </div>
      </section>

      {/* ---------- Why Choose Us ---------- */}
      <section className="bg-white py-16 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading>Why Choose Us</SectionHeading>
          <img
            src={whyDesktop}
            alt="Why choose FTI Mumbai"
            loading="lazy"
            className="mx-auto mt-10 hidden w-[60%] md:block"
          />
          <img
            src={whyMobile}
            alt="Why choose FTI Mumbai"
            loading="lazy"
            className="mx-auto mt-8 w-[90%] md:hidden"
          />
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SectionHeading>Our Students Say</SectionHeading>
          <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl bg-cream p-7 text-left shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="font-display text-6xl leading-none text-terracotta/50">&ldquo;</span>
                <blockquote className="-mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display font-bold text-white">
                    {t.name[0]}
                  </span>
                  <span>
                    <p className="font-display text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
