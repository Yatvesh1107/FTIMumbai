import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "../data/content";

export default function Courses() {
  const location = useLocation();
  const initial =
    (location.state && location.state.category) || categories[0].category;
  const [active, setActive] = useState(initial);
  const activeCat = categories.find((c) => c.category === active);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-center text-3xl font-extrabold text-navy sm:text-4xl">
        Explore our courses below!
      </h1>

      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-72 lg:shrink-0">
          <div className="flex flex-row flex-wrap gap-2 rounded-2xl bg-navy p-3 shadow-card lg:max-h-[70vh] lg:flex-col lg:flex-nowrap lg:overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.category)}
                className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  active === cat.category
                    ? "bg-terracotta text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </aside>

        {/* Course panel */}
        {activeCat && (
          <div key={activeCat.id} className="animate-fade-up flex-1">
            <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-slate-100">
              <div className="flex items-start gap-5">
                <img
                  src={activeCat.image}
                  alt={activeCat.category}
                  className="hidden h-20 w-32 shrink-0 rounded-xl object-cover object-top shadow-card sm:block"
                />
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">
                    {activeCat.category}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeCat.topics.length} topics covered · Practical training
                    with placement assistance
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {activeCat.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-navy ring-1 ring-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
                <Link
                  to="/coursedetails"
                  state={{ category: activeCat.category }}
                  className="rounded-full bg-gradient-to-r from-navy to-navy-light px-7 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  KNOW MORE
                </Link>
                <Link
                  to="/contactus"
                  className="rounded-full border-2 border-terracotta px-7 py-3 text-sm font-semibold text-terracotta transition hover:bg-terracotta hover:text-white"
                >
                  ENQUIRE NOW
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
