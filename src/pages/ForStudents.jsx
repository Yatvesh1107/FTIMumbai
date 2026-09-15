import { GraduationCap } from "lucide-react";
import AudienceLanding from "../components/AudienceLanding";
import studentHero from "../assets/student-hero.jpg";

export default function ForStudents() {
  return (
    <AudienceLanding
      eyebrow="For Students"
      headline="Learn from the best, with industry aligned programs"
      description="Kickstart your career while you study. Hands-on projects, live mentoring and a future-ready curriculum built around exactly what today's employers look for."
      heroImage={studentHero}
      background={studentHero}
      featureIcon={GraduationCap}
      features={[
        { title: "Hands on industry projects" },
        { title: "Future ready curriculum" },
        { title: "Certificate from top institutes" },
      ]}
    />
  );
}