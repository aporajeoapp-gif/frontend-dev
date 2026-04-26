import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, MapPin, Clock, X, Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useEvents } from "../../hooks/eventHook";
import { confirmDelete, successAlert, errorAlert } from "../../utils/alert";
import fetchUser from "../../hooks/userhook";

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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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

const CATEGORIES = [
  "Health",
  "Sports",
  "Culture",
  "Environment",
  "Technology",
  "Business",
  "Food",
  "Art",
  "Music",
  "Other",
];
const empty = {
  title: "",
  date: "",
  time: "",
  location: "",
  organizer: "",
  description: "",
  category: "Other",
  status: "upcoming",
  image: null,
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

const categoryColors = {
  Health:
    "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  Sports: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  Culture:
    "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  Environment:
    "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300",
  Technology:
    "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300",
  Business:
    "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  Food: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
  Art: "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300",
  Music: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  Other: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export default function EventsPage() {
  const { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
const { profile } = fetchUser();
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(empty);
    setPreview(null);
    setModal("add");
  };
  const openEdit = (e) => {
    setForm({ 
      ...e, 
      image: null,
      date: formatDateForInput(e.date)
    });
    setPreview(e.image);
    setModal("edit");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return;

    let res;
    if (modal === "add") {
      res = await createEvent(form);
    } else {
      res = await updateEvent(form._id, form);
    }

    if (res.success) {
      successAlert(`Event ${modal === "add" ? "created" : "updated"} successfully`);
      setModal(null);
    } else {
      errorAlert(res.message);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    const res = await deleteEvent(id);
    if (res.success) {
      successAlert("Event deleted successfully");
    } else {
      errorAlert(res.message);
    }
  };
  const isAdmin = profile?.role === "admin";
  const isMember = profile?.role === "member";
  const perms = Array.isArray(profile?.permissions) ? profile.permissions : [];
  const hasPerm = (key) => isAdmin || perms.includes(key);
  const canCreate = !isMember && hasPerm("events.create");
  const canRead   = hasPerm("events.read");
  const canUpdate = !isMember && hasPerm("events.update");
  const canDelete = !isMember && hasPerm("events.delete");

  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view events.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Events
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {events.length} events
          </p>
        </div>
        {canCreate && (
          <button className={btn()} onClick={openAdd}>
            <Plus size={15} /> Add Event
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full max-w-xs px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
        />
        {loading && <div className="text-xs text-slate-500 animate-pulse">Processing...</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ev, i) => (
          <motion.div
            key={ev._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-32 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              {ev.image ? (
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 capitalize">
                  {ev.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                  {ev.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${categoryColors[ev.category] ?? categoryColors.Other}`}
                >
                  {ev.category}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={11} />
                  <span>
  {new Date(ev.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}
</span>
                  <Clock size={11} className="ml-1" />
                  <span>{ev.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={11} />
                  <span className="truncate">{ev.location}</span>
                </div>
              </div>
              {(canUpdate || canDelete) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {canUpdate && (
                    <button
                      className={btn("secondary") + " flex-1 justify-center"}
                      onClick={() => openEdit(ev)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={btn("ghost")}
                      onClick={() => handleDelete(ev._id)}
                    >
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Event" : "Edit Event"}
      >
        <div className="space-y-4">
          <Field label="Event Title">
            <input
              className={inp}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Community Health Camp"
            />
          </Field>
          <Field label="Organizer">
            <input
              className={inp}
              value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              placeholder="Aporajeo Foundation"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input
                className={inp}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Time">
              <input
                className={inp}
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              className={inp}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Eco Park, Kolkata"
            />
          </Field>
          <Field label="Category">
            <select
              className={inp}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Event Image">
            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500">Upload Event Image</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </Field>
          <Field label="Status">
            <select
              className={inp}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea
              className={inp + " resize-none"}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Event description..."
            />
          </Field>
        </div>
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
