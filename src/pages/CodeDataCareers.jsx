import AudienceLanding from "../components/AudienceLanding";
import { useCourseCategories } from "../hooks/useCourseCategories";

export default function CodeDataCareers() {
  const { categories } = useCourseCategories();
  const category = categories.find((c) => c.slug === "code-data-careers");

  if (!category) return null;

  return (
    <AudienceLanding
      eyebrow={category.eyebrow}
      headline={category.headline}
      description={category.description}
      heroImage={category.heroImage}
      background={category.heroImage}
      featureIcon={category.featureIcon}
      features={category.features}
      courses={category.courses}
      slug={category.slug}
    />
  );
}