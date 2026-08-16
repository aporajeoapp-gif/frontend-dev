import { useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/* Builds a compact page list with ellipsis, e.g. [1, "...", 4, 5, 6, "...", 42] */
function getPageRange(current, total, siblings = 1) {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);

  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1);
    return [...leftRange, "...", total];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + siblings * 2 },
      (_, i) => total - (3 + siblings * 2) + i + 1
    );
    return [1, "...", ...rightRange];
  }

  const middleRange = Array.from({ length: right - left + 1 }, (_, i) => left + i);
  return [1, "...", ...middleRange, "...", total];
}

function PageButton({ page, active, onClick, children, disabled, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`min-w-9 h-9 px-3 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${
        active
          ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600"
      }`}
    >
      {children ?? page}
    </button>
  );
}

export default function PaginationControls({ pagination, onPageChange, siblings = 1 }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  const pages = useMemo(
    () => getPageRange(page, totalPages, siblings),
    [page, totalPages, siblings]
  );

  const goTo = useCallback(
    (target) => {
      const clamped = Math.min(Math.max(target, 1), totalPages);
      if (clamped !== page) onPageChange(clamped);
    },
    [page, totalPages, onPageChange]
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-sky-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1 font-bold text-white shadow-sm dark:bg-sky-500 dark:text-slate-950">
            Page {page}
          </span>
          <span className="text-slate-600 dark:text-slate-300">
            of {totalPages.toLocaleString()}
          </span>
          <span className="hidden md:inline text-slate-400 dark:text-slate-500">
            {total.toLocaleString()} results
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <PageButton
            ariaLabel="First page"
            onClick={() => goTo(1)}
            disabled={page === 1}
          >
            <ChevronsLeft size={16} />
          </PageButton>
          <PageButton
            ariaLabel="Previous page"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </PageButton>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-1.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
            {pages.map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="min-w-8 h-8 flex items-center justify-center px-1 text-slate-400 select-none"
                >
                  ...
                </span>
              ) : (
                <PageButton
                  key={p}
                  page={p}
                  active={p === page}
                  ariaLabel={`Page ${p}`}
                  onClick={() => goTo(p)}
                />
              )
            )}
          </div>

          <PageButton
            ariaLabel="Next page"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight size={16} />
          </PageButton>
          <PageButton
            ariaLabel="Last page"
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight size={16} />
          </PageButton>
        </div>
      </div>
    </nav>
  );
}
