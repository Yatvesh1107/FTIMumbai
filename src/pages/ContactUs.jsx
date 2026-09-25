const cards = [
  {
    title: "Call or WhatsApp",
    lines: ["+91 97699 33844", "+91 79774 75658"],
    icon: "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z",
  },
  {
    title: "Address",
    lines: [
      "Office 207/208, Mahalaxmi Centre,",
      "Opp. Balbharti School, S.V. Road,",
      "Kandivali (W), Mumbai, MH - 400067",
    ],
    icon: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z",
  },
  {
    title: "Email Us",
    lines: ["hello@ftimumbai.com"],
    icon: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
  },
  {
    title: "Timings",
    lines: ["09:00 AM – 09:00 PM", "Counselling by appointment,", "Monday to Saturday"],
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm5-8h-4V7a1 1 0 1 0-2 0v5a1 1 0 0 0 1 1h5a1 1 0 1 0 0-2Z",
  },
  {
    title: "Website & Social",
    lines: ["www.ftimumbai.com", "@ftimumbai on Instagram, Facebook, LinkedIn, YouTube"],
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3.1c-.3-1.2-.7-2.3-1.3-3.3A8 8 0 0 1 18.9 8ZM12 4.2c.9 1.1 1.6 2.4 1.9 3.8h-3.8c.3-1.4 1-2.7 1.9-3.8ZM4.4 11a7.6 7.6 0 0 1 .4-1.5h4.3c-.2 1-.2 1.9 0 2.9H4.9a7.6 7.6 0 0 1-.5-1.4Zm.5 1.5h4.3c.2 1 .3 2 .3 3H5.2a8 8 0 0 1-.3-3Zm1.2 4.5h4.1c.3 1.2.7 2.3 1.3 3.3A8 8 0 0 1 6.1 17Zm7.9 3.8c-.9-1.1-1.6-2.4-1.9-3.8h3.8c-.3 1.4-1 2.7-1.9 3.8Zm2-7.3h-2v-2h2a8 8 0 0 1 0 2Zm.1 1.5h-4.1a12.5 12.5 0 0 1 0-6h4a8 8 0 0 1 .1 6Z",
  },
];

export default function ContactUs() {
  return (
    <main className="bg-white pb-16 text-center">
      <h1 className="font-display pt-10 pb-8 text-center text-[34px] font-[600] text-[#21191B] sm:text-4xl">
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.881161909116!2d72.84603157520853!3d19.20039218203003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b6df01d928e1%3A0x209871c25e92b7fc!2s340%20Mahalaxmi%20Centre%20Premises%20CSLtd!5e0!3m2!1sen!2sin!4v1788441886966!5m2!1sen!2sin"
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
