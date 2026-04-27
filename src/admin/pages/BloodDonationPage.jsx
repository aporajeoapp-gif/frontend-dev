import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Droplets,
  Users,
  Target,
  CheckCircle,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBloodCamp } from "../../hooks/bloodCampHook";
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

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUS_OPTIONS = ["upcoming", "ongoing", "completed", "cancelled"];

const empty = {
  campName: "",
  organizer: "",
  date: "",
  time: "",
  location: "",
  address: "",
  city: "",
  bloodGroupsNeeded: [],
  contactPhone: "",
  contactEmail: "",
  description: "",
  status: "upcoming",
  targetUnits: "",
  collectedUnits: "0",
  banner: null,
  organizationLogo: null,
};

const formatDateForInput = (d) => {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const STATUS_STYLE = {
  upcoming: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  ongoing:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  completed:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

function BloodGroupToggle({ selected, onChange }) {
  const isAll = selected.length === BLOOD_GROUPS.length;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(isAll ? [] : [...BLOOD_GROUPS])}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
          isAll
            ? "bg-primary-600 border-primary-600 text-white"
            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-400"
        }`}
      >
        All
      </button>
      {BLOOD_GROUPS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() =>
            onChange(
              selected.includes(g)
                ? selected.filter((x) => x !== g)
                : [...selected, g],
            )
          }
          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
            selected.includes(g)
              ? "bg-rose-600 border-rose-600 text-white"
              : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-rose-400"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function CampForm({ value, onChange }) {
  const [preview, setPreview] = useState(value.banner_image || null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ ...value, banner: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Banner Image">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={24} className="text-slate-400 mb-2" />
                <span className="text-xs text-slate-500">Banner</span>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
          </label>
        </Field>

        <Field label="Organization Logo">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden">
            {value.organizationLogo && typeof value.organizationLogo !== 'string' ? (
              <img src={URL.createObjectURL(value.organizationLogo)} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
            ) : value.organizationLogo && typeof value.organizationLogo === 'string' ? (
              <img src={value.organizationLogo} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={24} className="text-slate-400 mb-2" />
                <span className="text-xs text-slate-500">Logo</span>
              </div>
            )}
            <input type="file" className="hidden" onChange={(e) => onChange({ ...value, organizationLogo: e.target.files[0] })} accept="image/*" />
          </label>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Camp Name">
          <input
            className={inp}
            value={value.campName}
            onChange={(e) => onChange({ ...value, campName: e.target.value })}
            placeholder="Life Saver Blood Camp"
          />
        </Field>
        <Field label="Organizer">
          <input
            className={inp}
            value={value.organizer}
            onChange={(e) => onChange({ ...value, organizer: e.target.value })}
            placeholder="Red Cross Society"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input
            className={inp}
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </Field>
        <Field label="Time">
          <input
            className={inp}
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            placeholder="09:00 AM - 04:00 PM"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Location / Venue">
          <input
            className={inp}
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="Town Hall"
          />
        </Field>
        <Field label="City">
          <input
            className={inp}
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Kolkata"
          />
        </Field>
      </div>
      <Field label="Full Address">
        <input
          className={inp}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="1, S.N. Banerjee Road, Kolkata"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact Phone">
          <input
            className={inp}
            value={value.contactPhone}
            onChange={(e) =>
              onChange({ ...value, contactPhone: e.target.value })
            }
            placeholder="+91-9800000001"
          />
        </Field>
        <Field label="Contact Email">
          <input
            className={inp}
            type="email"
            value={value.contactEmail}
            onChange={(e) =>
              onChange({ ...value, contactEmail: e.target.value })
            }
            placeholder="camp@example.com"
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Target Units">
          <input
            className={inp}
            type="number"
            value={value.targetUnits}
            onChange={(e) =>
              onChange({ ...value, targetUnits: e.target.value })
            }
            placeholder="200"
          />
        </Field>
        <Field label="Collected Units">
          <input
            className={inp}
            type="number"
            value={value.collectedUnits}
            onChange={(e) =>
              onChange({ ...value, collectedUnits: e.target.value })
            }
            placeholder="0"
          />
        </Field>
        {value.status !== 'completed' ? (
          <Field label="Status">
            <select
              value={value.status}
              onChange={(e) => onChange({ ...value, status: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Status">
             <div className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 font-bold">
                Completed
             </div>
          </Field>
        )}
      </div>
      <Field label="Blood Groups Needed">
        <BloodGroupToggle
          selected={value.bloodGroupsNeeded}
          onChange={(v) => onChange({ ...value, bloodGroupsNeeded: v })}
        />
      </Field>
      <Field label="Description">
        <textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={3}
          placeholder="Details about the camp..."
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </Field>
    </div>
  );
}

export default function BloodDonationPage() {
  const navigate = useNavigate();
  const { camps, loading, fetchCamps, createCamp, updateCamp, deleteCamp } = useBloodCamp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const { profile } = fetchUser();

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const filtered = camps.filter(
    (c) =>
      c.campName.toLowerCase().includes(search.toLowerCase()) ||
      c.organizer.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(empty);
    setModal("add");
  };
  const openEdit = (c) => {
    setForm({ 
      ...c, 
      banner: null,
      date: formatDateForInput(c.date)
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.campName || !form.date || !form.location) return;

    let res;
    if (modal === "add") {
      res = await createCamp(form);
    } else {
      res = await updateCamp(form._id, form);
    }

    if (res.success) {
      setModal(null);
    } else {
      errorAlert(res.message);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    try {
      await deleteCamp(id);
      successAlert("Camp deleted successfully");
    } catch (error) {
      errorAlert("Failed to delete camp", error);
    }
  };

  const canCreate = hasPermission(profile, "blood.create");
  const canRead   = hasPermission(profile, "blood.read");
  const canUpdate = hasPermission(profile, "blood.update");
  const canDelete = hasPermission(profile, "blood.delete");

  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view blood donation camps.
      </div>
    );
  }

  const stats = [
    {
      label: "Total Camps",
      value: camps.length,
      Icon: Droplets,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: "Upcoming",
      value: camps.filter((c) => c.status === "upcoming").length,
      Icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Completed",
      value: camps.filter((c) => c.status === "completed").length,
      Icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Target Units",
      value: camps.reduce((s, c) => s + (Number(c.targetUnits) || 0), 0),
      Icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Blood Donation Camps
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {camps.length} camps registered
          </p>
        </div>
        {canCreate && (
          <button className={btn()} onClick={openAdd} disabled={loading}>
            <Plus size={15} /> Add Camp
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
            >
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                {value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search camps..."
          className="w-full max-w-xs px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
        />
        {loading && <div className="text-xs text-slate-500 animate-pulse">Processing...</div>}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Camp Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Collection</th>
                {(canUpdate || canDelete) && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500 italic">No camps found matching your search.</td>
                </tr>
              ) : (
                filtered.map((camp, i) => (
                  <motion.tr
                    key={camp._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/blood-donation/${camp._id}`)}
                  >
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 group-hover:border-primary-400 transition-colors">
                          {camp.banner_image ? (
                            <img src={camp.banner_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{camp.campName}</div>
                          <div className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider mt-0.5">{camp.organizer}</div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{camp.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{camp.date}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{camp.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg capitalize shadow-sm ${STATUS_STYLE[camp.status] ?? STATUS_STYLE.upcoming}`}>
                          {camp.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-1.5">
                           <span className="text-[10px] font-black text-slate-900 dark:text-white">{camp.collectedUnits}</span>
                           <span className="text-[10px] text-slate-400">/ {camp.targetUnits} units</span>
                        </div>
                        <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((camp.collectedUnits / (camp.targetUnits || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                         <div className="flex justify-end gap-1 opacity-100  transition-opacity">
                           <button
                             className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
                             onClick={() => navigate(`/admin/blood-donation/${camp._id}`)}
                             title="Add Donor"
                           >
                             <Plus size={14} />
                           </button>
                           {canUpdate && (
                             <button
                               className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors"
                               onClick={() => openEdit(camp)}
                               title="Edit"
                             >
                               <Pencil size={14} />
                             </button>
                           )}
                           {canDelete && (
                             <button
                               className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
                               onClick={() => handleDelete(camp._id)}
                               title="Delete"
                             >
                               <Trash2 size={14} />
                             </button>
                           )}
                         </div>
                      </td>
                    )}
                  </motion.tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Blood Camp" : "Edit Blood Camp"}
      >
        <CampForm value={form} onChange={setForm} />
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button className={btn("secondary")} onClick={() => setModal(null)} disabled={loading}>
            Cancel
          </button>
          <button className={btn()} onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
