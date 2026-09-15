import courseIndex from "./courseIndex.json";

const alias = {
  "Cyber security": "Cyber Security",
  DevOPS: "DevOps",
  JAVA: "Full Stack Web Development",
};

export const courseCategoryAlias = alias;

export function coursesByCategory() {
  const map = {};
  for (const [name, rawCat] of Object.entries(courseIndex)) {
    const cat = alias[rawCat] || rawCat;
    (map[cat] = map[cat] || []).push(name);
  }
  return map;
}

export function categoryCourses(category) {
  return coursesByCategory()[category] || [];
}