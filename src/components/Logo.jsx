import ftiLogo from "../assets/logo/FTI-logo.png";
import ftiLogoFooter from "../assets/logo/FTI-logo-footer.png";

export default function Logo({ className = "h-12", variant = "navbar" }) {
  const src = variant === "footer" ? ftiLogoFooter : ftiLogo;
  return (
    <img
      src={src}
      alt="FTI Mumbai"
      className={`${className} w-auto object-contain`}
    />
  );
}
