import { CheckCircle2, DoorOpen } from "lucide-react";
import { standardSteps, standardItems, audiences } from "../data/brochure";

export default function FtiStandard({ showAudiences = true }) {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            The FTI model
          </p>
          <h2 className="font-display mt-3 text-[28px] font-[600] text-[#21191B] sm:text-4xl">
            Learn. Build. Prove. Place.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Every programme, in every school, runs on the same four moves.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {standardSteps.map((s) => (
            <article
              key={s.step}
              className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="font-display text-4xl font-black text-terracotta/20">
                {s.step}
              </span>
              <h3 className="font-display mt-2 text-xl font-bold text-navy">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[40px] border border-slate-200 bg-white p-6 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            The FTI standard
          </p>
          <h3 className="font-display mt-2 text-xl font-[600] text-[#21191B] sm:text-2xl">
            Eight things every programme must include before we list it
          </h3>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {standardItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-terracotta" />
                {item}
              </li>
            ))}
          </ul>

          {showAudiences && (
            <>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                Four doors in
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {audiences.map((a) => (
                  <div
                    key={a.title}
                    className="rounded-2xl border border-slate-100 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy">
                      <DoorOpen className="h-4 w-4" />
                    </span>
                    <h4 className="font-display mt-3 text-sm font-bold text-[#21191B]">
                      {a.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {a.text}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
