export default function Logo({ className = "h-12" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-full w-auto" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#0B3C68" />
        <path d="M24 6 8 13.5v9C8 31.7 14.8 39.9 24 42c9.2-2.1 16-10.3 16-19.5v-9L24 6Z" fill="#8A6A5B" opacity="0.35" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fontSize="17"
          fill="#FFFFFF"
        >
          FTI
        </text>
        <circle cx="36" cy="36" r="4" fill="#8A6A5B" />
      </svg>
      <div className="leading-none">
        <p className="font-display text-xl font-extrabold tracking-tight text-navy">
          FTI<span className="text-terracotta">.</span>
        </p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-terracotta">
          Mumbai
        </p>
      </div>
    </div>
  );
}
