import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { categories } from "../data/content";
import { categoryCourses } from "../data/courseGroups";
import ProgramCard from "./ProgramCard";

export default function AudienceLanding({
  eyebrow,
  headline,
  description,
  heroImage,
  background,
  featureIcon: FeatureIcon,
  features,
}) {
  const groups = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        courses: categoryCourses(cat.category).slice(0, 6),
      })),
    [],
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <img
          src={background || heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-terracotta">
              <ChevronLeft className="h-4 w-4" />
              {eyebrow}
            </span>
            <h1 className="font-display mt-4 text-[36px] font-[600] leading-tight text-[#21191B] sm:text-5xl">
              {headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {description}
            </p>

            <ul className="mt-8 flex flex-wrap gap-4">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-terracotta to-terracotta-dark text-white">
                    <FeatureIcon className="h-3.5 w-3.5" />
                  </span>
                  {f.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden justify-center lg:flex">
            <img
              src={heroImage}
              alt={eyebrow}
              className="max-h-[420px] w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Courses Tailored For You */}
      <section className="bg-white pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="font-display text-2xl font-[600] text-[#21191B] sm:text-3xl">
                Courses Tailored For You
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream text-navy ring-1 ring-slate-200">
                <Check className="h-3 w-3" />
              </span>
              All Institutes
            </span>
          </div>

          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
            {groups.map((g, i) => (
              <a
                key={g.category}
                href={`#group-${i}`}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-terracotta hover:text-terracotta"
              >
                {g.category}
              </a>
            ))}
          </div>

          <div className="mt-14 space-y-16">
            {groups.map((g, i) => (
              <div key={g.category} id={`group-${i}`} className="scroll-mt-24">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h3 className="font-display text-2xl font-[600] text-[#21191B]">
                    {g.category}
                  </h3>
                  <Link
                    to="/courses"
                    state={{ category: g.category }}
                    className="inline-flex items-center gap-1 rounded-[40px] bg-gradient-to-r from-terracotta to-terracotta-dark px-5 py-2 text-xs font-bold text-white transition hover:brightness-110 active:scale-95"
                  >
                    View All Courses in {g.category} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {g.courses.map((name) => (
                    <ProgramCard
                      key={name}
                      course={{ name, category: g.category }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section
        className="bg-navy-dark"
        style={{
          background:
            "linear-gradient(120deg, #082c4d 0%, #0b3c68 55%, #6f5347 160%)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:text-left">
          <div>
            <h3 className="font-display text-2xl font-[600] text-white sm:text-3xl">
              Your dream job is one course away.
            </h3>
            <p className="mt-2 text-white/70">
              Join FTI Mumbai and get job ready with 100% placement assistance.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-[40px] bg-gradient-to-r from-terracotta to-terracotta-dark px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta/30 transition hover:brightness-110 active:scale-95"
          >
            Start Learning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}