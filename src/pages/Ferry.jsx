import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Clock,
  Banknote,
  Anchor,
  Table2,
  LayoutGrid,
  Search,
  CheckCircle,
  ChevronDown,
  Eye,
  X,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import ListLoader from "../components/ListLoader";
import { useTranslation } from "../context/LanguageContext";
import useFerries from "../hooks/ferryhook";
import useDebouncedValue from "../hooks/useDebouncedValue";
import useResponsiveListView from "../hooks/useResponsiveListView";
import PaginationControls from "../admin/components/ui/PaginationControls";
import { formatTime12Hour } from "../utils/time";

function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getDuration(dep, arr) {
  const dMins = parseTime(dep);
  const aMins = parseTime(arr);
  if (dMins === null || aMins === null) return "â€”";
  let diff = aMins - dMins;
  if (diff < 0) diff += 1440;
  if (diff === 0) return "â€”";
  const h = Math.floor(diff / 60),
    m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function FerryDetailsModal({ ferry, onClose }) {
  if (!ferry) return null;

  const routeName = Array.isArray(ferry.routeName)
    ? ferry.routeName.join(" -> ")
    : ferry.routeName || "N/A";
  const timings = Array.isArray(ferry.timings) ? ferry.timings : [];

  const rows = [
    ["Route", routeName],
    ["Ferry Name", ferry.ferryName || "N/A"],
    ["Route Number", ferry.routeNumber || "N/A"],
    [
      "Fare",
      ferry.fare === null || ferry.fare === undefined
        ? "N/A"
        : `â‚¹${ferry.fare}`,
    ],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {routeName}
            </h3>
            <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
              Ferry Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3"
              >
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {label}
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Scheduled Timings
            </p>
            {timings.length > 0 ? (
              <div className="space-y-2">
                {timings.map((timing, index) => (
                  <div
                    key={`${timing.departure}-${timing.arrival}-${index}`}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3 text-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                      #{index + 1}
                    </span>
                    <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Depart
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                          {formatTime12Hour(timing.departure) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Arrive
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                          {formatTime12Hour(timing.arrival) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Duration
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                          {getDuration(timing.departure, timing.arrival)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No timings available.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Ferry() {
  const { t } = useTranslation();
  const { ferries = [], pagination, loading, refresh } = useFerries();
  const [view, setView] = useResponsiveListView();
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [detailsFerry, setDetailsFerry] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setParams((p) => ({ ...p, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    refresh(params);
  }, [params]);

  const routeNames = useMemo(() => {
    return [
      ...new Set(
        ferries.map((f) =>
          Array.isArray(f.routeName) ? f.routeName.join(" -> ") : f.routeName,
        ),
      ),
    ].filter(Boolean);
  }, [ferries]);

  const filtered = useMemo(() => {
    if (!routeFilter) return ferries;
    return ferries.filter((s) => {
      const rNameFull = Array.isArray(s.routeName)
        ? s.routeName.join(" - ")
        : s.routeName;
      return rNameFull === routeFilter;
    });
  }, [ferries, routeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PageBanner
        title="Ferry Services"
        subtitle={`${pagination?.total || filtered.length} active waterway routes`}
        image="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&auto=format&fit=crop&q=80"
        gradient="from-cyan-900/85 via-blue-900/75 to-slate-900/80"
        Icon={Ship}
        badge="Waterway Transport"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full min-w-0 flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative w-full min-w-0 sm:flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by route name or stopâ€¦"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
            />
          </div>

          {/* route filter */}
          <div className="relative w-full min-w-0 sm:min-w-[180px]">
            <Anchor
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none transition-colors"
            >
              <option value="">All Routes</option>
              {routeNames.map((rn) => (
                <option key={rn} value={rn}>
                  {rn}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <div className="flex p-1 gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0 h-11 items-center">
            {[
              ["table", Table2, "Table"],
              ["card", LayoutGrid, "Card"],
            ].map(([v, Icon, lbl]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={lbl}
                className={`flex items-center justify-center w-10 h-9 rounded-lg transition-all ${
                  view === v
                    ? "bg-cyan-600 text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <ListLoader label="Loading ferry routes..." />
        ) : (
          <AnimatePresence mode="wait">
            {/* â”€â”€ TABLE VIEW â”€â”€ */}
            {view === "table" && (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {[
                          "Route Name",
                          "Departure",
                          "Arrival",
                          "Duration",
                          "Fare",
                          "Stops",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered.map((s, i) => {
                        const timing = s.timings?.[0];
                        const routeName = Array.isArray(s.routeName)
                          ? s.routeName.join(" -> ")
                          : s.routeName;
                        return (
                          <motion.tr
                            key={s._id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                                  <Ship size={13} className="text-white" />
                                </div>
                                {routeName}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Clock size={12} className="text-cyan-500" />
                                {formatTime12Hour(timing?.departure) || "â€”"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Clock size={12} className="text-blue-500" />
                                {formatTime12Hour(timing?.arrival) || "â€”"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                                {timing
                                  ? getDuration(
                                      timing.departure,
                                      timing.arrival,
                                    )
                                  : "â€”"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                {s.fare === null || s.fare === undefined
                                  ? "N/A"
                                  : `â‚¹${s.fare}`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {s.stops.map((stop, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full"
                                  >
                                    {stop}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                <CheckCircle size={10} /> Active
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setDetailsFerry(s)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                title="View details"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filtered.length === 0 && (
                  <div className="py-16 text-center text-slate-400 dark:text-slate-600">
                    <Ship size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No routes found.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* â”€â”€ CARD VIEW â”€â”€ */}
            {(view === "card" || view === "table") && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${view === "table" ? "md:hidden" : ""}`}
              >
                {filtered.map((s, i) => {
                  const timing = s.timings?.[0];
                  const routeName = Array.isArray(s.routeName)
                    ? s.routeName.join(" - ")
                    : s.routeName;
                  return (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-100/50 dark:hover:shadow-cyan-900/20 transition-all"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shrink-0">
                            <Ship size={22} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">
                              {routeName}
                            </h3>
                            {s.ferryName && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {s.ferryName}
                              </p>
                            )}
                          </div>
                        </div>

                        {timing && (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                              {
                                label: "Departure",
                                val: formatTime12Hour(timing.departure),
                                color: "text-cyan-500",
                              },
                              {
                                label: "Arrival",
                                val: formatTime12Hour(timing.arrival),
                                color: "text-blue-500",
                              },
                              {
                                label: "Duration",
                                val: getDuration(
                                  timing.departure,
                                  timing.arrival,
                                ),
                                color: "text-slate-400",
                              },
                            ].map(({ label, val, color }) => (
                              <div
                                key={label}
                                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center"
                              >
                                <Clock
                                  size={12}
                                  className={`mx-auto mb-1 ${color}`}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                                  {label}
                                </p>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">
                                  {val}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Banknote size={13} className="text-cyan-500" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-lg">
                              {s.fare === null || s.fare === undefined
                                ? "N/A"
                                : `â‚¹${s.fare}`}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                            <CheckCircle size={10} /> Active
                          </span>
                        </div>

                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            <Anchor size={10} /> Stops
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {s.stops.map((stop, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full font-medium"
                              >
                                {stop}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetailsFerry(s)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                        >
                          <Eye size={14} /> Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-600">
                    <Ship size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No routes found.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {!loading && (
          <div className="mt-8">
            <PaginationControls
              pagination={pagination}
              onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailsFerry && (
          <FerryDetailsModal
            ferry={detailsFerry}
            onClose={() => setDetailsFerry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
