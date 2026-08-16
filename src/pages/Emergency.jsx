import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Phone, Shield, HeartPulse, Flame,
  HandHeart, CheckCircle, Table2, LayoutGrid, Search,
  PhoneCall, Siren, ChevronDown, SlidersHorizontal, Ambulance,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import { useTranslation } from "../context/LanguageContext";
import useEmergencyServices from "../hooks/emergencyHook";
import PaginationControls from "../admin/components/ui/PaginationControls";

// ── category config — matches your actual data categories ────────────────────
const CATEGORY_META = {
  Police: {
    Icon: Shield,
    accent: "from-blue-500 to-indigo-500",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    color: "text-blue-600 dark:text-blue-400",
  },
  Medical: {
    Icon: HeartPulse,
    accent: "from-rose-500 to-red-500",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    color: "text-rose-600 dark:text-rose-400",
  },
  Hospital: {
    Icon: HeartPulse,
    accent: "from-rose-500 to-red-500",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    color: "text-rose-600 dark:text-rose-400",
  },
  Fire: {
    Icon: Flame,
    accent: "from-orange-500 to-amber-500",
    badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    color: "text-orange-600 dark:text-orange-400",
  },
  Ambulance: {
    Icon: Siren,
    accent: "from-red-600 to-rose-500",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    color: "text-red-600 dark:text-red-400",
  },
  "Social Support": {
    Icon: HandHeart,
    accent: "from-violet-500 to-purple-500",
    badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    color: "text-violet-600 dark:text-violet-400",
  },
};
const defaultMeta = {
  Icon: Phone,
  accent: "from-slate-400 to-slate-500",
  badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  dot: "bg-slate-400",
  color: "text-slate-600 dark:text-slate-400",
};

export default function Emergency() {
  const { t } = useTranslation();
  const { emergencies = [], pagination, refresh } = useEmergencyServices();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    refresh(params);
  }, [params]);

  const categories = [...new Set(emergencies.map((c) => c.category))];

  const filtered = useMemo(() => {
    if (!catFilter) return emergencies;
    return emergencies.filter((c) => c.category === catFilter);
  }, [emergencies, catFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <PageBanner
        title="Emergency Services"
        subtitle={`${pagination?.total || filtered.length} services available 24/7 for your safety`}
        image="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1400&auto=format&fit=crop&q=80"
        gradient="from-rose-900/85 via-red-900/75 to-slate-900/80"
        Icon={AlertTriangle}
        badge="Emergency Contacts"
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
              placeholder="Search by service name, address or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {/* category filter */}
            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none transition-colors min-w-[160px]"
              >
                <option value="" className="bg-white dark:bg-slate-900">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900">{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* view toggle */}
            <div className="flex p-1 gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0 h-11 items-center">
              {[["table", Table2, "Table"], ["card", LayoutGrid, "Card"]].map(([v, Icon, lbl]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  title={lbl}
                  className={`flex items-center justify-center w-10 h-9 rounded-lg transition-all ${
                    view === v
                      ? "bg-rose-600 text-white shadow"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
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
                      {["Service", "Category", "Address", "Phone Numbers", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((c, i) => {
                      const { Icon, accent, badge, dot, color } = CATEGORY_META[c.category] ?? defaultMeta;
                      const phones = Array.isArray(c.contactPhone) ? c.contactPhone : [c.contactPhone];
                      return (
                        <motion.tr
                          key={c._id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors"
                        >
                          {/* service name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shrink-0`}>
                                <Icon size={15} className="text-white" />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-white">{c.serviceName}</span>
                            </div>
                          </td>

                          {/* category badge */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                              {c.category}
                            </span>
                          </td>

                          {/* address */}
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {c.address ?? "—"}
                          </td>

                          {/* phone numbers */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {phones.map((p, idx) => (
                                <a
                                  key={idx}
                                  href={`tel:${p}`}
                                  className={`font-bold text-base ${color} hover:opacity-75 transition-opacity`}
                                >
                                  {p}{idx < phones.length - 1 && <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>}
                                </a>
                              ))}
                            </div>
                          </td>

                          {/* call button */}
                          <td className="px-4 py-3">
                            <a
                              href={`tel:${phones[0]}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                            >
                              <PhoneCall size={11} /> Call Now
                            </a>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-400 dark:text-slate-600">
                  <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results found.</p>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((c, i) => {
                const { Icon, accent, badge, dot, color } = CATEGORY_META[c.category] ?? defaultMeta;
                const phones = Array.isArray(c.contactPhone) ? c.contactPhone : [c.contactPhone];
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shrink-0 shadow-md`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white">{c.serviceName}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            {c.category}
                          </span>
                        </div>
                      </div>

                      {c.address && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{c.address}</p>
                      )}

                      {/* phone numbers */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {phones.map((p, idx) => (
                          <a
                            key={idx}
                            href={`tel:${p}`}
                            className={`font-extrabold text-xl ${color} hover:opacity-75 transition-opacity`}
                          >
                            {p}
                          </a>
                        ))}
                      </div>

                      <a
                        href={`tel:${phones[0]}`}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${accent} text-white text-sm font-bold hover:opacity-90 transition-opacity`}
                      >
                        <PhoneCall size={14} /> Call Now
                      </a>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-600">
                  <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results found.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        <div className="mt-8">
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>
    </div>
  );
}