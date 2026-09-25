import { Handshake } from "lucide-react";
import { partners } from "../data/brochure";

export default function PartnersGrid() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            People & partners
          </p>
          <h2 className="font-display mt-3 text-[28px] font-[600] leading-tight text-[#21191B] sm:text-4xl">
            Every programme is co-owned by a company that does the work
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">{partners.intro}</p>
        </div>

        {partners.groups.map((group) => (
          <div key={group.kind} className="mt-10">
            <p className="text-sm font-bold uppercase tracking-wider text-navy">
              {group.kind}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.list.map((p) => (
                <article
                  key={p.name}
                  className="rounded-[32px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-dark text-white">
                    <Handshake className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-bold text-[#21191B]">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-terracotta">
                    {p.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {p.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
