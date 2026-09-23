import AudienceLanding from "../components/AudienceLanding";
import { schools } from "../data/schools";

const school = schools.find((s) => s.slug === "engineering-design-drafting");

export default function EngineeringDesign() {
  return (
    <AudienceLanding
      eyebrow={school.eyebrow}
      headline={school.headline}
      description={school.description}
      heroImage={school.heroImage}
      background={school.heroImage}
      featureIcon={school.featureIcon}
      features={school.features}
      courses={school.courses}
    />
  );
}