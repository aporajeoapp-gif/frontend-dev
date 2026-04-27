import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Phone, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  createEmergencyServices,
  updateEmergencyService,
  deleteEmergencyService,
} from "../../api/emergencyApi";
import useEmergencyServices from "../../hooks/emergencyHook";
import { confirmDelete, successAlert, errorAlert } from "../../utils/alert";
import fetchUser from "../../hooks/userhook";
import { hasPermission } from "../../utils/rbac";

const inp =
  "w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors";

const btn = (v = "primary") =>
  ({
    primary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors",
    secondary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors",
    ghost:
      "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors",
  })[v];

const CATEGORIES = ["Ambulance", "Fire", "Police", "Hospital", "Other"];

const categoryColors = {
  Ambulance: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
  Fire: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
  Police: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  Hospital: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  Other: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

const empty = {
  serviceName: "",
  category: "Ambulance",
  address: "",
  contactPhone: "",
  location: { lat: "", lng: "" },
};

export default function EmergencyPage() {
  const { emergencies } = useEmergencyServices();
  const { profile } = fetchUser();
  const [localList, setLocalList] = useState([]);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (emergencies) setLocalList(emergencies);
  }, [emergencies]);

  const canCreate = hasPermission(profile, "emergency.create");
  const canRead = hasPermission(profile, "emergency.read");
  const canUpdate = hasPermission(profile, "emergency.update");
  const canDelete = hasPermission(profile, "emergency.delete");

  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setModal("add");
  };

  const openEdit = (s) => {
    setForm({
      ...s,
      contactPhone: Array.isArray(s.contactPhone) ? s.contactPhone.join(", ") : "",
      location: { lat: s.location?.lat ?? "", lng: s.location?.lng ?? "" },
    });
    setEditId(s._id || s.id);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.serviceName || !form.contactPhone) return;

    const payload = {
      ...form,
      contactPhone: form.contactPhone.split(",").map((p) => p.trim()).filter(Boolean),
      location:
        form.location.lat && form.location.lng
          ? { lat: Number(form.location.lat), lng: Number(form.location.lng) }
          : undefined,
    };

    try {
      if (modal === "add") {
        const res = await createEmergencyServices(payload);
        const created = res?.data?.service ?? res?.data ?? { ...payload, _id: String(Date.now()) };
        setLocalList((prev) => [created, ...prev]);
      } else {
        const res = await updateEmergencyService(editId, payload);
        const updated = res?.data?.service ?? res?.data ?? { ...payload, _id: editId };
        setLocalList((prev) => prev.map((s) => (s._id || s.id) === editId ? updated : s));
      }
      setModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (ES) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    const id = ES._id || ES.id;
    try {
      await deleteEmergencyService(id);
      setLocalList((prev) => prev.filter((s) => (s._id || s.id) !== id));
      successAlert("Service deleted successfully");
    } catch (err) {
      errorAlert("Failed to delete service");
    }
  };
if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view emergency page.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{localList.length} services</p>
        </div>
        {canCreate && (
          <button className={btn()} onClick={openAdd}>
            <Plus size={15} /> Add Service
          </button>
        )}
      </div>

      {/* Cards */}
      {canRead && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localList.map((ES, i) => {
            const id = ES._id || ES.id;
            const phones = Array.isArray(ES.contactPhone) ? ES.contactPhone : [];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[ES.category] ?? categoryColors.Other}`}>
                    {ES.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{ES.serviceName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{ES.address}</p>
                {ES.creatorName && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Added by <span className="font-medium">{ES.creatorName}</span>
                  </p>
                )}
                <div className="flex flex-col gap-1 mt-3">
                  {phones.map((ph) => (
                    <a key={ph} href={`tel:${ph}`} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-700 transition cursor-pointer">
                      <Phone size={13} className="text-primary-500" />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{ph}</span>
                    </a>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {canUpdate && (
                    <button className={btn("secondary") + " flex-1 justify-center"} onClick={() => openEdit(ES)}>
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <button className={btn("ghost")} onClick={() => handleDelete(ES)}>
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {!!modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {modal === "add" ? "Add Emergency Service" : "Edit Service"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Service Name</label>
                  <input className={inp} value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} placeholder="City Police HQ" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Category</label>
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Address</label>
                <input className={inp} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, Kolkata" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Contact Phones <span className="text-slate-400">(comma-separated)</span></label>
                <input className={inp} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="100, 033-22143526" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Latitude <span className="text-slate-400">(optional)</span></label>
                  <input className={inp} type="number" value={form.location.lat} onChange={(e) => setForm({ ...form, location: { ...form.location, lat: e.target.value } })} placeholder="22.5726" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Longitude <span className="text-slate-400">(optional)</span></label>
                  <input className={inp} type="number" value={form.location.lng} onChange={(e) => setForm({ ...form, location: { ...form.location, lng: e.target.value } })} placeholder="88.3639" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className={btn("secondary")} onClick={() => setModal(null)}>Cancel</button>
                <button className={btn()} onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}