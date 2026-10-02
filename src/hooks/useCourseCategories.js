import { useEffect, useState } from "react";
import { Code2, Building2, Cpu, DraftingCompass, Truck } from "lucide-react";
import { apiRequest, assetUrl } from "../utils/api";

const featureIconMap = {
  Code2,
  Building2,
  Cpu,
  DraftingCompass,
  Truck,
};

const defaultIcon = Code2;

let cachePromise = null;

function normalizeCourseCategory(apiCategory) {
  const courses = (apiCategory.courses || []).map((c) => ({
    name: c.name,
    category: c.category || "",
    duration: c.duration || "",
    mode: c.mode || "",
    provider: c.provider || "FTI Mumbai",
    image: assetUrl(c.image),
    description: c.description || "",
    courseId: c._id,
    wywl: c.wywl || [],
    skills: c.skills || [],
    content: c.content || [],
  }));

  return {
    slug: apiCategory.slug,
    name: apiCategory.name,
    navLabel: apiCategory.navLabel,
    poweredBy: apiCategory.poweredBy,
    eyebrow: apiCategory.eyebrow,
    headline: apiCategory.headline,
    description: apiCategory.description,
    heroImage: assetUrl(apiCategory.heroImage),
    featureIcon: featureIconMap[apiCategory.featureIcon] || defaultIcon,
    features: apiCategory.features || [],
    enabled: apiCategory.enabled !== false,
    courses,
  };
}

async function fetchCourseCategories() {
  const res = await apiRequest("/categories");
  const list = (res && res.categories) || [];
  return list
    .filter((c) => c.enabled !== false)
    .map(normalizeCourseCategory);
}

export function useCourseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    if (!cachePromise) {
      cachePromise = fetchCourseCategories().catch((err) => {
        console.warn("Course categories API unavailable:", err.message);
        return [];
      });
    }
    cachePromise.then((result) => {
      if (!alive) return;
      setCategories(result || []);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading };
}