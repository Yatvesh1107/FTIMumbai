import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 10;

const buttonBase =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35";

const buildPageList = (current, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
};

export default function Pagination({
  total = 0,
  page = 1,
  pageSize = PAGE_SIZE,
  onPageChange,
  itemLabel = "records",
}) {
  if (!total) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  const go = (next) => {
    const target = Math.min(Math.max(1, next), totalPages);
    if (target !== current) onPageChange(target);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
      <p className="text-xs font-semibold text-slate-500">
        Showing <span className="font-bold text-slate-800">{from}</span>–
        <span className="font-bold text-slate-800">{to}</span> of{" "}
        <span className="font-bold text-slate-800">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
          className={`${buttonBase} border border-slate-300 text-slate-600 hover:bg-slate-50`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPageList(current, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-1 text-xs font-bold text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === current ? "page" : undefined}
              className={
                p === current
                  ? `${buttonBase} bg-[#0b3c68] text-white shadow`
                  : `${buttonBase} border border-slate-300 text-slate-600 hover:bg-slate-50`
              }
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
          className={`${buttonBase} border border-slate-300 text-slate-600 hover:bg-slate-50`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}