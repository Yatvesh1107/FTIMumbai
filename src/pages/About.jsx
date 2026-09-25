import { Link } from "react-router-dom";
import { Target, Users, Award, HeartHandshake, ArrowRight } from "lucide-react";
import TalentCorridor from "../components/TalentCorridor";
import FtiStandard from "../components/FtiStandard";
import PartnersGrid from "../components/PartnersGrid";
import { welcomeTagline } from "../data/brochure";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    text: "Make high-quality, job oriented training affordable and accessible to every student, graduate and working professional in Mumbai — and beyond.",
  },
  {
    icon: Users,
    title: "Industry Mentors",
    text: "Learn directly from working industry experts who bring real project experience, practical insights and hiring knowledge to every class.",
  },
  {
    icon: Award,
    title: "Placement Guarantee",
    text: "100% job placement guarantee on paper. We prepare you with mock interviews, resume building and direct contact with hiring partners.",
  },
  {
    icon: HeartHandshake,
    title: "Lifetime Support",
    text: "Stay connected with FTI for life — updated course materials, alumni network and career guidance whenever you need it.",
  },
];

const gapFacts = [
  {
    value: "12M",
    label: "India adds roughly 12 million people to its working-age population every year. The skills they carry decide what that becomes.",
    source: "World Bank",
  },
  {
    value: "39%",
    label: "Employers expect 39% of workers' core skills to change by 2030. A degree earned today is already being rewritten.",
    source: "WEF Future of Jobs Report 2025",
  },
  {
    value: "~28 yrs",
    label: "India has one of the world's youngest workforces, with a median age of about 28. Skill is what turns that into an advantage.",
    source: "UN World Population Prospects",
  },
  {
    value: "1.5L+",
    label: "India has more than 1.5 lakh startups recognised by DPIIT, making it one of the three largest startup ecosystems in the world.",
    source: "DPIIT, 2025",
  },
];

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-navy/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-terracotta shadow-card">
            About FTI
          </span>
          <h1 className="font-display mx-auto mt-6 max-w-4xl text-[36px] font-[600] leading-tight text-[#21191B] sm:text-5xl">
            Five career tracks.
            <br />
            <span className="bg-gradient-to-r from-navy to-terracotta bg-clip-text text-transparent">
              One institute.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            {welcomeTagline}
          </p>
        </div>
      </section>

      {/* About FTI + Talent Corridor (brochure p.04) */}
      <TalentCorridor />

      {/* The gap nobody teaches (brochure p.03 / 05 / 06) */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              The gap nobody teaches
            </p>
            <h2 className="font-display mt-3 text-3xl font-[600] leading-tight text-slate-900 sm:text-4xl">
              From your degree to your career, mapped
            </h2>
            <p className="mt-5 space-y-4 text-slate-600 leading-relaxed">
              Degrees certify what you know. Careers depend on what you can do.
              Somewhere between the syllabus and the job description lives the gap
              nobody teaches — and that is precisely where FTI works: real projects,
              real mentors and a corridor that can take your skills anywhere in the
              world.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {gapFacts.map((f) => (
              <article
                key={f.value}
                className="rounded-[32px] border border-slate-200 bg-slate-50 p-6"
              >
                <p className="font-display text-4xl font-black text-terracotta">
                  {f.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.label}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {f.source}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The FTI model & standard (brochure p.08) */}
      <FtiStandard />

      {/* Values / mission */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              What drives us
            </p>
            <h2 className="font-display mt-3 text-3xl font-[600] text-slate-900 sm:text-4xl">
              Purpose-led training, proven by results
            </h2>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((v) => (
              <article
                key={v.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-terracotta to-terracotta-dark text-white">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-5 text-lg font-bold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {v.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Partners (brochure p.35) */}
      <PartnersGrid />

      {/* CTA */}
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
              Ready to start building what people actually use?
            </h3>
            <p className="mt-2 text-white/70">
              Explore the programmes across FTI's five schools of future skills.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-[40px] bg-gradient-to-r from-terracotta to-terracotta-dark px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta/30 transition hover:brightness-110 active:scale-95"
          >
            Explore Our Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}