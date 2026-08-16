import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Tag,
  HeartPulse,
  Trophy,
  Music,
  Leaf,
  Search,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import PaginationControls from "../admin/components/ui/PaginationControls";
import { useTranslation } from "../context/LanguageContext";
import { useEvents } from "../hooks/eventHook";

const CATEGORY_META = {
  Health: {
    Icon: HeartPulse,
    color: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    accent: "from-rose-500 to-pink-500",
  },
  Sports: {
    Icon: Trophy,
    color: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    accent: "from-emerald-500 to-teal-500",
  },
  Culture: {
    Icon: Music,
    color: "text-violet-600 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    accent: "from-violet-500 to-purple-500",
  },
  Environment: {
    Icon: Leaf,
    color: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    accent: "from-teal-500 to-cyan-500",
  },
};

export default function Events() {
  const { t } = useTranslation();
  const { events, pagination, fetchEvents, loading } = useEvents();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });

  const categories = Object.keys(CATEGORY_META);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search, category, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    fetchEvents(params);
  }, [params, fetchEvents]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageBanner
        title="Community Events"
        subtitle="Discover upcoming events near you"
        image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&auto=format&fit=crop&q=80"
        gradient="from-violet-900/85 via-purple-900/75 to-slate-900/80"
        Icon={CalendarDays}
        badge="What's Happening"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* search input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by event title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors"
            />
          </div>

          {/* category filter */}
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none transition-colors min-w-[170px]"
            >
              <option value="" className="bg-white dark:bg-slate-900">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900">{c}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </motion.div>
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium italic">Discovering events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No upcoming events found at the moment.</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => {
              const meta = CATEGORY_META[event.category] || {
                Icon: Tag,
                color: "text-slate-600",
                badge: "bg-slate-100 text-slate-700",
                accent: "from-slate-400 to-slate-500",
              };
              const { Icon, color, badge, accent } = meta;

              return (
                <motion.div
                  key={event._id || event.id || i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  data-testid="event-card"
                >
                  <div
                    className={`h-40 bg-linear-to-br ${accent} flex items-center justify-center relative overflow-hidden`}
                  >
                    {event.image ? (
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 70% 30%, white 0%, transparent 60%)",
                        }}
                      />
                    )}
                    
                    {!event.image && <Icon size={48} className="text-white drop-shadow-lg relative z-10" />}
                    
                    {/* Category Overlay for images */}
                    {event.image && (
                      <div className="absolute top-3 right-3 z-10">
                         <div className={`p-2 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 text-white shadow-lg`}>
                            <Icon size={18} />
                         </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-800 dark:text-white leading-snug">
                        {event.title || event.name}
                      </h3>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}
                      >
                        {event.category}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={12} className={color} />
                        {/* <span>{event.date}</span> */}
                        <span>
  {new Date(event.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}
</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className={color} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className={color} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate-2-lines">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-8">
            <PaginationControls
              pagination={pagination}
              onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
