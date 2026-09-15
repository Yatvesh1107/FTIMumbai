import { Rocket } from "lucide-react";
import AudienceLanding from "../components/AudienceLanding";
import professionalHero from "../assets/professional-hero.jpg";

export default function ForProfessionals() {
  return (
    <AudienceLanding
      eyebrow="For Working Professionals"
      headline="Accelerate your career with advanced industry programs"
      description="Upskill without quitting your job. Weekend-friendly batches, advanced project-driven curriculum and mentorship to help you switch tracks or climb the ladder faster."
      heroImage={professionalHero}
      background={professionalHero}
      featureIcon={Rocket}
      features={[
        { title: "Hands on industry projects" },
        { title: "Future ready curriculum" },
        { title: "Certificate from top institutes" },
      ]}
    />
  );
}