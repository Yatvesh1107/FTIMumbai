import { Code2, Building2, Cpu, DraftingCompass, Truck } from "lucide-react";
import studentHero from "../assets/student-hero.jpg";
import professionalHero from "../assets/professional-hero.jpg";
import teamHero from "../assets/hero-team.jpg";
import graduateHero from "../assets/graduate-hero.jpg";
import heroBoy from "../assets/hero-boy.png";
import fullStackWebDevelopment from "../assets/courses/card/full-stack-web-development.jpg";
import pythonDataScienceMl from "../assets/courses/card/python-data-science-ml.jpg";
import dataAnalytics from "../assets/courses/card/data-analytics.jpg";
import softwareTesting from "../assets/courses/card/software-testing.jpg";
import mobileAppDevelopment from "../assets/courses/card/mobile-app-development.jpg";
import cybersecurity from "../assets/courses/card/cybersecurity.jpg";
import appliedAiBusinessAnalytics from "../assets/courses/card/applied-ai-business-analytics.jpg";
import internetOfThings from "../assets/courses/card/internet-of-things.jpg";
import sapCareerTrack from "../assets/courses/card/sap-career-track.jpg";
import sapFastTrack from "../assets/courses/card/sap-fast-track.jpg";
import semiconductorWorkshop from "../assets/courses/card/semiconductor-workshop.jpg";
import industryCertification from "../assets/courses/card/industry-certification.jpg";
import skillProjectCourse from "../assets/courses/card/skill-project-course.jpg";
import projectBasedCompetency from "../assets/courses/card/project-based-competency.jpg";
import competencyBuilding from "../assets/courses/card/competency-building.jpg";
import instrumentationDesign from "../assets/courses/card/instrumentation-design.jpg";
import electricalDesign from "../assets/courses/card/electrical-design.jpg";
import caipsCertification from "../assets/courses/card/caips-certification.jpg";
import aiSupplyChain from "../assets/courses/card/ai-supply-chain.jpg";

export const schools = [
  {
    slug: "code-data-careers",
    name: "Code & Data Careers",
    navLabel: "Code & Data",
    poweredBy: "Codify",
    eyebrow: "Code & Data Careers",
    headline: "From writing code to shipping products people use.",
    description:
      "Thousands of graduates can write code, but very few can ship a working product. Recruiters screen for deployed apps, clean Git histories, testing discipline and the ability to explain design choices — FTI trains you to prove all of it, with live client projects and Codify mentors.",
    heroImage: studentHero,
    featureIcon: Code2,
    features: [
      { title: "Live client projects with Codify mentors" },
      { title: "Weekly code reviews & mock technical interviews" },
      { title: "Placement drives across Mumbai's IT & services belt" },
    ],
    courses: [
      {
        name: "Full Stack Web Development",
        category: "Full Stack Web Development",
        duration: "6 Months",
        mode: "Online + Classroom",
        image: fullStackWebDevelopment,
      },
      {
        name: "Python, Data Science & Machine Learning",
        category: "Data Science",
        duration: "6 Months",
        mode: "Online + Classroom",
        image: pythonDataScienceMl,
      },
      {
        name: "Data Analytics",
        category: "Data Analytics",
        duration: "3 Months",
        mode: "Online + Classroom",
        image: dataAnalytics,
      },
      {
        name: "Software Testing",
        category: "Software Testing",
        duration: "3 Months",
        mode: "Online + Classroom",
        image: softwareTesting,
      },
      {
        name: "Mobile App Development",
        category: "Mobile App Development",
        duration: "4 Months",
        mode: "Online + Classroom",
        image: mobileAppDevelopment,
      },
    ],
  },
  {
    slug: "enterprise-tech",
    name: "Enterprise Tech",
    navLabel: "Enterprise Tech",
    poweredBy: "Global IoT School",
    eyebrow: "Enterprise Tech",
    headline: "The systems every business runs on: its money, its risk and its edge.",
    description:
      "A company's money runs through an ERP like SAP, its risk sits in cybersecurity, and its operations increasingly run on AI and connected devices. Global IoT School practitioners train you hands-on on all three — with placement and internship support.",
    heroImage: professionalHero,
    featureIcon: Building2,
    features: [
      { title: "Trainers who are practising consultants" },
      { title: "100% real business scenarios, labs & SAP system access" },
      { title: "Placement and internship support" },
    ],
    courses: [
      {
        name: "Cybersecurity",
        category: "Cyber Security",
        duration: "3 Months",
        mode: "Online + Classroom",
        image: cybersecurity,
      },
      {
        name: "Applied AI & Business Analytics",
        category: "Data Science",
        duration: "1.5–3 Months",
        mode: "Online + Classroom",
        image: appliedAiBusinessAnalytics,
      },
      {
        name: "Internet of Things (IoT)",
        category: "DevOps",
        duration: "3 Months",
        mode: "Online + Classroom",
        image: internetOfThings,
      },
      {
        name: "SAP Career Track",
        category: "Full Stack Web Development",
        duration: "3 Months",
        mode: "Online + Classroom",
        image: sapCareerTrack,
      },
      {
        name: "SAP Fast-Track",
        category: "Data Analytics",
        duration: "1.5 Months",
        mode: "Online + Classroom",
        image: sapFastTrack,
      },
    ],
  },
  {
    slug: "deep-tech",
    name: "Deep Tech",
    navLabel: "Deep Tech",
    poweredBy: "PRS Semicon and DeepCoreX Labs",
    eyebrow: "Deep Tech",
    headline: "Where India's missions in chips, quantum and AI need people most.",
    description:
      "Fewer than 5 in 100 engineering graduates are industry-ready in VLSI, while quantum and agentic AI are barely on the syllabus. Build silicon-proven skills on IP from PRS Semicon and train in quantum and agent labs from DeepCoreX Labs — the highest-value gap in the portfolio.",
    heroImage: teamHero,
    featureIcon: Cpu,
    features: [
      { title: "Silicon-proven IP from a working chip design group" },
      { title: "Quantum labs on GPU stacks, AWS Braket & real hardware" },
      { title: "Agent building taught by a deep-tech venture studio" },
    ],
    courses: [
      {
        name: "Semiconductor Awareness Workshop",
        category: "Data Science",
        duration: "1 Day",
        mode: "Free · Live Demo",
        image: semiconductorWorkshop,
      },
      {
        name: "Industry Certification Course",
        category: "DevOps",
        duration: "30 Hours",
        mode: "Online + Classroom",
        image: industryCertification,
      },
      {
        name: "Skill & Project Course",
        category: "3D Software Architect",
        duration: "1 Month",
        mode: "Classroom",
        image: skillProjectCourse,
      },
      {
        name: "Project-Based Competency Programme",
        category: "Full Stack Web Development",
        duration: "3 Months",
        mode: "Classroom",
        image: projectBasedCompetency,
      },
      {
        name: "Competency Building Programme",
        category: "Cyber Security",
        duration: "52 Weeks",
        mode: "Classroom",
        image: competencyBuilding,
      },
    ],
  },
  {
    slug: "engineering-design-drafting",
    name: "Engineering Design & Drafting",
    navLabel: "Engineering Design",
    poweredBy: "Shree Siddhivinayak Institute",
    eyebrow: "Engineering Design & Drafting",
    headline: "Every plant, grid and data centre starts as a drawing.",
    description:
      "Diploma, ITI and engineering students learn software buttons — not how a P&ID becomes a hook-up drawing or a load list becomes a cable schedule. FTI teaches the full EPC workflow from practising design engineers, in Mumbai and Dubai.",
    heroImage: graduateHero,
    featureIcon: DraftingCompass,
    features: [
      { title: "Workflow-first teaching by practising design engineers" },
      { title: "Real industry project deliverables, checked and corrected" },
      { title: "Placement support in Mumbai and Dubai design offices" },
    ],
    courses: [
      {
        name: "Instrumentation Design & Drafting",
        category: "3D Software Architect",
        duration: "6 Months",
        mode: "Online + Offline",
        image: instrumentationDesign,
      },
      {
        name: "Electrical Design & Drafting",
        category: "3D Software Architect",
        duration: "6 Months",
        mode: "Online + Offline",
        image: electricalDesign,
      },
    ],
  },
  {
    slug: "ai-supply-chain",
    name: "AI-led Supply Chain & Procurement",
    navLabel: "Supply Chain AI",
    poweredBy: "AAPSCM®",
    eyebrow: "AI-led Supply Chain & Procurement",
    headline: "Procurement is where AI saves companies money first.",
    description:
      "Companies are buying AI tools for spend analytics, supplier risk and contract review, but the people running purchasing and logistics were trained for spreadsheets and phone calls. Build AI-ready procurement talent with the globally recognised AAPSCM CAIPS® credential.",
    heroImage: heroBoy,
    featureIcon: Truck,
    features: [
      { title: "Globally recognised, ISO/IEC 17024-aligned AAPSCM credential" },
      { title: "Case-based training on real procurement data" },
      { title: "Placement paths in India and across the Gulf" },
    ],
    courses: [
      {
        name: "Chartered AI Procurement Strategist (CAIPS)®",
        category: "Data Analytics",
        duration: "4 Days",
        mode: "Instructor-led + Exam",
        image: caipsCertification,
      },
      {
        name: "AI in Supply Chain Career Programme",
        category: "Data Science",
        duration: "12 Weeks",
        mode: "Online + Classroom",
        image: aiSupplyChain,
      },
    ],
  },
];