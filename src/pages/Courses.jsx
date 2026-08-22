import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "../data/content";
import courseIndex from "../data/courseIndex.json";

// Map data categories (e.g. "Cyber security", "DevOPS") onto our card names
const alias = {
  "Cyber security": "Cyber Security",
  DevOPS: "DevOps",
  JAVA: "Full Stack Web Development",
};

export default function Courses() {
  const location = useLocation();
  const requested = location.state && location.state.category;

  const byCategory = useMemo(() => {
    const map = {};
    for (const [name, cat] of Object.entries(courseIndex)) {
      const key = alias[cat] || cat;
      (map[key] = map[key] || []).push(name);
    }
    return map;
  }, []);

  const initial =
    requested && byCategory[requested] ? requested : categories[0].category;
  const [active, setActive] = useState(initial);

  const activeCat = categories.find((c) => c.category === active);
  const courseList = byCategory[active] || [];

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

        {/* Course list */}
        <div key={active} className="animate-fade-up flex-1">
          {activeCat && (
            <div className="mb-6 flex items-start gap-5 rounded-2xl bg-navy p-6 shadow-card">
              <img
                src={activeCat.image}
                alt={activeCat.category}
                className="hidden h-20 w-32 shrink-0 rounded-xl object-cover object-top sm:block"
              />
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  {activeCat.category}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {courseList.length} courses available · Practical training
                  with placement assistance
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courseList.map((name) => (
              <div
                key={name}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <h3 className="font-display font-bold leading-snug text-navy">
                  {name}
                </h3>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <Link
                    to="/coursedetails"
                    state={{ course: name }}
                    className="text-sm font-bold tracking-wide text-terracotta transition hover:text-navy"
                  >
                    KNOW MORE →
                  </Link>
                  <Link
                    to="/contactus"
                    className="rounded-full bg-cream px-4 py-1.5 text-xs font-semibold text-navy ring-1 ring-slate-200 transition hover:bg-navy hover:text-white"
                  >
                    ENQUIRE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
