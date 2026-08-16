import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDoctors from "../../hooks/doctorhook";
import { createDoctor, updateDoctor, deleteDoctor } from "../../api/doctorApi";
import { confirmDelete, successAlert, errorAlert } from "../../utils/alert";
import fetchUser from "../../hooks/userhook";
import { toast } from "sonner";
import { hasPermission } from "../../utils/rbac";
import PaginationControls from "../components/ui/PaginationControls";

// ── Shared styles ──────────────────────────────────────────────
const inp =
  "w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors";

const EMPTY_SCHEDULE = { day: "", time: "", chamber: "" };
const EMPTY_FORM = {
  name: "",
  specialty: "",
  location: "",
  phone: "",
  email: "",
  personalNo: "",
  schedule: [],
};

// ── Sub-components ─────────────────────────────────────────────

function ScheduleEditor({ schedule, onChange }) {
  const add = () => onChange([...schedule, { ...EMPTY_SCHEDULE }]);
  const remove = (i) => onChange(schedule.filter((_, idx) => idx !== i));
  const update = (i, field, value) =>
    onChange(schedule.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Schedule
        </label>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Plus size={11} /> Add Slot
        </button>
      </div>

      {schedule.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          No schedule — click Add Slot
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 px-1">
            {["Day", "Time", "Chamber"].map((h) => (
              <span key={h} className="text-xs text-slate-400">{h}</span>
            ))}
          </div>
          {schedule.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-center">
              <input className={inp} value={s.day} onChange={(e) => update(i, "day", e.target.value)} placeholder="Monday" />
              <input className={inp} value={s.time} onChange={(e) => update(i, "time", e.target.value)} placeholder="10am–1pm" />
              <input className={inp} value={s.chamber} onChange={(e) => update(i, "chamber", e.target.value)} placeholder="Chamber 3" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function DoctorModal({ mode, form, setForm, onSave, onClose }) {
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {mode === "add" ? "Add Doctor" : "Edit Doctor"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input className={inp} value={form.name} onChange={set("name")} placeholder="Dr. Jane Smith" />
            </Field>
            <Field label="Specialty">
              <input className={inp} value={form.specialty} onChange={set("specialty")} placeholder="Cardiology" />
            </Field>
          </div>

          <Field label="Hospital / Location">
            <input className={inp} value={form.location} onChange={set("location")} placeholder="Apollo Hospital, Kolkata" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input className={inp} value={form.phone} onChange={set("phone")} placeholder="+91-9876543210" />
            </Field>
            <Field label="Email">
              <input className={inp} type="email" value={form.email} onChange={set("email")} placeholder="doctor@hospital.com" />
            </Field>
          </div>

          <Field label="Personal Number">
            <input className={inp} value={form.personalNo} onChange={set("personalNo")} placeholder="+91-XXXXXXXXXX" />
          </Field>

          <ScheduleEditor
            schedule={form.schedule}
            onChange={(schedule) => setForm((prev) => ({ ...prev, schedule }))}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} className="px-3 py-1.5 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors">
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function DoctorsPage() {
  const { profile } = fetchUser();
  const { doctors, pagination, loading, refresh } = useDoctors();
  const [localDoctors, setLocalDoctors] = useState([]);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });
  const [scheduleModal, setScheduleModal] = useState(null); // { name, schedule } | null
  
  const openScheduleModal = (doc) => {
    setScheduleModal({
      name: doc.name,
      schedule: Array.isArray(doc.schedule) ? doc.schedule : [],
    });
  };

  const closeScheduleModal = () => setScheduleModal(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    refresh(params);
  }, [params]);

  useEffect(() => {
    if (doctors) setLocalDoctors(doctors);
  }, [doctors]);

  // ── Permissions ──
  const canCreate = hasPermission(profile, "doctors.create");
  const canRead = hasPermission(profile, "doctors.read");
  const canUpdate = hasPermission(profile, "doctors.update");
  const canDelete = hasPermission(profile, "doctors.delete");

  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view doctors.
      </div>
    );
  }

  // ── Modal helpers ──
 const openAdd = () => {
  setForm({ ...EMPTY_FORM, schedule: [] });
  setEditId(null);
  setModal("add");
};
 const openEdit = (doc) => {
  setForm({
    ...doc,
    schedule: Array.isArray(doc.schedule)
      ? doc.schedule.map((s) => ({
          day: s?.day || "",
          time: s?.time || "",
          chamber: s?.chamber || "",
        }))
      : [],
  });
  setEditId(doc._id || doc.id);
  setModal("edit");
};

  const closeModal = () => setModal(null);

  // ── Save / Delete ──
  const handleSave = async () => {
  if (!form.name || !form.specialty) return;

  const payload = {
    ...form,
    schedule: (Array.isArray(form.schedule) ? form.schedule : [])
      .map((s) => ({
        day: s?.day?.trim() || "",
        time: s?.time?.trim() || "",
        chamber: s?.chamber?.trim() || "",
      }))
      .filter((s) => s.day || s.time || s.chamber),
  };

  try {
    if (modal === "add") {
      const res = await createDoctor(payload);
      toast.success(res.message);
      setLocalDoctors((prev) => [res.doctor, ...prev]);
    } else {
      const res = await updateDoctor(editId, payload);
      toast.success(res.message);
    }
    refresh(params);
    closeModal();
  } catch (error) {
    errorAlert("Failed to save doctor", error);
  }
};

  const handleDelete = async (doc) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    const id = doc._id || doc.id;
    try {
      await deleteDoctor(id);
      refresh(params);
      successAlert("Doctor deleted successfully");
    } catch (error) {
      errorAlert("Failed to delete doctor", error);
    }
  };

  // ── Render ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctors</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pagination?.total || localDoctors.length} registered
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            <Plus size={15} /> Add Doctor
          </button>
        )}
      </div>

      {/* Search */}
      <input
        className="w-full max-w-xs px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or specialty..."
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-left">
                {["Doctor", "Specialty", "Location", "Phone", "Personal No", "Schedule", (canUpdate || canDelete) && "Actions"]
                  .filter(Boolean)
                  .map((col) => (
                    <th key={col} className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {localDoctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                localDoctors.map((doc, i) => (
                  <motion.tr
                    key={doc._id || doc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Doctor name + avatar */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs shrink-0">
                          {doc.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</span>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">{doc.specialty}</span>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 max-w-[180px] truncate text-slate-500 dark:text-slate-400">
                      {doc.location || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {doc.phone || "—"}
                    </td>

                    {/* Personal Number */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {doc.personalNo || "—"}
                    </td>

                    {/* Schedule badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
  {doc.schedule?.length > 0 ? (
    <button
      type="button"
      onClick={() => openScheduleModal(doc)}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      title="View schedule"
    >
      <Calendar size={11} /> {doc.schedule.length} slot{doc.schedule.length > 1 ? "s" : ""}
    </button>
  ) : (
    <span className="text-slate-400 text-xs">—</span>
  )}
</td>

                    {/* Actions */}
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {canUpdate && (
                            <button
                              onClick={() => openEdit(doc)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        pagination={pagination}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
      />

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <DoctorModal
            mode={modal}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
  {scheduleModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeScheduleModal}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {scheduleModal.name} - Schedule
          </h2>
          <button
            onClick={closeScheduleModal}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {scheduleModal.schedule.length === 0 ? (
            <p className="text-sm text-slate-400">No schedule available.</p>
          ) : (
            <div className="space-y-2">
              {scheduleModal.schedule.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-sm text-slate-700 dark:text-slate-300">{s.day || "—"}</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{s.time || "—"}</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{s.chamber || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
}
