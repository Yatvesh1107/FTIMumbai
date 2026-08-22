const cards = [
  {
    title: "Call us at",
    lines: ["+91 90000 00000"],
    icon: "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z",
  },
  {
    title: "Address",
    lines: [
      "Shop no 201 /202,",
      "Gold crest 369, above Zudio,",
      "Near New ViVa college, above zudio,",
      "Virar West, Maharashtra 401303",
    ],
    icon: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z",
  },
  {
    title: "Email Us",
    lines: ["info@ftimumbai.com"],
    icon: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
  },
];

export default function ContactUs() {
  return (
    <main className="bg-white pb-16 text-center">
      <h1 className="font-display pt-10 pb-8 text-center text-3xl font-semibold text-navy sm:text-4xl">
        LET'S CONNECT
      </h1>

      {/* Info columns */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 lg:flex-row lg:justify-center lg:gap-[7rem]">
        {cards.map((card) => (
          <div key={card.title} className="max-w-xs">
            <span className="mx-auto flex h-20 w-24 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-light shadow-card">
              <svg viewBox="0 0 24 24" fill="#F8FAFC" className="h-10 w-10">
                <path d={card.icon} />
              </svg>
            </span>
            <h3 className="font-display mt-4 text-xl font-bold text-navy">
              {card.title}
            </h3>
            <div className="mt-2 space-y-0.5">
              {card.lines.map((line) => (
                <p key={line} className="font-semibold text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="mx-auto mt-14 w-[90%] max-w-5xl">
        <iframe
          title="FTI Mumbai location"
          src="https://www.google.com/maps?q=Virar%20West%2C%20Maharashtra%20401303&output=embed"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-2xl shadow-lift"
        />
      </div>
    </main>
  );
}
