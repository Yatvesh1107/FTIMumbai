import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ROAD_D = `M 80 40 H 520 Q 620 40 620 120 V 180 Q 620 260 520 260
  H 160 Q 60 260 60 360 V 420 Q 60 520 160 520
  H 620 Q 760 520 760 620 V 700 Q 760 800 620 800
  H 280 Q 160 800 160 900 V 980 Q 160 1080 280 1080
  H 480 V 1320`;

const STEPS = [
  {
    title: "Enroll at FTI Mumbai",
    icon: "M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6Zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z",
  },
  {
    title: "Concept Sessions",
    icon: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82ZM12 3 1 9l11 6 9-4.91V17h2V9L12 3Z",
  },
  {
    title: "Assignments",
    icon: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm2 14H7v-2h7v2Zm3-4H7v-2h10v2Zm0-4H7V7h10v2Z",
  },
  {
    title: "Live Projects",
    icon: "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z",
  },
  {
    title: "Practice Sessions",
    icon: "M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4ZM4 6h16v10H4V6Z",
  },
  {
    title: "Grooming Sessions",
    icon: "M20.6 9.09 12 2 3.4 9.02c-.25.2-.4.51-.4.83V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-2h-2v1H5V10l7-5.78L19 10v6h2v-6.15c0-.32-.15-.63-.4-.83ZM12 5.44 7 9.56V20h10V9.56l-5-4.12Z",
  },
  {
    title: "Resume Building",
    icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z",
  },
  {
    title: "Interview Preparation",
    icon: "M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .39.23.74.59.89.35.14.76.07 1.04-.19l3.85-3.7H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm-4 9H8V9h8v2Z",
  },
  {
    title: "Be Job Ready",
    icon: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z",
  },
];

/* [top%, left%] — desktop first, then <=900px, then <=480px */
const POS_DESKTOP = [
  [2, 6],
  [3, 58],
  [15, 50],
  [16, 15],
  [32, 8],
  [32, 62],
  [52, 62],
  [63, 15],
  [90, 46],
];
const POS_TABLET = [
  [1, 2],
  [6, 52],
  [16, 55],
  [24, 6],
  [36, 3],
  [46, 50],
  [58, 5],
  [68, 50],
  [82, 28],
];
const POS_PHONE = [
  [1, 1],
  [6, 50],
  [16, 52],
  [24, 4],
  [36, 2],
  [46, 48],
  [58, 3],
  [72, 48],
  [92, 26],
];

const APPEAR_AT = [0.02, 0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81];

const IMAGES = import.meta.glob("../assets/steps/*.png", {
  eager: true,
  import: "default",
});
const stepImage = (i) =>
  IMAGES[`../assets/steps/step-${i + 1}.png`] ?? null;

export default function TrainingRoadmap() {
  const wrapRef = useRef(null);
  const roadRef = useRef(null);
  const maskRef = useRef(null);
  const stepRefs = useRef([]);
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 900 : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const road = roadRef.current;
    const mask = maskRef.current;
    if (!wrap || !road || !mask) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    let len = 0;
    try {
      len = road.getTotalLength();
    } catch {
      /* noop */
    }
    road.style.strokeDasharray = `${len}`;
    mask.style.strokeDasharray = `${len}`;
    road.style.strokeDashoffset = len;
    mask.style.strokeDashoffset = len;

    const revealAll = () => {
      road.style.strokeDashoffset = 0;
      mask.style.strokeDashoffset = 0;
      stepRefs.current.forEach((el) => el && el.classList.add("tp-on"));
    };

    if (reduced) {
      revealAll();
      return;
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = wrap.getBoundingClientRect();
      const winH =
        window.innerHeight || document.documentElement.clientHeight;
      const isMobile = window.innerWidth <= 900;
      const startFactor = isMobile ? 0.55 : 0.5;
      const heightFactor = isMobile ? 0.95 : 0.9;
      let p = (winH * startFactor - rect.top) / (rect.height * heightFactor);
      p = Math.max(0, Math.min(1, p));
      const off = Math.max(0, len - len * p);
      road.style.strokeDashoffset = off;
      mask.style.strokeDashoffset = off;
      APPEAR_AT.forEach((t, i) => {
        const el = stepRefs.current[i];
        if (el) el.classList.toggle("tp-on", p >= t);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (ticking) cancelAnimationFrame(ticking);
    };
  }, []);

  const posFor = (i) => {
    const [top, left] = mobile
      ? window.innerWidth <= 480
        ? POS_PHONE[i]
        : POS_TABLET[i]
      : POS_DESKTOP[i];
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative mx-auto h-[1400px] w-full max-w-[920px] max-[900px]:h-[2000px] max-[480px]:h-[2100px]"
      >
        <svg
          viewBox="0 0 900 1400"
          fill="none"
          preserveAspectRatio={mobile ? "none" : "xMidYMin meet"}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <mask id="tp-road-mask">
              <path
                ref={maskRef}
                d={ROAD_D}
                stroke="#fff"
                strokeWidth={mobile ? 60 : 52}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <path
            ref={roadRef}
            d={ROAD_D}
            stroke="#0B3C68"
            strokeWidth={mobile ? 56 : 48}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={ROAD_D}
            stroke="#F8FAFC"
            strokeWidth={mobile ? 7 : 6}
            strokeDasharray="18 16"
            strokeLinecap="round"
            mask="url(#tp-road-mask)"
          />
        </svg>

        {STEPS.map((step, i) => {
          const img = stepImage(i);
          return (
            <div
              key={step.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="tp-step"
              style={posFor(i)}
            >
              {img ? (
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="mx-auto block w-[100px] object-contain max-[900px]:w-[64px] max-[480px]:w-[80px]"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="#8A6A5B"
                  aria-hidden="true"
                  className="mx-auto mb-2 block h-10 w-10 max-[900px]:h-7 max-[900px]:w-7 max-[480px]:h-6 max-[480px]:w-6"
                >
                  <path d={step.icon} />
                </svg>
              )}
              <span className="inline-block rounded-full border-2 border-navy bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-slate-900 shadow-sm max-[900px]:max-w-[105px] max-[900px]:text-[10px] max-[900px]:leading-tight max-[900px]:whitespace-normal max-[480px]:px-2 max-[480px]:py-1 max-[480px]:text-[9px]">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 px-4 text-center">
        <Link
          to="/contactus"
          className="inline-block rounded-full bg-gradient-to-r from-navy to-navy-light px-10 py-3.5 text-[15px] font-bold text-white shadow-md transition hover:brightness-110"
        >
          YES, I AM INTERESTED
        </Link>
      </div>
    </div>
  );
}
