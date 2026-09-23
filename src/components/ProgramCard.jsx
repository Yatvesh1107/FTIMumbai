import { Link } from "react-router-dom";
import { Clock, Monitor, ArrowRight } from "lucide-react";
import { categories } from "../data/content";
import { programMeta } from "../data/programMeta";
import ftiLogo from "../assets/logo/FTI-logo.png";

export default function ProgramCard({ course }) {
  const category = categories.find((c) => c.category === course.category);
  const metaByCategory = programMeta[course.category];
  const meta = {
    duration: course.duration || (metaByCategory && metaByCategory.duration) || "Flexible",
    mode: course.mode || (metaByCategory && metaByCategory.mode) || "Classroom",
    nextBatch:
      course.nextBatch ||
      (metaByCategory && metaByCategory.nextBatch) ||
      "Admissions Open",
  };
  const provider = course.provider || "FTI Mumbai";
  const image = course.image || (category && category.image);

  const isAdmission = meta.nextBatch === "Admissions Open";
  const batchDate = isAdmission
    ? meta.nextBatch
    : meta.nextBatch.replace(/^New Batch:\s*/i, "");

  return (
    <Link
      to="/coursedetails"
      state={{ course: course.name }}
      className="group relative isolate block w-full overflow-hidden rounded-[48px] border border-[#E4E4E4] bg-white p-[16px] shadow-course transition-all duration-300 hover:-translate-y-1 hover:border-navy-light hover:shadow-[0_30px_50px_-20px_rgba(11,60,104,0.35)] after:absolute after:inset-0 after:z-[-1] after:origin-bottom-right after:scale-0 after:rounded-[48px] after:bg-gradient-to-br after:from-navy-light after:to-navy-dark after:opacity-0 after:transition-all after:duration-500 hover:after:scale-100 hover:after:opacity-100 md:mb-0"
    >
      <div className="relative overflow-hidden rounded-[34px]">
        <img
          src={image}
          alt={course.category}
          loading="lazy"
          className="w-full object-cover object-top transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-navy-dark/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur">
          <img src={ftiLogo} alt="FTI Mumbai" className="h-5 w-5 object-contain" />
          <span className="text-[11px] font-bold text-slate-800">{provider}</span>
        </div>
      </div>

      <p className="mt-[16px] text-center font-display text-[14px] font-[600] leading-[24px] text-navy transition-colors duration-300 group-hover:text-white">
        {provider}
      </p>

      <div className="min-h-[88px] px-1">
        <p className="text-center font-display text-[20px] font-[700] leading-[28px] text-ink transition-colors duration-300 group-hover:text-white! md:text-[22px]">
          {course.name}
        </p>
      </div>

      {/* Detail row: chips swap to learn-more button on hover */}
      <div className="relative mt-[18px] h-[28px]">
        <div className="absolute inset-0 opacity-100 transition-all duration-300 group-hover:opacity-0">
          <div className="flex h-full items-center justify-center gap-[32px]">
            <span className="flex items-center gap-[8px] text-[#3B3435] transition-colors duration-300 group-hover:text-white">
              <Clock className="h-6 w-6" />
              <span className="whitespace-nowrap font-display text-[14px] font-[400]">{meta.duration}</span>
            </span>
            <span className="flex items-center gap-[8px] text-[#3B3435] transition-colors duration-300 group-hover:text-white">
              <Monitor className="h-6 w-6" />
              <span className="whitespace-nowrap font-display text-[14px] font-[400]">{meta.mode}</span>
            </span>
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="flex h-full w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-[600] text-navy-dark transition-colors duration-200 hover:bg-navy hover:text-white active:scale-95">
            learn more
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      <p className="mt-[12px] text-center font-display text-[14px] text-[#3B3435] opacity-100 transition-all duration-300 group-hover:opacity-0">
        {isAdmission ? (
          "Admissions Open"
        ) : (
          <>
            Batch Starts on <span className="font-[700]">{batchDate}</span>
          </>
        )}
      </p>
    </Link>
  );
}