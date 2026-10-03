import { useState } from "react";
import { PAGE_SIZE } from "../components/Pagination";

// Client-side slicing for admin list screens. Sends no extra query params and
// leaves the existing fetch/filter logic untouched — it only decides which
// slice of the already-loaded list gets rendered.
export function usePagination(items, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);

  return {
    page: current,
    setPage,
    total,
    totalPages,
    pageItems,
  };
}