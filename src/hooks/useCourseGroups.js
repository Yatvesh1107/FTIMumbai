import { useMemo } from "react";
import { useCourseCategories } from "./useCourseCategories";

export function useCourseGroups() {
  const { categories, loading } = useCourseCategories();

  const groups = useMemo(
    () =>
      categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        navLabel: c.navLabel,
        poweredBy: c.poweredBy,
        eyebrow: c.eyebrow,
        headline: c.headline,
        description: c.description,
        heroImage: c.heroImage,
        icon: c.featureIcon,
        features: c.features,
        courses: c.courses || [],
      })),
    [categories],
  );

  const courses = useMemo(
    () =>
      groups.flatMap((g) =>
        g.courses.map((c) => ({
          ...c,
          categorySlug: g.slug,
          categoryName: g.name,
        })),
      ),
    [groups],
  );

  return { groups, courses, loading };
}