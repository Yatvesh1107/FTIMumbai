import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import ProgramCard from "../components/ProgramCard";
import CareerTracks from "../components/CareerTracks";
import FtiStandard from "../components/FtiStandard";
import { useSchoolCourses } from "../hooks/useSchoolCourses";

export default function Courses() {
  const location = useLocation();
  const requested =
    (location.state && (location.state.schoolSlug || location.state.category)) || null;

  const { groups } = useSchoolCourses();

  const groupRefs = useRef({});

  useEffect(() => {
    if (requested && groupRefs.current[requested]) {
      groupRefs.current[requested].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [requested]);

  const scrollTo = (key) => {
    const el = groupRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalCourses = groups.reduce((sum, g) => sum + g.courses.length, 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-terracotta shadow-card">
            Our Courses
          </span>
          <h1 className="font-display mt-6 text-[36px] font-[600] leading-tight text-[#21191B] sm:text-5xl">
            Explore our courses below!
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Five schools of future skills, {totalCourses || "20+"} industry-built
            programmes — each one co-owned by a company that does the work, with
            placement assistance on paper.
          </p>
        </div>
      </section>

      {/* Five career tracks (brochure p.02) */}
      <div className="bg-slate-50">
        <CareerTracks />
      </div>

      {/* Explore by school */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              Explore by school
            </p>
            <h2 className="font-display mt-2 text-[28px] font-[600] text-[#21191B] sm:text-4xl">
              Find the right program for you
            </h2>
            <p className="mt-3 text-slate-600">Choose Your Area of Interest</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g) => (
              <button
                key={g.slug}
                onClick={() => scrollTo(g.slug)}
                className="group overflow-hidden rounded-[24px] border border-[#E5E5E5] bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-terracotta hover:bg-[#fbf7f5] hover:shadow-card"
              >
                <div className="relative h-40 overflow-hidden border-b border-slate-100">
                  <img
                    src={g.heroImage}
                    alt={g.name}
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-display text-base font-[600] text-[#21191B]">
                      {g.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#544D4F]">
                      {g.courses.length} Courses
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-navy ring-1 ring-slate-200 transition group-hover:bg-terracotta group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course sections, grouped by school (admin-driven) */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6">
          {groups.map((g) => (
            <div
              key={g.slug}
              ref={(el) => (groupRefs.current[g.slug] = el)}
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {g.poweredBy ? `Powered by ${g.poweredBy}` : "School of future skills"}
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-[600] text-[#21191B]">
                    {g.name}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {g.courses.length} specialized programs
                  </p>
                </div>
                <Link
                  to="/contactus"
                  className="rounded-full border-2 border-navy px-5 py-2 text-xs font-bold text-navy transition hover:bg-navy hover:text-white"
                >
                  Enquire
                </Link>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.courses.slice(0, 6).map((course) => (
                  <ProgramCard key={course.courseId || course.name} course={course} />
                ))}
              </div>

              <Link
                to={`/${g.slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-[40px] bg-gradient-to-r from-terracotta to-terracotta-dark px-6 py-2.5 text-xs font-bold text-white transition hover:brightness-110"
              >
                View {g.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* The FTI standard (brochure p.08) */}
      <FtiStandard />

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy-dark">
        <div
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:text-left"
          style={{
            background:
              "linear-gradient(120deg, #082c4d 0%, #0b3c68 55%, #6f5347 160%)",
          }}
        >
          <div>
            <h3 className="font-display text-2xl font-[600] text-white sm:text-3xl">
              Not sure which program fits you best?
            </h3>
            <p className="mt-2 text-white/70">
              Talk to our counsellors — we&apos;ll help you pick the right course.
            </p>
          </div>
          <Link
            to="/contactus"
            className="inline-flex items-center gap-2 rounded-[40px] border border-terracotta bg-terracotta px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta/30 transition hover:bg-terracotta-dark active:scale-95"
          >
            Talk To A Counsellor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <span className="absolute right-8 top-6 hidden lg:block">
          <ChevronDown className="h-8 w-8 text-white/20" />
        </span>
      </section>
    </main>
  );
}
