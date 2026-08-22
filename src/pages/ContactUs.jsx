import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", course: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter your Name");
    if (!form.mobile.trim()) return alert("Please enter your Mobile No.");
    setSent(true);
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-navy to-navy-dark py-14 text-center text-white">
        <h1 className="font-display text-3xl font-extrabold tracking-wide sm:text-4xl">
          LET'S CONNECT
        </h1>
      </section>

      {/* Contact cards */}
      <section className="mx-auto -mt-8 max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1L6.6 10.8Z", title: "Call us at", lines: ["+91 90000 00000"] },
            { icon: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z", title: "Address", lines: ["Shop no 201 /202, Gold crest 369,", "Near New ViVa college, Virar West,", "Maharashtra 401303"] },
            { icon: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z", title: "Email Us", lines: ["info@ftimumbai.com"] },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-8 text-center shadow-lift ring-1 ring-slate-100"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-light">
                <svg viewBox="0 0 24 24" fill="#F8FAFC" className="h-7 w-7">
                  <path d={card.icon} />
                </svg>
              </span>
              <h3 className="font-display mt-4 font-bold text-navy">{card.title}</h3>
              <div className="mt-3 space-y-0.5">
                {card.lines.map((line, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
          <div className="h-2 w-full bg-gradient-to-r from-terracotta to-navy" />
          <div className="p-8 sm:p-10">
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/10 text-2xl">✓</div>
                <h2 className="font-display text-xl font-bold text-navy">Thank you for reaching out!</h2>
                <p className="mt-2 text-sm text-slate-600">Our team will get back to you shortly.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-navy">Send us a message</h2>
                <p className="mt-1 mb-6 text-sm text-slate-500">
                  Have a question about our courses? Fill in the form below.
                </p>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className={inputClass} />
                  <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile No." className={inputClass} />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email ID" className={`${inputClass} sm:col-span-2`} />
                  <input type="text" name="course" value={form.course} onChange={handleChange} placeholder="Course Name" className={`${inputClass} sm:col-span-2`} />
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows="4" className={`${inputClass} resize-none sm:col-span-2`} />
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-navy to-navy-light py-3 font-semibold text-white shadow-md transition hover:brightness-110 sm:col-span-2"
                  >
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
