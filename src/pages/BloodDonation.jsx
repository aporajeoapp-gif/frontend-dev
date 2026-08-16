/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  MapPin,
  Clock,
  CalendarDays,
  Phone,
  Mail,
  Heart,
  ChevronRight,
  ImageIcon,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { useBloodCamp } from "../hooks/bloodCampHook";
import PaginationControls from "../admin/components/ui/PaginationControls";

const STATUS_META = {
  upcoming: {
    label: "Upcoming",
    cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  ongoing: {
    label: "Ongoing",
    cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  },
  completed: {
    label: "Completed",
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
};

const FILTERS = ["all", "upcoming", "ongoing", "completed"];

function CampCard({ camp }) {
  const navigate = useNavigate();
  const meta = STATUS_META[camp.status] ?? STATUS_META.upcoming;
  const progress =
    camp.targetUnits > 0
      ? Math.min((camp.collectedUnits / camp.targetUnits) * 100, 100)
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/blood-donation/${camp._id}`)}
    >
      {/* Banner */}
      <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {camp.banner_image ? (
          <img src={camp.banner_image} alt={camp.campName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
             <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm ${meta.cls}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <Droplets
                size={20}
                className="text-rose-600 dark:text-rose-400"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
                {camp.campName}
              </h3>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {camp.organizer}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-rose-400 shrink-0" />
            <span className="truncate">{camp.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-rose-400 shrink-0" />
            <span className="truncate">{camp.time}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin size={12} className="text-rose-400 shrink-0" />
            <span className="truncate">{camp.location}, {camp.city}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {(camp.bloodGroupsNeeded ?? []).map((g) => (
            <span
              key={g}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span>Collected Units</span>
            <span className="font-semibold">
              {camp.collectedUnits} / {camp.targetUnits}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-rose-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
             <Heart size={12} className="fill-rose-600" />
             Join Herd
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white group-hover:text-rose-600 transition-colors">
            View Details
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BloodDonation() {
  const { camps = [], pagination, loading, fetchCamps } = useBloodCamp();
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "", status: "upcoming" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search, status: filter === "all" ? "" : filter, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filter]);

  useEffect(() => {
    fetchCamps(params);
  }, [params, fetchCamps]);

  const filtered = camps;

  const totalDonors = camps.reduce((s, c) => s + (c.donors?.length ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageBanner
        title="Blood Donation Camps"
        subtitle="Find a camp near you and save lives. Every drop counts."
        image="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1400&auto=format&fit=crop&q=80"
        gradient="from-rose-950/90 via-rose-900/80 to-slate-950/90"
        Icon={Droplets}
        badge="Live to Give · Donate Blood"
      />

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Camps",
              value: pagination?.total || camps.length,
              color: "text-rose-500",
              bg: "bg-white dark:bg-slate-900",
            },
            {
              label: "Upcoming",
              value: camps.filter((c) => c.status === "upcoming").length,
              color: "text-blue-500",
              bg: "bg-white dark:bg-slate-900",
            },
            {
              label: "Ongoing",
              value: camps.filter((c) => c.status === "ongoing").length,
              color: "text-emerald-500",
              bg: "bg-white dark:bg-slate-900",
            },
            {
              label: "Total Donors",
              value: totalDonors,
              color: "text-violet-500",
              bg: "bg-white dark:bg-slate-900",
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/50 text-center transform transition-transform hover:-translate-y-1`}>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Blood Drives</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Current and upcoming donation events in our community.</p>
           </div>

           <div className="flex-1 max-w-md w-full relative">
             <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <input
               type="text"
               placeholder="Search by camp name, location..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-colors"
             />
           </div>
           
           <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
             {FILTERS.map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                   filter === f
                     ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20"
                     : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-rose-400"
                 }`}
               >
                 {f === "all" ? "View All" : f}
               </button>
             ))}
           </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
           </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Droplets size={32} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Camps Found</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1">
              There are currently no blood donation camps matching your selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((camp) => (
              <CampCard key={camp._id} camp={camp} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8">
            <PaginationControls
              pagination={pagination}
              onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
        
        <div className="mt-16 p-8 rounded-3xl bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-white mb-2">Want to register your own camp?</h3>
            <p className="text-slate-400 text-sm max-w-lg mb-6">
              If you are an organization or a volunteer group planning a blood drive, please contact the Oporajeo admin for verification and listing.
            </p>
            <div className="flex gap-4">
               <a href="mailto:contact@oporajeo.org" className="px-6 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                  <Mail size={16} /> Email Us
               </a>
               <a href="tel:+910000000000" className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <Phone size={16} /> Call Support
               </a>
            </div>
        </div>
      </div>
    </div>
  );
}
