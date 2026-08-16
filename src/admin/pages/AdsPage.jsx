import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAds } from "../../hooks/adsHook";
import { confirmDelete, successAlert, errorAlert } from "../../utils/alert";
import fetchUser from "../../hooks/userhook";
import { hasPermission } from "../../utils/rbac";
import PaginationControls from "../components/ui/PaginationControls";

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

const TAGS = [
  "Healthcare",
  "Pharmacy",
  "Transport",
  "Events",
  "Food",
  "Education",
  "Other",
];
const empty = {
  title: "",
  description: "",
  tag: "Other",
  image: null,
  link: "",
  cta: "Learn More",
  status: "active",
  startDate: "",
  endDate: "",
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

export default function AdsPage() {
  const { ads, pagination, loading, fetchAds, createAd, updateAd, deleteAd } = useAds();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState(null);
  const { profile } = fetchUser();
  const [search, setSearch] = useState("");
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAds(params);
  }, [fetchAds, params]);

  const openAdd = () => {
    setForm(empty);
    setPreview(null);
    setModal("add");
  };
  const openEdit = (a) => {
    setForm({ 
      ...a, 
      image: null,
      startDate: formatDateForInput(a.startDate),
      endDate: formatDateForInput(a.endDate)
    });
    setPreview(a.image);
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
    if (!form.title || !form.startDate || !form.endDate) return;

    let res;
    if (modal === "add") {
      res = await createAd(form);
    } else {
      res = await updateAd(form._id, form);
    }

    if (res.success) {
      successAlert(`Ad ${modal === "add" ? "created" : "updated"} successfully`);
      setModal(null);
    } else {
      errorAlert(res.message);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    const res = await deleteAd(id);
    if (res.success) {
      successAlert("Ad deleted successfully");
    } else {
      errorAlert(res.message);
    }
  };

  const toggleActive = async (ad) => {
    const newStatus = ad.status === "active" ? "expired" : "active";
    const res = await updateAd(ad._id, { status: newStatus });
    if (!res.success) errorAlert(res.message);
  };

  const canCreate = hasPermission(profile, "ads.create");
  const canRead   = hasPermission(profile, "ads.read");
  const canUpdate = hasPermission(profile, "ads.update");
  const canDelete = hasPermission(profile, "ads.delete");

  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view advertisements.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Advertisements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {ads.length} total ·{" "}
            {ads.filter((a) => a.status === "active").length} active
          </p>
        </div>
        {canCreate && (
          <button className={btn()} onClick={openAdd}>
            <Plus size={15} /> Add Ad
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ads..."
          className="w-full max-w-xs px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
        />
        {loading && <div className="text-xs text-slate-500 animate-pulse">Processing...</div>}
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad, i) => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-36 bg-slate-200 dark:bg-slate-800 overflow-hidden">
              {ad.image ? (
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
              <div className="absolute top-2 left-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white bg-slate-600">
                  {ad.tag}
                </span>
              </div>
              {/* <div className="absolute top-2 right-2">
                {canUpdate && (
                  <button onClick={() => toggleActive(ad)} className="text-white">
                    {ad.status === "active" ? (
                      <ToggleRight size={20} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-400" />
                    )}
                  </button>
                )}
              </div> */}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {ad.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ad.status === "active" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                >
                  {ad.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {ad.description}
              </p>
              {ad.link && (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 mt-2"
                >
                  <ExternalLink size={11} />{" "}
                  {ad.link.replace(/^https?:\/\//, "")}
                </a>
              )}
              {(canUpdate || canDelete) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {canUpdate && (
                    <button
                      className={btn("secondary") + " flex-1 justify-center"}
                      onClick={() => openEdit(ad)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={btn("ghost")}
                      onClick={() => handleDelete(ad._id)}
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

      <PaginationControls
        pagination={pagination}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
      />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Advertisement" : "Edit Advertisement"}
      >
        <div className="space-y-4">
          <Field label="Title">
            <input
              className={inp}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Hospital Promotion"
            />
          </Field>
          <Field label="Description">
            <textarea
              className={inp + " resize-none"}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Ad description..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tag">
              <select
                className={inp}
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              >
                {TAGS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="CTA Text">
              <input
                className={inp}
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                placeholder="Learn More"
              />
            </Field>
          </div>
          <Field label="Ad Image">
            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500">Upload Ad Image</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </Field>
          <Field label="Redirect Link (Optional)">
            <input
              className={inp}
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://example.com"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                className={inp}
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Field>
            <Field label="End Date">
              <input
                className={inp}
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              className={inp}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
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
