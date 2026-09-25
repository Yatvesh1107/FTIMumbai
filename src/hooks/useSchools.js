import { useEffect, useState } from "react";
import { Code2, Building2, Cpu, DraftingCompass, Truck } from "lucide-react";
import { apiRequest, assetUrl } from "../utils/api";
import { schools as staticSchools } from "../data/schools";

const featureIconMap = {
  Code2,
  Building2,
  Cpu,
  DraftingCompass,
  Truck,
};

const defaultIcon = Code2;

let cachePromise = null;

function normalizeSchool(apiSchool) {
  const staticSchool = staticSchools.find((s) => s.slug === apiSchool.slug);

  const courses =
    apiSchool.courses && apiSchool.courses.length
      ? apiSchool.courses.map((c) => ({
          name: c.name,
          category: c.category || "",
          duration: c.duration || "",
          mode: c.mode || "",
          provider: c.provider || "FTI Mumbai",
          image:
            assetUrl(c.image) ||
            (staticSchool && staticSchool.courses.find((sc) => sc.name === c.name)?.image) ||
            (staticSchool && staticSchool.heroImage),
          description: c.description || "",
          courseId: c._id,
        }))
      : (staticSchool && staticSchool.courses) || [];

  return {
    slug: apiSchool.slug,
    name: apiSchool.name,
    navLabel: apiSchool.navLabel,
    poweredBy: apiSchool.poweredBy,
    eyebrow: apiSchool.eyebrow,
    headline: apiSchool.headline,
    description: apiSchool.description,
    heroImage: assetUrl(apiSchool.heroImage) || (staticSchool && staticSchool.heroImage),
    featureIcon: featureIconMap[apiSchool.featureIcon] || (staticSchool && staticSchool.featureIcon) || defaultIcon,
    features: apiSchool.features && apiSchool.features.length ? apiSchool.features : (staticSchool && staticSchool.features) || [],
    enabled: apiSchool.enabled !== false,
    courses,
  };
}

async function fetchSchools() {
  const res = await apiRequest("/schools");
  const list = (res && res.schools) || [];
  return list
    .filter((s) => s.enabled !== false)
    .map(normalizeSchool);
}

export function useSchools() {
  const [schools, setSchools] = useState(staticSchools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    if (!cachePromise) {
      cachePromise = fetchSchools().catch((err) => {
        console.warn("Schools API unavailable, using static fallback:", err.message);
        return null;
      });
    }
    cachePromise.then((result) => {
      if (!alive) return;
      if (result && result.length) {
        setSchools(result);
      }
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return { schools, loading };
}