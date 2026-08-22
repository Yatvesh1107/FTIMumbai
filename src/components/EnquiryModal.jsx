import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20";

export default function EnquiryModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    course: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter your Name");
    if (!form.mobile.trim()) return alert("Please enter your Mobile No.");
    if (!form.email.trim()) return alert("Please enter your Email");
    if (!form.course.trim()) return alert("Please enter your Course Name");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error);
      setSubmitted(true);
      setForm({ name: "", mobile: "", email: "", course: "" });
    } catch (err) {
      alert(err.message || "Could not send enquiry. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-navy-dark/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 w-full bg-gradient-to-r from-terracotta to-navy" />
        <button
          onClick={onClose}
          aria-label="Close enquiry form"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition hover:bg-navy hover:text-white"
        >
          &times;
        </button>
        <div className="px-8 py-8">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/10 text-2xl">
                ✓
              </div>
              <h3 className="font-display text-xl font-bold text-navy">
                Query Added Successfully!
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Our counsellor will call you back shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-navy px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-center text-2xl font-bold text-navy">
                Enquire Form
              </h2>
              <p className="mt-1 mb-6 text-center text-sm text-slate-500">
                Fill in your details and get a call back.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className={inputClass}
                />
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Mobile No."
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email ID"
                  className={inputClass}
                />
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="Course Name"
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-navy to-navy-light py-3 font-semibold text-white shadow-md transition hover:shadow-lift hover:brightness-110"
                >
                  Get A Call Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
