import AudienceLanding from "../components/AudienceLanding";
import { useSchools } from "../hooks/useSchools";

export default function CodeDataCareers() {
  const { schools } = useSchools();
  const school = schools.find((s) => s.slug === "code-data-careers");

  if (!school) return null;

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
      slug={school.slug}
    />
  );
}