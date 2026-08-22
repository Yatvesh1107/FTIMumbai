import { Link, useLocation } from "react-router-dom";
import { categories, courses, testimonials } from "../data/content";

const fallback = {
  title: "Professional Training Course",
  tagline:
    "Get 100% practical, employment focused training with live projects and placement assistance.",
  learn: [
    "Learn the fundamentals from scratch with hands-on sessions",
    "Build real-time industry level projects & assignments",
    "Develop your code using modern development tools",
    "Work on capstone projects reviewed by industry mentors",
    "Mock interviews and personality development sessions",
    "Dedicated placement assistance until you get hired",
  ],
};

export default function CourseDetails() {
  const location = useLocation();
  const categoryName =
    (location.state && location.state.category) ||
    categories[0].category;
  const detail = courses["Full Stack Web Development"];
  const data = categoryName === "Full Stack Web Development" ? detail : fallback;
  const syllabus = detail.syllabus || null;

  return (
    <main>
      {/* Header */}
      <section className="bg-gradient-to-br from-navy to-navy-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-terracotta-light uppercase">
            {categoryName}
          </p>
          <h1 className="font-display mx-auto mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            {data.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/75">
            {data.tagline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contactus"
              className="rounded-full bg-terracotta px-8 py-3 font-semibold shadow-md transition hover:bg-terracotta-dark hover:shadow-lift"
            >
              Book Free Demo
            </Link>
            <Link
              to="/contactus"
              className="rounded-full border-2 border-white/60 px-8 py-3 font-semibold transition hover:bg-white hover:text-navy"
            >
              Download Syllabus
            </Link>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="bg-cream py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display inline-block border-b-4 border-terracotta pb-1 text-2xl font-bold text-navy sm:text-3xl">
              What you'll learn
            </h2>
            <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {data.learn.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] text-white">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            {syllabus && (
              <>
                <h2 className="font-display mt-12 inline-block border-b-4 border-terracotta pb-1 text-2xl font-bold text-navy sm:text-3xl">
                  Course Content
                </h2>
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(syllabus).map(([module, topics]) => (
                    <div
                      key={module}
                      className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100"
                    >
                      <h3 className="font-display flex items-center gap-2 font-bold text-navy">
                        <span className="h-2 w-2 rounded-full bg-terracotta" />
                        {module}
                      </h3>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                        {topics.map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Highlights card */}
          <aside className="space-y-4 self-start rounded-2xl bg-white p-7 shadow-card ring-1 ring-slate-100 lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-bold text-navy">Course Highlights</h3>
            <ul className="divide-y divide-slate-100">
              {(data.highlights || [
                { label: "Training Duration", value: "2 - 4 Months" },
                { label: "Certification", value: "Industry Recognised" },
                { label: "Mode", value: "Online / Offline Batches" },
                { label: "Placement", value: "100% Job Assistance" },
              ]).map((h) => (
                <li key={h.label} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-slate-500">{h.label}</span>
                  <span className="font-semibold text-navy">{h.value}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contactus"
              className="block rounded-full bg-gradient-to-r from-navy to-navy-light py-3 text-center font-semibold text-white transition hover:brightness-110"
            >
              Enquire Now
            </Link>
          </aside>
        </div>
      </section>

      {/* Training process */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display inline-block border-b-4 border-terracotta pb-1 text-2xl font-bold text-navy sm:text-3xl">
            Our Training Process
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Learn the fundamentals with hands-on practicals",
              "Build real-time industry level projects",
              "Personalized career coaching & mock interviews",
              "Be Job Ready — resume, drives & offers",
            ].map((step, i) => (
              <li key={step} className="rounded-2xl bg-cream p-6 ring-1 ring-slate-100">
                <span className="font-display text-sm font-extrabold text-terracotta">
                  STEP {i + 1}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Certification */}
      <section className="bg-cream py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
              Course Certification
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Become a certified professional with FTI Mumbai and enhance your
              career prospects to the next level. This certificate serves as an
              official badge of your successful training completion,
              highlighting your expertise.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm rotate-1 rounded-xl border-8 border-white bg-gradient-to-br from-navy to-navy-light p-8 text-center shadow-lift">
            <p className="text-xs font-semibold tracking-[0.3em] text-terracotta-light uppercase">
              Certificate of Completion
            </p>
            <div className="mx-auto mt-5 h-px w-24 bg-terracotta" />
            <p className="mt-5 text-lg font-semibold text-white">Awarded To</p>
            <p className="font-display mt-1 text-2xl font-extrabold text-white">
              Your Name Here
            </p>
            <p className="mt-4 text-xs text-white/70">
              for successfully completing the {categoryName} training program at FTI Mumbai.
            </p>
            <div className="mt-6 flex items-center justify-between text-[10px] text-white/60">
              <span>FTI Mumbai</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta font-bold text-white">
                FTI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display inline-block border-b-4 border-terracotta pb-1 text-2xl font-bold text-navy sm:text-3xl">
            Genuine Reviews For Our Courses
          </h2>
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.slice(0, 4).map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl bg-cream p-6 text-left ring-1 ring-slate-100">
                <span className="font-display text-5xl leading-none text-terracotta/50">&ldquo;</span>
                <blockquote className="-mt-3 flex-1 text-sm leading-relaxed text-slate-600">{t.text}</blockquote>
                <figcaption className="mt-5 border-t border-slate-200 pt-4">
                  <p className="font-display text-sm font-bold text-navy">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
