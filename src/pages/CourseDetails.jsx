import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { testimonials } from "../data/content";
import { useSchools } from "../hooks/useSchools";
import blurBg from "../assets/blur-bg.png";
import processDesktop from "../assets/detail-process-desktop.png";
import processMobile from "../assets/detail-process-mobile.png";

const highlights = [
  "Personalized Career Coach",
  "Study Material",
  "90% Practical Training",
  "Instant Doubt Solving",
  "Certification",
  "Mock Interviews",
  "100% Job Assurance",
  "Live Projects",
];

const stats = [
  { value: "100+ Hrs", label: "Training Duration", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l4.8 2.9 1-1.7L13 12V7Z" },
  { value: "25000+", label: "Students Trained", icon: "M12 3 1 8l11 5 9-4.09V15h2V8L12 3ZM5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.18-7-3.18Z" },
  { value: "1000+", label: "Hiring Companies", icon: "M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18h-5v-4H9v4H4Zm3-14h2V6H7v2Zm4 0h2V6h-2v2Zm-4 4h2v-2H7v2Zm4 0h2v-2h-2v2Zm5 10V8h4a2 2 0 0 1 2 2v12h-4v-4h-2v4Zm2-10h2v-2h-2v2Zm0 4h2v-2h-2v2Z" },
  { value: "8+ LPA", label: "Highest Fresher Salary", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-1a3.5 3.5 0 0 1-3-3.5h2c0 1 .9 1.5 2 1.5s2-.5 2-1.3c0-.9-.8-1.2-2.6-1.7C10.7 10.4 9 9.8 9 8.2 9 7 10 6 11 5.6V5h2v.6c1.2.4 2 1.4 2 2.9h-2c0-1-.7-1.5-1.5-1.5S10 7.5 10 8.2c0 .8.9 1.1 2.6 1.6 1.6.5 3.4 1.1 3.4 3 0 1.4-1 2.6-3 3.1v1.1Z" },
];

const headingClass =
  "font-display text-2xl font-[600] text-[#21191B] sm:text-3xl";

export default function CourseDetails() {
  const location = useLocation();
  const state = useMemo(() => location.state || {}, [location.state]);
  const { schools } = useSchools();
  const [all, setAll] = useState(null);

  useEffect(() => {
    let alive = true;
    import("../data/courseData.json").then((mod) => {
      if (alive) setAll(mod.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.course]);

  const resolved = useMemo(() => {
    const raw = state.course;
    const directObj = raw && typeof raw === "object" ? raw : null;
    const requestName = directObj ? raw.name : raw;
    const names = all ? Object.keys(all) : [];

    // 1. Full course object passed straight from a card
    if (directObj && requestName) {
      const legacy = all && all[requestName];
      return {
        courseName: requestName,
        data: {
          category: directObj.category || (legacy && legacy.category) || "",
          description: directObj.description || (legacy && legacy.description) || "",
          image: directObj.image || "",
          mode: directObj.mode || "",
          duration: directObj.duration || "",
          provider: directObj.provider || "",
          wywl: (legacy && legacy.wywl) || [],
          content: (legacy && legacy.content) || [],
          skills: (legacy && legacy.skills) || [],
        },
      };
    }

    // 2. Exact match in the legacy catalog
    if (requestName && all && all[requestName]) {
      return { courseName: requestName, data: all[requestName] };
    }

    // 3. Backend course (present in one of the schools)
    if (requestName) {
      let found = null;
      for (const s of schools) {
        const match = (s.courses || []).find((c) => c.name === requestName);
        if (match) {
          found = { ...match, wywl: [], content: [], skills: [] };
          break;
        }
      }
      if (found) return { courseName: found.name, data: found };
      if (all) return { courseName: requestName, data: all[requestName] || {} };
    }

    // 4. Legacy fallback (default first course of matching category)
    if (all) {
      const fallbackName =
        names.find((n) => !state.category || all[n].category === state.category) || names[0];
      return { courseName: fallbackName, data: all[fallbackName] || {} };
    }

    return null;
  }, [all, schools, state]);

  if (!resolved) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy/20 border-t-navy" />
      </div>
    );
  }

  const { courseName, data } = resolved;

  return (
    <main>
      {/* Header */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${blurBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/85" />
        <div className="relative mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-light">
            {data.category}
          </p>
          <h1 className="font-display mt-4 text-3xl font-[600] sm:text-4xl lg:text-5xl">
            {courseName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg italic leading-relaxed text-white/80">
            {data.description}
          </p>
          <Link
            to="/contactus"
            className="mt-8 inline-flex items-center gap-2 rounded-[40px] bg-terracotta px-10 py-3 font-semibold text-white shadow-md transition hover:bg-terracotta-dark active:scale-95"
          >
            Enroll Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={headingClass}>What you'll learn</h2>
          <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {(data.wywl || []).map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                <svg viewBox="0 0 24 24" fill="#0B3C68" className="mt-0.5 h-5 w-5 shrink-0">
                  <path d="M16.97 6.25a2 2 0 0 0-2.72.78l-3.71 6.68-2.13-2.13a2 2 0 1 0-2.82 2.83l4 4a2 2 0 0 0 1.69.56 2 2 0 0 0 1.47-1l5-9a2 2 0 0 0-.78-2.72Z" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Training process */}
      <section className="rounded-[48px] bg-cream py-14 text-center px-6 md:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={headingClass}>Our Training Process</h2>
          <img
            src={processDesktop}
            alt="Training process"
            loading="lazy"
            className="mx-auto mt-10 hidden w-[70%] md:block"
          />
          <img
            src={processMobile}
            alt="Training process"
            loading="lazy"
            className="mx-auto mt-8 w-[85%] md:hidden"
          />
        </div>
      </section>

      {/* Key Highlights */}
      <section
        className="relative bg-cover bg-center py-16"
        style={{ backgroundImage: `url(${blurBg})` }}
      >
        <div className="absolute inset-0 bg-navy-dark/80" />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="font-display inline-block pb-1 text-2xl font-[600] text-white sm:text-3xl">
            Key Highlights
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <ul className="grid content-start gap-4 sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta">
                    <svg viewBox="0 0 24 24" fill="#FFFFFF" className="h-4 w-4">
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                    </svg>
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-4 self-start">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-[24px] bg-white/95 p-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy">
                    <svg viewBox="0 0 24 24" fill="#F8FAFC" className="h-6 w-6">
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <p className="font-display mt-3 text-xl font-[700] text-navy">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      {(data.content || []).length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className={headingClass}>Course Content</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.content.map((mod) => (
                <div
                  key={mod.heading}
                  className="rounded-[24px] bg-cream p-6 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <h3 className="font-display flex items-center gap-2 font-[600] text-navy">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-terracotta" />
                    {mod.heading}
                  </h3>
                  <ul className="mt-3 space-y-1.5 pl-4 text-sm leading-relaxed text-slate-600">
                    {mod.topics.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {(data.skills || []).length > 0 && (
        <section className="rounded-[48px] bg-cream py-14 text-center px-6 md:px-20">
          <div className="mx-auto max-w-6xl">
            <h2 className={headingClass}>Skills you will gain</h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {data.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-navy shadow-sm ring-1 ring-slate-200 transition hover:bg-navy hover:text-white"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certification */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className={headingClass}>Course Certification</h2>
          <p className="mt-8 leading-relaxed text-slate-600">
            Become a Certified <strong className="text-navy">{courseName}</strong> professional
            with FTI Mumbai and enhance your career prospects to the next level.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            This certificate serves as an official badge of your successful{" "}
            {courseName} course completion, highlighting your expertise.
          </p>
          <Link
            to="/contactus"
            className="mt-8 inline-flex items-center gap-2 rounded-[40px] bg-gradient-to-r from-navy to-navy-light px-10 py-3 font-semibold text-white shadow-md transition hover:shadow-lift hover:brightness-110 active:scale-95"
          >
            Enroll Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="rounded-[48px] bg-cream py-14 px-6 md:px-20">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className={headingClass}>Genuine Reviews For Our Courses</h2>
          <div className="mt-10 grid gap-7 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.name} className="flex flex-col rounded-[24px] bg-white p-7 text-left shadow-card ring-1 ring-slate-100">
                <span className="font-display text-6xl leading-none text-terracotta/50">&ldquo;</span>
                <blockquote className="-mt-4 flex-1 text-sm leading-relaxed text-slate-600">{t.text}</blockquote>
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