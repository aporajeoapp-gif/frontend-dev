import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, MapPin, Phone, Mail, Award,
  Search, PhoneCall, CalendarCheck, X, Clock, Building,
  SlidersHorizontal, ChevronDown,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import useDoctors from "../hooks/doctorhook";
import PaginationControls from "../admin/components/ui/PaginationControls";

// ── specialty badge ───────────────────────────────────────────────────────────

const SPECIALTY_COLORS = {
  Cardiology:    "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  Cardiologist:  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  Pediatrics:    "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  Orthopedics:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  Dermatology:   "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  Dermatologist: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  Neurology:     "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  ENT:           "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
};
const DEFAULT_COLOR = "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300";

function SpecialtyBadge({ specialty }) {
  const cls = SPECIALTY_COLORS[specialty] ?? DEFAULT_COLOR;
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {specialty}
    </span>
  );
}

// ── booking modal ─────────────────────────────────────────────────────────────

function BookingModal({ doctor, onClose }) {
  if (!doctor) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* header */}
        <div className="relative p-6 text-center bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck size={26} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{doctor.name}</h3>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-0.5">{doctor.specialty}</p>
        </div>

        {/* schedule */}
        <div className="p-6">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Weekly Schedule
          </p>

          {doctor.schedule?.length > 0 ? (
            <div className="space-y-2">
              {doctor.schedule.map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{s.day}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400">
                      <Clock size={11} /> {s.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building size={11} /> {s.chamber}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
              No schedule available.
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <a
              href={`tel:${doctor.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Phone size={15} /> Call
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Doctor() {
  const { doctors = [], pagination, refresh } = useDoctors();

  const [search, setSearch]       = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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

  const specialties = [...new Set(doctors.map((d) => d.specialty))];

  const filtered = useMemo(() => {
    if (!specialty) return doctors;
    return doctors.filter((d) => d.specialty === specialty);
  }, [doctors, specialty]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* banner */}
      <PageBanner
        title="Find Doctors"
        subtitle={`${pagination?.total || filtered.length} verified specialists near you`}
        image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400&auto=format&fit=crop&q=80"
        gradient="from-primary-900/85 via-violet-900/75 to-slate-900/80"
        Icon={Stethoscope}
        badge="Healthcare Directory"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">

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
              placeholder="Search by name, specialty or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors"
            />
          </div>

          {/* specialty filter */}
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none transition-colors min-w-[170px]"
            >
              <option value="" className="bg-white dark:bg-slate-900">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </motion.div>

        {/* table */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-400 dark:text-slate-600"
            >
              <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No doctors found.</p>
            </motion.div>
          ) : (
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
                      <th className="px-5 py-3 text-left">Doctor</th>
                      <th className="px-5 py-3 text-left">Specialty</th>
                      <th className="px-5 py-3 text-left">Location</th>
                      <th className="px-5 py-3 text-left">Personal No</th>
                      <th className="px-5 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((doc, i) => (
                      <motion.tr
                        key={doc._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors"
                      >
                        {/* name + email */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shrink-0">
                              <Stethoscope size={15} className="text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">{doc.name}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <Mail size={9} /> {doc.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* specialty */}
                        <td className="px-5 py-3">
                          <SpecialtyBadge specialty={doc.specialty} />
                        </td>

                        {/* location */}
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {doc.location}
                          </span>
                        </td>

                        {/* personal number */}
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                             <Phone size={12} className="text-slate-400 shrink-0" />
                            {doc.personalNo || "—"}
                          </span>
                        </td>

                        {/* actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${doc.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                              <PhoneCall size={10} /> Call
                            </a>
                            <button
                              onClick={() => setSelectedDoctor(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                            >
                              <CalendarCheck size={10} /> Schedule
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* booking modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <BookingModal
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}