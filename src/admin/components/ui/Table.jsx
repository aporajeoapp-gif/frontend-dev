import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function Table({
  columns,
  data = [],
  searchKeys = [],
  actions,
  pageSize = 8,
  serverSide = false,
  pagination = null,
  onPageChange = null,
  onSearch = null,
  searchValue = "",
  showPagination = true,
}) {
  const [query, setQuery] = useState("");
  const [clientPage, setClientPage] = useState(1);

  const activeQuery = serverSide ? searchValue : query;
  const activePage = serverSide && pagination ? pagination.page : clientPage;

  const handleSearch = (e) => {
    const val = e.target.value;
    if (serverSide && onSearch) {
      onSearch(val);
    } else {
      setQuery(val);
      setClientPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setClientPage(newPage);
    }
  };

  const filtered = serverSide
    ? data
    : data.filter(
        (row) =>
          searchKeys.length === 0 ||
          searchKeys.some((k) =>
            String(row[k] ?? "")
              .toLowerCase()
              .includes(activeQuery.toLowerCase()),
          ),
      );

  const totalPages =
    serverSide && pagination
      ? pagination.totalPages
      : Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = serverSide
    ? data
    : filtered.slice((activePage - 1) * pageSize, activePage * pageSize);

  const totalResults = serverSide && pagination ? pagination.total : filtered.length;

  return (
    <div className="space-y-3">
      {(searchKeys.length > 0 || serverSide) && (
        <div className="relative max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={activeQuery}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 dark:focus:border-primary-500 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {!paginated || paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-10 text-center text-slate-400 dark:text-slate-500"
                >
                  No results found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row._id ?? row.id ?? i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{totalResults} results</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">
              {activePage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
