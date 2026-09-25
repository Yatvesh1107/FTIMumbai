import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { careerTracks, welcomeTagline, welcomeIntro } from "../data/brochure";

export default function CareerTracks() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
          Five career tracks. One institute.
        </p>
        <h2 className="font-display mt-3 text-[28px] font-[600] leading-tight text-ink md:text-[40px]">
          {welcomeTagline}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          {welcomeIntro}
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {careerTracks.map((track) => {
          const Icon = track.icon;
          return (
            <Link
              key={track.slug}
              to={`/${track.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-navy-light hover:shadow-[0_30px_50px_-20px_rgba(11,60,104,0.35)] md:rounded-[40px] md:p-7"
            >
              <div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-white shadow-lift transition group-hover:from-terracotta group-hover:to-terracotta-dark">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="font-display mt-5 text-lg font-bold text-[#21191B] transition-colors group-hover:text-terracotta md:text-xl">
                  {track.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {track.tagline}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta">
                Explore school
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
