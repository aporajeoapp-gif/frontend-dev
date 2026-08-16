/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bus as BusIcon,
  Clock,
  Banknote,
  Navigation,
  Table2,
  LayoutGrid,
  Search,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import useBuses from "../hooks/bushook";
import PaginationControls from "../admin/components/ui/PaginationControls";

function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function getDuration(dep, arr) {
  const dMins = parseTime(dep);
  const aMins = parseTime(arr);
  if (dMins === null || aMins === null) return "-";

  let diff = aMins - dMins;
  if (diff < 0) diff += 1440;
  if (diff === 0) return "-";

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function getRouteName(routeName) {
  return Array.isArray(routeName) ? routeName.join(" -> ") : routeName || "Unnamed route";
}

function getIntermediateStops(bus) {
  if (Array.isArray(bus.intermediateStops) && bus.intermediateStops.length > 0) {
    return bus.intermediateStops;
  }

  if (Array.isArray(bus.stops)) {
    return bus.stops.map((stop) => ({ stopName: stop, time: "" }));
  }

  if (typeof bus.stops === "string" && bus.stops.trim()) {
    return bus.stops.split(",").map((stop) => ({ stopName: stop.trim(), time: "" }));
  }

  return [];
}

export default function Bus() {
  const { buses = [], pagination, refresh } = useBuses();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((current) => ({ ...current, search, page: 1 }));
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    refresh(params);
  }, [params, refresh]);

  const routeNames = useMemo(
    () =>
      [...new Set(buses.map((bus) => getRouteName(bus.routeName)))].filter(Boolean),
    [buses],
  );

  const filtered = useMemo(() => {
    if (!routeFilter) return buses;
    return buses.filter((bus) => getRouteName(bus.routeName) === routeFilter);
  }, [buses, routeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PageBanner
        title="Bus Services"
        subtitle={`${pagination?.total || filtered.length} active routes across the city`}
        image="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&auto=format&fit=crop&q=80"
        gradient="from-emerald-900/85 via-teal-900/75 to-slate-900/80"
        Icon={BusIcon}
        badge="Public Transport"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:flex-row mb-6"
        >
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by route name or stop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <div className="relative min-w-[180px]">
            <Navigation
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-colors"
            >
              <option value="">All Routes</option>
              {routeNames.map((name) => (
                <option key={name} value={name}>
                  {name}
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
            ].map(([value, Icon, label]) => (
              <button
                key={value}
                onClick={() => setView(value)}
                title={label}
                className={`flex items-center justify-center w-10 h-9 rounded-lg transition-all ${
                  view === value
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
                      {[
                        "Route Name",
                        "Departure",
                        "Arrival",
                        "Duration",
                        "Fare",
                        "Stops",
                        "Status",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-3 text-left whitespace-nowrap">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((bus, index) => {
                      const routeName = getRouteName(bus.routeName);
                      const timing = bus.timings?.[0] || {};
                      const departure = bus.departureStopageTime || timing.departure || "-";
                      const arrival = bus.arrivalStopageTime || timing.arrival || "-";
                      const stops = getIntermediateStops(bus);

                      return (
                        <motion.tr
                          key={bus._id || index}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                                <BusIcon size={13} className="text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span>{routeName}</span>
                                {bus.busName && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                    {bus.busName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock size={12} className="text-emerald-500" />
                              {departure}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock size={12} className="text-teal-500" />
                              {arrival}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                              {getDuration(departure, arrival)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Rs. {bus.fare}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {stops.length > 0 ? (
                                stops.map((stop, stopIndex) => (
                                  <span
                                    key={`${stop.stopName}-${stopIndex}`}
                                    className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full"
                                  >
                                    {stop.stopName}
                                    {stop.time ? ` · ${stop.time}` : ""}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
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

          {view === "card" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filtered.map((bus, index) => {
                const routeName = getRouteName(bus.routeName);
                const timing = bus.timings?.[0] || {};
                const departure = bus.departureStopageTime || timing.departure || "-";
                const arrival = bus.arrivalStopageTime || timing.arrival || "-";
                const stops = getIntermediateStops(bus);

                return (
                  <motion.div
                    key={bus._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
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
                          <h3 className="font-bold text-slate-800 dark:text-white">
                            {routeName}
                          </h3>
                          {bus.busName && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {bus.busName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: "Departure", value: departure, color: "text-emerald-500" },
                          { label: "Arrival", value: arrival, color: "text-teal-500" },
                          { label: "Duration", value: getDuration(departure, arrival), color: "text-slate-400" },
                        ].map((item) => (
                          <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center">
                            <Clock size={12} className={`mx-auto mb-1 ${item.color}`} />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                              {item.label}
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Banknote size={13} className="text-emerald-500" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            Rs. {bus.fare}
                          </span>
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
                          {stops.length > 0 ? (
                            stops.map((stop, stopIndex) => (
                              <span
                                key={`${stop.stopName}-${stopIndex}`}
                                className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium"
                              >
                                {stop.stopName}
                                {stop.time ? ` · ${stop.time}` : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
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

        <div className="mt-8">
          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          />
        </div>
      </div>
    </div>
  );
}

