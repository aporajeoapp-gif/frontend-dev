import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, MapPin, Phone, Mail,
  Search, PhoneCall, CalendarCheck, X, Clock, Building,
  SlidersHorizontal, ChevronDown, Eye,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import useDoctors from "../hooks/doctorhook";
import useDebouncedValue from "../hooks/useDebouncedValue";
import PaginationControls from "../admin/components/ui/PaginationControls";
import { DOCTOR_SPECIALTIES } from "../constants/doctorSpecialties";

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
          {(doctor.degree || doctor.experience != null) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {[doctor.degree, doctor.experience != null ? `${doctor.experience} yrs experience` : ""].filter(Boolean).join(" | ")}
            </p>
          )}
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

function DetailsModal({ doctor, onClose }) {
  if (!doctor) return null;

  const rows = [
    ["Full Name", doctor.name],
    ["Specialty", doctor.specialty],
    ["Degree", doctor.degree || "N/A"],
    ["Experience", doctor.experience != null ? `${doctor.experience} years` : "N/A"],
    ["Hospital / Medical Shop Name", doctor.location || "N/A"],
    ["Medical Shop Address", doctor.medicalShopLocation?.address || "N/A"],
    ["Phone", doctor.phone || "N/A"],
    ["Alternate Phone", doctor.alternatePhone || "N/A"],
    ["Email", doctor.email || "N/A"],
  ];

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
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{doctor.name}</h3>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{doctor.specialty}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 break-words">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Weekly Schedule</p>
            {doctor.schedule?.length > 0 ? (
              <div className="space-y-2">
                {doctor.schedule.map((slot, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                    <span>{slot.day || "N/A"}</span>
                    <span>{slot.time || "N/A"}</span>
                    <span>{slot.chamber || "N/A"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No schedule available.</p>
            )}
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
  const [detailsDoctor, setDetailsDoctor] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setParams(p => ({ ...p, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    refresh(params);
  }, [params]);

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
              {DOCTOR_SPECIALTIES.map((s) => (
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
              className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Doctor</th>
                      <th className="px-5 py-3 text-left">Specialty</th>
                      <th className="px-5 py-3 text-left">Medical Shop Name</th>
                      <th className="px-5 py-3 text-left">Medical Shop Address</th>
                      <th className="px-5 py-3 text-left">Alternate No</th>
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
                              {(doc.degree || doc.experience != null) && <p className="text-[11px] text-slate-500">{[doc.degree, doc.experience != null ? `${doc.experience} yrs` : ""].filter(Boolean).join(" | ")}</p>}
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

                        {/* medical shop name */}
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {doc.location}
                          </span>
                        </td>

                        {/* medical shop address */}
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Building size={12} className="text-slate-400 shrink-0" />
                            {doc.medicalShopLocation?.address || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                             <Phone size={12} className="text-slate-400 shrink-0" />
                            {doc.alternatePhone || "—"}
                          </span>
                        </td>

                        {/* actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailsDoctor(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title="View details"
                            >
                              <Eye size={10} /> Details
                            </button>
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

        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-5 md:hidden"
          >
            {filtered.map((doc, i) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-500 to-violet-500" />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shrink-0 shadow-md">
                      <Stethoscope size={22} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white break-words">{doc.name}</h3>
                      <div className="mt-1">
                        <SpecialtyBadge specialty={doc.specialty} />
                      </div>
                      {(doc.degree || doc.experience != null) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {[doc.degree, doc.experience != null ? `${doc.experience} yrs` : ""].filter(Boolean).join(" | ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                      <span className="break-words">{doc.location || "N/A"}</span>
                    </p>
                    <p className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <Building size={14} className="mt-0.5 text-slate-400 shrink-0" />
                      <span className="break-words">{doc.medicalShopLocation?.address || "N/A"}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span>{doc.alternatePhone || "N/A"}</span>
                    </p>
                    {doc.email && (
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="break-all">{doc.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDetailsDoctor(doc)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Eye size={13} /> Details
                    </button>
                    <a
                      href={`tel:${doc.phone}`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-2 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      <PhoneCall size={13} /> Call
                    </a>
                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary-50 dark:bg-primary-900/30 px-2 py-2 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <CalendarCheck size={13} /> Schedule
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8">
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>

      {/* booking modal */}
      <AnimatePresence>
        {detailsDoctor && (
          <DetailsModal
            doctor={detailsDoctor}
            onClose={() => setDetailsDoctor(null)}
          />
        )}
      </AnimatePresence>

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



