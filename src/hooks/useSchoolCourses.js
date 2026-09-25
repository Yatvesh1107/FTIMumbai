import { useMemo } from "react";
import { useSchools } from "./useSchools";

export function useSchoolCourses() {
  const { schools, loading } = useSchools();

  const groups = useMemo(
    () =>
      schools.map((s) => ({
        slug: s.slug,
        name: s.name,
        navLabel: s.navLabel,
        poweredBy: s.poweredBy,
        eyebrow: s.eyebrow,
        headline: s.headline,
        description: s.description,
        heroImage: s.heroImage,
        icon: s.featureIcon,
        features: s.features,
        courses: s.courses || [],
      })),
    [schools],
  );

  const courses = useMemo(
    () =>
      groups.flatMap((g) =>
        g.courses.map((c) => ({
          ...c,
          schoolSlug: g.slug,
          schoolName: g.name,
        })),
      ),
    [groups],
  );

  return { groups, courses, loading };
}
