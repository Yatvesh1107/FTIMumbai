import { Award } from "lucide-react";
import AudienceLanding from "../components/AudienceLanding";
import graduateHero from "../assets/graduate-hero.jpg";

export default function ForGraduates() {
  return (
    <AudienceLanding
      eyebrow="For Graduates"
      headline="Kickstart your career journey with industry ready programs"
      description="Fresh out of college and unsure of your next step? Build a job ready profile with practical training, live projects and 100% placement assistance on paper."
      heroImage={graduateHero}
      background={graduateHero}
      featureIcon={Award}
      features={[
        { title: "Hands on industry projects" },
        { title: "Future ready curriculum" },
        { title: "Certificate from top institutes" },
      ]}
    />
  );
}