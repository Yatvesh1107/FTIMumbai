import { MapPin, Globe2 } from "lucide-react";
import { aboutFti, ftiStats, nationalPriorities, corridorHubs, corridorRegions } from "../data/brochure";

export default function TalentCorridor() {
  return (
    <section
      className="relative isolate overflow-hidden py-16 lg:py-24"
      style={{
        background: "linear-gradient(120deg, #082c4d 0%, #0b3c68 55%, #12518a 130%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-10 h-[360px] w-[360px] rounded-full bg-terracotta/25 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta-light">
            About FTI
          </p>
          <h2 className="font-display mt-3 text-[28px] font-[600] leading-tight text-white sm:text-4xl">
            {aboutFti.headline}
          </h2>
          <div className="mt-5 space-y-4 text-white/75 leading-relaxed">
            {aboutFti.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p className="border-l-2 border-terracotta pl-4 text-white/90">
              {aboutFti.corridor}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ftiStats.map((s) => (
            <div
              key={s.label}
              className="rounded-[28px] border border-white/15 bg-white/10 p-5 text-center backdrop-blur-md"
            >
              <p className="font-display text-3xl font-extrabold text-terracotta-light sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-white/80 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Corridor */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/15 bg-white/5 p-6 backdrop-blur-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/20 text-terracotta-light">
              <MapPin className="h-5 w-5" />
            </span>
            <h3 className="font-display mt-4 text-lg font-bold text-white">
              The FTI talent corridor
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {corridorHubs.map((h) => (
                <span
                  key={h.name}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white"
                >
                  {h.name} · {h.label}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {corridorRegions.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/15 bg-white/5 p-6 backdrop-blur-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/20 text-terracotta-light">
              <Globe2 className="h-5 w-5" />
            </span>
            <h3 className="font-display mt-4 text-lg font-bold text-white">
              Aligned with national priorities
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {nationalPriorities.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white/90"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
