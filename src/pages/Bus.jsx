import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus as BusIcon, Clock, Banknote, Navigation,
  Table2, LayoutGrid, Search, CheckCircle, ArrowRight, ChevronDown,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import { useTranslation } from "../context/LanguageContext";
import useBuses from "../hooks/bushook";

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
  if (dMins === null || aMins === null) return "—";
  let diff = aMins - dMins;
  if (diff < 0) diff += 1440;
  if (diff === 0) return "—";
  const h = Math.floor(diff / 60), m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Bus() {
  const { t } = useTranslation();
  const { buses = [] } = useBuses();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");

  const routeNames = useMemo(() => {
    return [...new Set(buses.map((b) => Array.isArray(b.routeName) ? b.routeName.join(" → ") : b.routeName))].filter(Boolean);
  }, [buses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return buses.filter((s) => {
      const rNameFull = Array.isArray(s.routeName) ? s.routeName.join(" → ") : s.routeName;
      const matchSearch =
        rNameFull.toLowerCase().includes(q) ||
        s.stops.some((st) => st.toLowerCase().includes(q));
      const matchRoute = !routeFilter || rNameFull === routeFilter;
      return matchSearch && matchRoute;
    });
  }, [buses, search, routeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PageBanner
        title="Bus Services"
        subtitle={`${filtered.length} active routes across the city`}
        image="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&auto=format&fit=crop&q=80"
        gradient="from-emerald-900/85 via-teal-900/75 to-slate-900/80"
        Icon={BusIcon}
        badge="Public Transport"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* toolbar */}
        <motion.div
  initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by route name or stop…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          {/* route filter */}
          <div className="relative min-w-[180px]">
            <Navigation size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-colors"
            >
              <option value="">All Routes</option>
              {routeNames.map((rn) => (
                <option key={rn} value={rn}>{rn}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex p-1 gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0 h-11 items-center">
            {[["table", Table2, "Table"], ["card", LayoutGrid, "Card"]].map(([v, Icon, lbl]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={lbl}
                className={`flex items-center justify-center w-10 h-9 rounded-lg transition-all ${
                  view === v
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── TABLE VIEW ── */}
          {view === "table" && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {["Route Name", "Departure", "Arrival", "Duration", "Fare", "Stops", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((s, i) => {
                      const timing = s.timings?.[0];
                      const routeName = Array.isArray(s.routeName) ? s.routeName.join(" → ") : s.routeName;
                      return (
                        <motion.tr
                          key={s._id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                                <BusIcon size={13} className="text-white" />
                              </div>
                              {routeName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock size={12} className="text-emerald-500" />
                              {timing?.departure ?? "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock size={12} className="text-teal-500" />
                              {timing?.arrival ?? "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                              {timing ? getDuration(timing.departure, timing.arrival) : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{s.fare}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {s.stops.map((stop, idx) => (
                                <span key={idx} className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
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
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-400 dark:text-slate-600">
                  <BusIcon size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No routes found.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── CARD VIEW ── */}
          {view === "card" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filtered.map((s, i) => {
                const timing = s.timings?.[0];
                const routeName = Array.isArray(s.routeName) ? s.routeName.join(" → ") : s.routeName;
                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shrink-0">
                          <BusIcon size={22} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white">{routeName}</h3>
                          {s.busName && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.busName}</p>
                          )}
                        </div>
                      </div>

                      {timing && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: "Departure", val: timing.departure, color: "text-emerald-500" },
                            { label: "Arrival", val: timing.arrival, color: "text-teal-500" },
                            { label: "Duration", val: getDuration(timing.departure, timing.arrival), color: "text-slate-400" },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center">
                              <Clock size={12} className={`mx-auto mb-1 ${color}`} />
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
                              <p className="font-bold text-slate-800 dark:text-white text-sm">{val}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Banknote size={13} className="text-emerald-500" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">₹{s.fare}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                          <CheckCircle size={10} /> Active
                        </span>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          <Navigation size={10} /> Stops
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.stops.map((stop, idx) => (
                            <span key={idx} className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-600">
                  <BusIcon size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No routes found.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}