import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import AudienceLanding from "../components/AudienceLanding";
import { useCourseCategories } from "../hooks/useCourseCategories";

export default function CategoryPage() {
  const { slug } = useParams();
  const { categories, loading } = useCourseCategories();

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy/20 border-t-navy" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-[600] text-[#21191B]">Category not found</h1>
        <p className="mt-3 max-w-md text-slate-600">
          This category isn&apos;t published yet or the slug is incorrect.
        </p>
      </div>
    );
  }

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
