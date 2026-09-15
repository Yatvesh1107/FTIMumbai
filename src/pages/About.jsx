import { Link } from "react-router-dom";
import { Target, Users, Award, HeartHandshake, ArrowRight } from "lucide-react";

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

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-navy/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-terracotta shadow-card">
            About Us
          </span>
          <h1 className="font-display mx-auto mt-6 max-w-3xl text-[36px] font-[600] leading-tight text-[#21191B] sm:text-5xl">
            Empowering Careers,
            <br />
            <span className="bg-gradient-to-r from-navy to-terracotta bg-clip-text text-transparent">
              One Student At A Time
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            FTI Mumbai is a job-oriented certification institute helping
            students and professionals master in-demand skills and land the
            careers they deserve.
          </p>
        </div>
      </section>

      {/* The FTI Mumbai Story */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              The FTI Mumbai Story
            </p>
            <h2 className="font-display mt-3 text-3xl font-[600] text-slate-900 sm:text-4xl">
              Built on a simple idea — training that actually gets you hired
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
              <p>
                FTI Mumbai started with a single mission: bridge the gap
                between what colleges teach and what companies actually need.
                What began as a small classroom of motivated learners has grown
                into one of Mumbai's most trusted job-oriented training
                institutes.
              </p>
              <p>
                Today we run practical, project-driven programs across web
                development, data science, digital marketing, design, testing
                and cyber security — loved equally by students, graduates and
                working professionals looking for a career change.
              </p>
              <p>
                Every course ends where it matters most: interviews with real
                companies. That is why every FTI student gets 100% placement
                assistance guaranteed on paper.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: "250+", label: "Graduates" },
              { stat: "100%", label: "Placement Assistance" },
              { stat: "60+", label: "Programs" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-gradient-to-br from-navy to-navy-dark p-6 text-center text-white shadow-lift"
              >
                <p className="font-display bg-gradient-to-r from-terracotta-light to-white bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                  {s.stat}
                </p>
                <p className="mt-2 text-xs font-medium text-white/75">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              Ready to write your own success story?
            </h3>
            <p className="mt-2 text-white/70">
              Explore 60+ job oriented programs at FTI Mumbai.
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