import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { testimonials } from "../data/content";
import ProgramCard from "../components/ProgramCard";
import { useSchoolCourses } from "../hooks/useSchoolCourses";
import CareerTracks from "../components/CareerTracks";
import TalentCorridor from "../components/TalentCorridor";
import FtiStandard from "../components/FtiStandard";
import PartnersGrid from "../components/PartnersGrid";
import ftiLogo from "../assets/logo/FTI-logo.png";

import wipro from "../assets/companies/wipro.png";
import cleanify from "../assets/companies/cleanify.png";
import xyst from "../assets/companies/xyst.png";
import asap from "../assets/companies/asap.png";
import codehub from "../assets/companies/codehub.png";
import oracle from "../assets/companies/oracle.png";
import heroBg from "../assets/hero-bg.png";
import whyDesktop from "../assets/why-desktop.png";
import heroTeam from "../assets/hero-team.jpg";
import statPlaced from "../assets/stat-placed.jpg";
import statGuarantee from "../assets/stat-guarantee.jpg";
import statDrives from "../assets/stat-drives.jpg";

const logos = [wipro, cleanify, xyst, asap, codehub, oracle];

const heroStats = [
  { value: "250+", label: "Graduates Placed in Top Companies", image: statPlaced },
  { value: "100%", label: "Job Placement Guarantee on Paper", image: statGuarantee },
  { value: "12,000+", label: "Placement Drives Conducted", image: statDrives },
];

const spotlightNews = [
  {
    title: "FTI Mumbai — Mumbai's Most Trusted Job Oriented Training Institute",
    link: "/about",
  },
  {
    title: "FTI Sees 300% Growth In Student Placements Amid Market Jitters",
    link: "/placement",
  },
];

const whyStats = [
  { value: "250+", label: "Graduates placed across top companies in Mumbai & beyond", icon: GraduationCap },
  { value: "100%", label: "Job placement guarantee provided to every student on paper", icon: Briefcase },
  { value: "12,000+", label: "Placement drives conducted in partnership with hiring companies", icon: Clock },
];

const whyHighlights = [
  "90% Practical Training",
  "Instant Doubt Solving",
  "Certification",
  "Mock Interviews",
  "Live Projects",
  "Personalized Career Coach",
  "Study Material",
  "100% Job Assurance",
];

const lightYears = [
  { title: "60+ Job oriented programs", text: "Web development, data, design, testing, security, cloud and more — designed around what companies actually hire for." },
  { title: "Certificates that add weight", text: "Every FTI course ends with a certification that signals real, project-proven skill to recruiters." },
  { title: "Mentors from the industry", text: "Learn from working professionals who bring real project experience and hiring knowledge to class." },
];

export default function Home() {
  const [storyIdx, setStoryIdx] = useState(0);
  const { groups, courses } = useSchoolCourses();
  const [selectedSlug, setSelectedSlug] = useState("code-data-careers");
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);

  const domain = groups.find((g) => g.slug === selectedSlug) || groups[0];
  const popularCourses = courses.slice(0, 6);

  const handlePrev = () =>
    setStoryIdx((i) => (i + testimonials.length - 1) % testimonials.length);
  const handleNext = () =>
    setStoryIdx((i) => (i + 1) % testimonials.length);

  const testimonyStack = [0, 1, 2].map((offset) => {
    const idx = (storyIdx - offset + testimonials.length * 2) % testimonials.length;
    return { ...testimonials[idx], idx, depth: offset };
  });

  return (
    <main>
      {/* ============================================================
          HERO (promo card + hero slide + stats)
      ============================================================ */}
      <section
        id="homepage-banner-trigger"
        className="relative isolate -mt-[70px] overflow-hidden"
        style={{
          background: "linear-gradient(120deg, #000000 0%, #0b3c68 55%, #12518a 120%)",
        }}
      >
        {/* subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            maskImage:
              "radial-gradient(ellipse 90% 60% at 50% 25%, #000 35%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 60% at 50% 25%, #000 35%, transparent 100%)",
          }}
        />

        {/* glow orbs */}
        <div className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-navy-light/40 blur-[120px]" />
        <div className="animate-float pointer-events-none absolute -right-24 top-36 h-[360px] w-[360px] rounded-full bg-terracotta/25 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-[380px] w-[380px] rounded-full bg-navy-light/25 blur-[140px]" />

        <div className="px-[16px] pt-[108px] md:px-[80px] md:pt-[24px]">
          {/* ---- Hero slide ---- */}
          <div className="mx-auto max-w-[1280px]">
            <div className="relative flex min-h-[420px] items-center overflow-hidden rounded-[40px] md:min-h-[518px]">
              <div className="relative mx-auto grid min-h-[360px] w-full max-w-[1120px] items-center gap-12 px-[18px] py-16 text-center md:min-h-[440px] lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:text-left">
                {/* Left: text */}
                <div className="flex flex-col items-center lg:items-start">
                  <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 font-roboto text-[12px] font-[500] tracking-wide text-white/90 backdrop-blur-md md:text-[13px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#d8b6a8" aria-hidden>
                      <path d="M12 2l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.62l-5.88 3.09 1.12-6.55L2.48 8.92l6.58-.96L12 2z" />
                    </svg>
                    Mumbai&rsquo;s Most Trusted Job-Oriented Training Institute
                  </span>

                  <h1 className="font-display text-[32px] font-bold leading-[38px] text-white md:text-[62px] md:leading-[72px]">
                    Your{" "}
                    <span className="bg-gradient-to-r from-terracotta-light via-[#dfc0b2] to-terracotta-light bg-clip-text text-transparent">
                      AI Powered
                    </span>{" "}
                    Future, Starts at FTI
                  </h1>

                  <p className="relative mt-6 font-display text-[18px] font-[500] leading-[24px] text-white md:mt-8 md:text-[32px] md:leading-[40px]">
                    India's Top Job-Ready Certification Platform
                    <span className="absolute left-0 right-0 mx-auto -bottom-3 w-fit md:-bottom-5 lg:left-0 lg:right-auto lg:mx-0">
                      <svg width="100%" height="24" viewBox="0 0 312 24" fill="none" style={{ minWidth: "220px" }} aria-hidden>
                        <path
                          d="M5 19C59 8.6 90.6 6.4 120 11.5c21 3.7 44.5 6 72 1.5 30.5-5 81-8.5 112-5"
                          stroke="#a5877a"
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                      </svg>
                    </span>
                  </p>

                  <a
                    href="#our-courses"
                    className="mt-[70px] hidden w-fit cursor-pointer items-center gap-[10px] rounded-[35.217px] border border-terracotta bg-terracotta px-[30px] py-[12px] font-display text-[16px] font-[500] text-white transition-all hover:bg-terracotta-dark active:scale-95 md:flex"
                  >
                    Explore Now
                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" aria-hidden>
                      <path
                        d="M11.1076 3.93247 16.4513 9.55746a.92.92 0 0 1 0 1.3014L11.1076 16.0668a.937.937 0 0 1-1.3409 0 .946.946 0 0 1 0-1.3014l4.0581-3.6991H2.68c-.5176 0-.937-.42-.937-.937 0-.516.4194-.937.937-.937h11.1447l-4.0581-3.6991a.946.946 0 0 1 0-1.3014.937.937 0 0 1 1.3409 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>

                  <a
                    href="#our-courses"
                    className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-white active:scale-95 md:hidden"
                  >
                    Explore Now <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

                {/* Right: floating student visual (desktop) */}
                <div className="relative hidden lg:block">
                  <div className="animate-float relative">
                    <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/5 p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md">
                      <img
                        src={heroTeam}
                        alt="FTI Mumbai students"
                        loading="eager"
                        className="h-full w-full rounded-[26px] object-cover"
                      />
                      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 px-4 py-3 text-left backdrop-blur">
                        <p className="font-display text-[14px] font-[800] leading-tight text-navy-dark">
                          12,000+ Placement Drives
                        </p>
                        <p className="mt-0.5 text-[11px] font-[500] text-slate-600">
                          Conducted in partnership with hiring companies
                        </p>
                      </div>
                    </div>

                    <div className="absolute -left-10 top-10 rounded-full bg-white/95 px-4 py-2 shadow-xl backdrop-blur">
                      <span className="font-display text-[13px] font-[800] text-navy-dark">
                        100% Job Assurance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Stats ---- */}
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-[20px] px-[18px] pt-[18px] pb-[49px] md:grid-cols-3 xl:gap-[56px]">
            {heroStats.map((s) => (
              <div
                key={s.label}
                className="group relative flex w-full flex-col overflow-hidden rounded-[24px] border border-[#3b4a63] text-center transition-transform duration-300 hover:-translate-y-1"
                style={{ background: "linear-gradient(180deg, #0b3c68 10.42%, #082c4d 97.69%)" }}
              >
                <div className="relative h-[120px] w-full overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col items-center px-6 pb-6 pt-4">
                  <h3 className="font-display text-[28px] font-[700] leading-[34px] text-terracotta-light md:text-[40px] md:leading-[48px]">
                    {s.value}
                  </h3>
                  <p className="mt-1 font-display text-[12px] font-[400] leading-[18px] text-white md:text-[16px] md:leading-[26px]">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPANY LOGO MARQUEE
      ============================================================ */}
      <section id="about-masai" className="bg-white pt-[50px]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <div className="animate-marquee flex w-max items-center">
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} className="mx-[25px] flex h-[80px] items-center justify-center md:h-[108px]">
                  <img
                    src={logo}
                    alt="Hiring partner logo"
                    loading="lazy"
                    className="h-fit w-[80px] object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 md:w-[108px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR & TRENDING COURSES
      ============================================================ */}
      <section
        className="mx-auto scroll-mt-24 md:max-w-[1280px] md:mt-[106px] mt-[56px] pb-[80px]"
      >
        <h2 className="mb-[24px] text-center font-display text-[22px] font-[600] text-ink md:mb-[32px] md:text-[32px]">
          Popular &amp; Trending Courses
        </h2>
        <div className="flex flex-wrap justify-center gap-[20px] md:gap-[32px] [&>*]:max-w-[380px]">
          {popularCourses.map((course) => (
            <ProgramCard key={course.name} course={course} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-[40px] border border-terracotta px-8 py-3 font-display text-[16px] font-[600] text-terracotta transition-all hover:bg-terracotta hover:text-white active:scale-95"
          >
            View More
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ============================================================
          FIVE CAREER TRACKS (brochure p.02)
      ============================================================ */}
      <CareerTracks />

      {/* ============================================================
          CHOOSE FROM THE DOMAINS WE TEACH (sticky tabs)
      ============================================================ */}
      <section id="our-courses" className="mx-auto my-[100px] max-w-[1280px] scroll-mt-24 bg-white">
        <div className="bg-white">
          <h2 className="pt-[40px] text-center font-display text-[22px] font-semibold text-black md:pt-[48px] md:text-[32px]">
            Choose from the domains we teach
          </h2>

          {/* Desktop tab bar */}
          <div className="scrollbar-hide sticky top-[72px] z-10 mt-[32px] hidden overflow-x-auto border-b border-[#E5E5E5] bg-white md:block">
            <div className="flex px-6 lg:px-16">
              {groups.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => setSelectedSlug(g.slug)}
                  className={`min-h-[68px] px-6 py-3 font-display text-[15px] font-medium whitespace-nowrap transition lg:text-[18px] ${
                    domain && domain.slug === g.slug
                      ? "border-b-4 border-terracotta bg-[linear-gradient(180deg,rgba(246,217,223,0)_24.07%,#f6d9df_100%)] text-terracotta"
                      : "text-[#888384] hover:text-navy"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="sticky top-[72px] z-10 bg-white px-4 pt-3 md:hidden">
            <button
              onClick={() => setDomainMenuOpen((v) => !v)}
              className="flex h-[56px] w-full items-center justify-between rounded-[48px] border-[1.5px] border-terracotta px-6 font-display text-[16px] font-semibold text-terracotta"
            >
              {domain ? domain.name : "Select school"}
              <ChevronDown className={`h-5 w-5 transition-transform ${domainMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {domainMenuOpen && (
              <ul className="mt-2 max-h-72 overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-card">
                {groups.map((g) => (
                  <li key={g.slug}>
                    <button
                      onClick={() => {
                        setSelectedSlug(g.slug);
                        setDomainMenuOpen(false);
                      }}
                      className={`w-full rounded-[16px] px-4 py-2.5 text-left font-display text-sm transition ${
                        domain && domain.slug === g.slug
                          ? "bg-terracotta/10 font-semibold text-terracotta"
                          : "text-slate-700"
                      }`}
                    >
                      {g.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Content */}
          <div className="isolate relative px-[16px] pb-[48px] md:px-[24px]">
            {domain && (
              <div className="relative mt-[16px] h-auto overflow-hidden rounded-[32px] md:mt-[24px]">
                <img
                  src={domain.heroImage}
                  alt={domain.name}
                  loading="lazy"
                  className="h-[420px] w-full object-cover object-bottom md:h-[480px]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(8,44,77,0.55) -52.65%, rgba(8,44,77,0.35) 108.56%)",
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10 text-center">
                  <div className="mx-auto flex max-w-[160px] items-center justify-center rounded-[24px] bg-white px-[14px] py-[8px] shadow-card">
                    <img src={ftiLogo} alt="FTI Mumbai" className="h-12 w-auto object-contain" />
                  </div>
                  <h3 className="mt-5 font-display text-[26px] font-[700] text-white md:text-[32px]">
                    {domain.name}
                  </h3>
                  <p className="mt-1 font-display text-[15px] font-[400] text-white/85">
                    {domain.poweredBy ? `${domain.poweredBy} · ` : ""}
                    {domain.courses.length} job-oriented programs
                  </p>
                  <Link
                    to={`/${domain.slug}`}
                    className="group mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-[40px] border border-terracotta bg-terracotta px-5 py-3 transition-all hover:bg-terracotta-dark active:scale-95"
                  >
                    <span className="font-display text-[16px] font-[600] tracking-[0.16px] text-white">
                      Explore this school
                    </span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          BE A PART OF OUR THRIVING COMMUNITY (curved carousel)
      ============================================================ */}
      <section
        className="py-[70px]"
        style={{
          background:
            "linear-gradient(180deg, #f1e4de 82.14%, rgba(241, 228, 222, 0) 100%)",
        }}
      >
        <div className="mx-auto max-w-full">
          <h3 className="mb-[26px] mx-auto text-center font-display text-[26px] font-[600] uppercase text-[#222] md:text-[38px]">
            Be a part of our thriving community
          </h3>

          <div className="mt-[20px] mb-[32px] w-full px-[16px]">
            <div className="curved-carousal relative overflow-hidden">
              <div
                className="grid snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden px-4 md:px-[16px]"
                style={{
                  gridAutoFlow: "column",
                  gridTemplateRows: "300px",
                  scrollbarWidth: "none",
                }}
              >
                {[...groups, ...groups].map((g, i) => (
                  <Link
                    key={`${g.slug}-${i}`}
                    to={`/${g.slug}`}
                    className="block h-full snap-center overflow-hidden md:w-[360px]"
                  >
                    <img
                      src={g.heroImage}
                      alt={g.name}
                      loading="lazy"
                      className="pointer-events-none h-full w-full object-cover object-top transition duration-500 hover:scale-105"
                    />
                  </Link>
                ))}
              </div>

              <div
                className="pointer-events-none absolute h-[100px] w-[calc(100vw+120px)] rounded-[45%] bg-[#f1e4de]"
                style={{ left: "-60px", right: "-60px", top: "-70px", zIndex: 10 }}
              />
              <div
                className="pointer-events-none absolute h-[100px] w-[calc(100vw+120px)] rounded-[45%] bg-[#f1e4de]"
                style={{ left: "-60px", right: "-60px", bottom: "-70px", zIndex: 10 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SUCCESS STORIES (stacked testimonial cards)
      ============================================================ */}
      <section className="relative isolate mx-auto flex w-full flex-col items-center px-4 py-[80px] md:py-[100px]">
        <h2 className="mb-[40px] text-center font-display text-[28px] font-[600] text-[#222] md:mb-[72px] lg:text-[40px]">
          Shaping Success Stories Since 2019 <br className="hidden lg:block" />{" "}
          Your Goal. Our Mission
        </h2>

        <div className="relative flex w-full max-w-[1195px] flex-col items-center h-[560px] md:h-[460px]">
          {testimonyStack.map((t, depth) => (
            <figure
              key={t.name}
              className={`absolute left-1/2 w-full max-w-[1195px] min-h-[320px] -translate-x-1/2 rounded-[36px] border bg-white p-6 shadow-[0_8px_32px_0_rgba(139,96,91,0.18)] transition-all duration-500 md:p-[44px] ${
                depth === 0
                  ? "z-[10] bottom-0 scale-100 opacity-100"
                  : depth === 1
                    ? "z-[8] bottom-[60px] scale-[0.84] opacity-70"
                    : "z-[7] bottom-[120px] scale-[0.76] opacity-60"
              }`}
              style={{ borderColor: depth === 0 ? "#e8c7be" : "transparent" }}
            >
              <div className="hidden md:block">
                <svg width="50" height="46" viewBox="0 0 50 46" fill="#E9E7E7" aria-hidden>
                  <path d="M21 0H4a4 4 0 0 0-4 4v17a4 4 0 0 0 4 4h9v4a9 9 0 0 1-9 9H0v4a8 8 0 0 0 8 8h2a14 14 0 0 0 14-14v-32a4 4 0 0 0-4-1ZM47 0H30a4 4 0 0 0-4 4v17a4 4 0 0 0 4 4h9v4a9 9 0 0 1-9 9h-3v4a8 8 0 0 0 8 8h2a14 14 0 0 0 14-14V4a4 4 0 0 0-3-4Z" />
                </svg>
              </div>

              <blockquote
                className={`mt-4 flex-1 overflow-y-auto font-display text-[15px] font-[400] leading-[26px] text-[#868686] md:text-[18px] md:leading-[30px] ${
                  depth === 0 ? "max-h-[230px] md:max-h-[180px]" : "max-h-[160px]"
                }`}
              >
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-terracotta to-navy font-display text-lg font-bold text-white">
                  {t.name[0]}
                </span>
                <span>
                  <h3 className="font-display text-lg font-semibold text-terracotta">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-600">{t.role}</p>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-[40px] flex items-center gap-4">
          <button
            onClick={handlePrev}
            aria-label="Previous story"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1e4de] text-terracotta transition-all hover:bg-terracotta hover:text-white active:scale-90"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setStoryIdx(i)}
                aria-label={`Go to story ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === storyIdx ? "w-8 bg-terracotta" : "w-2 bg-[#f3dede]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            aria-label="Next story"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1e4de] text-terracotta transition-all hover:bg-terracotta hover:text-white active:scale-90"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* ============================================================
          WHY FTI & WHY NOW?
      ============================================================ */}
      <section
        id="why-ai"
        className="mx-auto max-w-[1440px] px-[16px] pt-[50px] pb-[20px] md:px-[40px]"
      >
        <h2 className="pb-[30px] text-center font-display text-[28px] font-[600] text-[#000] md:text-[40px]">
          Why FTI &amp; Why Now?
        </h2>

        <div className="hidden flex-row items-start gap-[38px] md:flex">
          {[
            { stat: whyStats[0], highlight: lightYears[0], bullets: whyHighlights.slice(0, 3), startWithStat: true },
            { stat: whyStats[1], highlight: lightYears[1], bullets: whyHighlights.slice(3, 5), startWithStat: false },
            { stat: whyStats[2], highlight: lightYears[2], bullets: whyHighlights.slice(5, 8), startWithStat: true },
          ].map((col, i) => (
            <div
              key={i}
              className={`flex w-[330px] flex-col gap-[38px] ${i === 1 ? "mt-[56px]" : ""}`}
            >
              {/* Stat card */}
              <div
                className={`flex flex-col items-center rounded-[27.38px] px-[23.18px] py-[34px] text-center font-display text-white ${
                  col.startWithStat ? "" : "order-2"
                }`}
                style={{
                  background:
                    "linear-gradient(143.61deg, #6f5347 -1.94%, #8a605b 78.79%)",
                }}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  <col.stat.icon className="h-7 w-7 text-white" />
                </span>
                <p className="text-[42px] font-[700] leading-tight text-white md:text-[55px]">
                  {col.stat.value}
                </p>
                <p className="mt-3 text-[14px] font-[400] leading-[20.53px] text-white/90">
                  {col.stat.label}
                </p>
              </div>

              {/* Highlight card */}
              <div
                className={`rounded-[25.67px] bg-white px-[16px] py-[29.09px] ${
                  col.startWithStat ? "" : "order-1"
                }`}
                style={{ boxShadow: "0px 8.56px 22.93px 0px #0000001A" }}
              >
                <h3 className="font-display text-[15px] font-[700] leading-snug text-[#170D0D]">
                  {col.highlight.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {col.bullets.map((h) => (
                    <li key={h} className="flex items-start gap-2 font-display text-[13.5px] font-[400] leading-[22px] text-[#170D0D]">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-slate-100 pt-3 font-display text-[12.5px] font-[500] text-[#544D4F]">
                  {col.highlight.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="flex flex-col gap-6 md:hidden">
          {whyStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label}>
                <div
                  className="flex flex-col items-center rounded-[27.38px] px-6 py-8 text-center font-display text-white"
                  style={{
                    background:
                      "linear-gradient(143.61deg, #6f5347 -1.94%, #8a605b 78.79%)",
                  }}
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <p className="text-[44px] font-[700] leading-none">{s.value}</p>
                  <p className="mt-3 text-[14px] font-[400] leading-[20px] text-white/90">
                    {s.label}
                  </p>
                </div>
                {lightYears[i] && (
                  <div
                    className="mt-6 rounded-[25.67px] bg-white px-5 py-6"
                    style={{ boxShadow: "0px 8.56px 22.93px 0px #0000001A" }}
                  >
                    <h3 className="font-display text-[16px] font-[700] text-[#170D0D]">
                      {lightYears[i].title}
                    </h3>
                    <p className="mt-2 font-display text-[13.5px] font-[400] leading-[22px] text-[#170D0D]">
                      {lightYears[i].text}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          TALENT CORRIDOR & ABOUT (brochure p.04)
      ============================================================ */}
      <TalentCorridor />

      {/* ============================================================
          THE FTI MODEL & STANDARD (brochure p.08)
      ============================================================ */}
      <FtiStandard />

      {/* ============================================================
          VENTURE & ECOSYSTEM PARTNERS (brochure p.35)
      ============================================================ */}
      <PartnersGrid />

      {/* ============================================================
          FTI IN SPOTLIGHT
      ============================================================ */}
      <section
        id="masai-in-spotlight"
        className="relative isolate mt-[40px] flex flex-col items-center justify-center overflow-hidden py-[50px]"
      >
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-terracotta-dark" />

        <div className="relative mx-auto max-w-[1440px] px-[16px]">
          <h2 className="text-center font-display text-[28px] font-[600] text-white md:text-[40px]">
            FTI In Spotlight
          </h2>

          <div className="mt-12 flex w-full flex-col items-center justify-center gap-8 px-[16px] pb-[24px] lg:flex-row lg:items-center lg:gap-12">
            {/* Video card */}
            <Link to="/about" className="relative block w-full max-w-[625px]">
              <img
                src={whyDesktop}
                alt="FTI in spotlight"
                loading="lazy"
                className="h-full max-h-[264px] w-full rounded-[18px] border-2 border-white object-cover lg:max-h-[352px]"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
              </span>
            </Link>

            {/* News cards */}
            <div className="grid w-full max-w-[625px] gap-4 lg:max-w-[420px]">
              {spotlightNews.map((news) => (
                <Link
                  key={news.title}
                  to={news.link}
                  className="rounded-[26px] border-2 border-white bg-white p-[28px] transition-transform hover:scale-105"
                >
                  <img src={ftiLogo} alt="FTI Mumbai" className="h-[28px] object-contain" />
                  <p className="mt-[20px] font-display text-[16px] font-[400] leading-[28px] text-[#868686]">
                    {news.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}