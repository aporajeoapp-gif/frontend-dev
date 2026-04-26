import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Target,
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  X,
  Clock,
  Download,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { useBloodCamp } from "../../hooks/bloodCampHook";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { confirmDelete, successAlert, errorAlert } from "../../utils/alert";
import { useAuth } from "../../context/AuthContext";

const inp =
  "w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors";

const btn = (v = "primary") =>
  ({
    primary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors",
    secondary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors",
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

function DonorForm({ value, onChange }) {
  return (
    <div className="space-y-4">
      <Field label="Donor Name">
        <input
          className={inp}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="John Doe"
        />
      </Field>
      <Field label="Father's Name">
        <input
          className={inp}
          value={value.fatherName}
          onChange={(e) => onChange({ ...value, fatherName: e.target.value })}
          placeholder="Mr. Doe"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Blood Group">
          <select
            value={value.bloodGroup}
            onChange={(e) => onChange({ ...value, bloodGroup: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Group</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Age">
          <input
            className={inp}
            type="number"
            value={value.age}
            onChange={(e) => onChange({ ...value, age: e.target.value })}
            placeholder="25"
          />
        </Field>
      </div>
      <Field label="Phone Number">
        <input
          className={inp}
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="+91-9800000000"
        />
      </Field>
      <Field label="Donation Date">
        <input
          className={inp}
          type="date"
          value={value.donatedAt}
          onChange={(e) => onChange({ ...value, donatedAt: e.target.value })}
        />
      </Field>
    </div>
  );
}

export default function AdminBloodCampDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: generator } = useAuth();
  const { fetchCampById, addDonor, fetchDonors, removeDonor, confirmDonorApproval, updateCamp, loading } = useBloodCamp();
  const [camp, setCamp] = useState(null);
  const [donors, setDonors] = useState([]);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: "",
    fatherName: "",
    bloodGroup: "",
    age: "",
    phone: "",
    donatedAt: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    const campRes = await fetchCampById(id);
    if (campRes.success) {
      setCamp(campRes.data);
    } else {
      errorAlert(campRes.message);
      navigate("/admin/blood-donation");
    }

    const donorRes = await fetchDonors(id);
    if (donorRes.success) {
      setDonors(donorRes.data);
    }
  }, [id, fetchCampById, fetchDonors, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddDonor = async () => {
    if (!donorForm.name || !donorForm.fatherName || !donorForm.bloodGroup || !donorForm.phone || !donorForm.age) {
      errorAlert("Please fill all donor fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addDonor({ ...donorForm, campId: id });
      if (res.success) {
        successAlert("Donor added successfully");
        setModal(null);
        loadData();
        setDonorForm({
          name: "",
          fatherName: "",
          bloodGroup: "",
          age: "",
          phone: "",
          donatedAt: new Date().toISOString().split("T")[0],
        });
      } else {
        errorAlert(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDonor = async (donorId) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    const res = await removeDonor(donorId);
    if (res.success) {
      successAlert("Donor removed successfully");
      loadData();
    } else {
      errorAlert(res.message);
    }
  };

  const handleApproveDonor = async (donorId) => {
    setSubmitting(true);
    try {
      const res = await confirmDonorApproval(donorId);
      if (res.success) {
        successAlert("Donor approved and added to collection");
        loadData();
      } else {
        errorAlert(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!camp) return;
    const newStatus = !camp.isPublished;
    setSubmitting(true);
    try {
      const res = await updateCamp(id, { isPublished: newStatus });
      if (res.success) {
        successAlert(`Camp ${newStatus ? "published" : "unpublished"} successfully`);
        setCamp({ ...camp, isPublished: newStatus });
      } else {
        errorAlert(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!camp || donors.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to add logos
    const addImage = (url, x, y, w, h) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            // Using auto-detection or more compatible format
            const format = url.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
            doc.addImage(img, format, x, y, w, h);
          } catch (e) {
            console.error("PDF Logo Error:", e);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Pre-load Logos
    const [campLogo, apoLogo] = await Promise.all([
      camp.organizationLogo ? addImageToData(camp.organizationLogo) : Promise.resolve(null),
      addImageToData("/logo.png")
    ]);

    // Helper for pre-loading images as data
    async function addImageToData(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }

    // TOP Logos (Side by Side)
    if (apoLogo) {
      doc.addImage(apoLogo, 'PNG', 14, 10, 40, 16); // Top Left
    }
    if (campLogo) {
      doc.addImage(campLogo, 'JPEG', pageWidth - 54, 10, 40, 16); // Top Right
    }

    // Header title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("BLOOD DONATION CAMP REPORT", pageWidth / 2, 35, { align: "center" });

    // Collection Statistics Summary Bar
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, 45, pageWidth - 28, 20, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL DONORS", 25, 52);
    doc.text("TARGET UNITS", pageWidth / 2, 52, { align: "center" });
    doc.text("COLLECTED", pageWidth - 25, 52, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`${donors.length}`, 25, 60);
    doc.text(`${camp.targetUnits}`, pageWidth / 2, 60, { align: "center" });
    doc.text(`${camp.collectedUnits} UNITS`, pageWidth - 25, 60, { align: "right" });

    // Info Grid Setup
    const drawSection = (x, y, title, items) => {
        doc.setFontSize(10);
        doc.setTextColor(225, 29, 72);
        doc.setFont("helvetica", "bold");
        doc.text(title, x, y);
        doc.setDrawColor(225, 29, 72);
        doc.setLineWidth(0.5);
        doc.line(x, y + 2, x + 25, y + 2);

        let currentY = y + 10;
        items.forEach(item => {
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(item.label, x, currentY);
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text(String(item.value), x, currentY + 5);
            currentY += 12;
        });
    };

    drawSection(35, 80, "EVENT OVERVIEW", [
        { label: "CAMP NAME", value: camp.campName },
        { label: "VENUE", value: `${camp.location}, ${camp.city}` },
        { label: "SCHEDULE", value: new Date(camp.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' }) }
    ]);

    drawSection(pageWidth / 2 + 15, 80, "ORGANIZER DETAILS", [
        { label: "ORGANIZATION", value: camp.organizer },
        { label: "HELPLINE", value: camp.contactPhone || "—" },
        { label: "EMAIL", value: camp.contactEmail || "—" }
    ]);

    const tableColumn = ["#", "DONOR NAME", "FATHER'S NAME", "BLOOD GROUP", "AGE", "PHONE", "STATUS"];
    const tableRows = donors.map((d, i) => [
      i + 1,
      d.name.toUpperCase(),
      (d.fatherName || "—").toUpperCase(),
      d.bloodGroup,
      d.age,
      d.phone,
      ({ approved: 'DONATED', pending: 'PENDING', rejected: 'REJECTED' }[d.status] || d.status).toUpperCase(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 130,
      theme: 'striped',
      headStyles: { 
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255], 
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        padding: 4
      },
      alternateRowStyles: { 
        fillColor: [255, 241, 242]
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { fontStyle: 'bold', textColor: [225, 29, 72], halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center', fontStyle: 'bold' }
      },
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Footer Metadata (Bottom Right)
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, pageHeight - 14, { align: "right" });
        doc.text(`Executor: ${generator?.name || "Aporajeo System"}`, pageWidth - 14, pageHeight - 10, { align: "right" });
        
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }
    });

    const fileName = `Report_${camp.campName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  if (!camp && loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading camp details...</div>
      </div>
    );
  }

  if (!camp) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/blood-donation")}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {camp.campName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage donors and donation records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camp Details Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
              {camp.banner_image ? (
                <img
                  src={camp.banner_image}
                  alt={camp.campName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Camp Details
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Calendar size={14} className="text-primary-500" />
                    <span>
                      {camp.date} · {camp.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Target size={14} className="text-rose-500" />
                    <span>
                      {camp.collectedUnits} / {camp.targetUnits} units collected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Phone size={14} className="text-emerald-500" />
                    <span>{camp.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Globe size={14} className={camp.isPublished ? "text-primary-500" : "text-slate-400"} />
                    <span className="font-medium">
                      Status: {camp.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  className={`${btn(camp.isPublished ? "secondary" : "primary")} w-full justify-center`}
                  onClick={handleTogglePublish}
                  disabled={submitting}
                >
                  {camp.isPublished ? (
                    <><EyeOff size={16} /> Unpublish</>
                  ) : (
                    <><Eye size={16} /> Publish Now</>
                  )}
                </button>
                <button
                  className={btn("primary") + " w-full justify-center"}
                  onClick={() => setModal("addDonor")}
                >
                  <UserPlus size={16} /> Add Donor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Donors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-primary-500" />
                Donors List ({donors.length})
              </h2>
              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Download size={14} /> Export PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Father's Name
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {donors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        No donors registered for this camp yet.
                      </td>
                    </tr>
                  ) : (
                    donors.map((donor) => (
                      <tr
                        key={donor._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {donor.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {donor.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {donor.fatherName || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            {donor.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {donor.age}
                        </td>
                        <td className="px-6 py-4">
                          {donor.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                              <CheckCircle size={10} /> Approved
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {donor.donatedAt
                            ? new Date(donor.donatedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {donor.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveDonor(donor._id)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                              >
                                {submitting ? "..." : <><CheckCircle size={12} /> Approve</>}
                              </button>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-700">
                                <CheckCircle size={14} />
                              </div>
                            )}
                            <button
                              onClick={() => handleDeleteDonor(donor._id)}
                              title="Delete Record"
                              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modal === "addDonor"}
        onClose={() => setModal(null)}
        title="Register New Donor"
      >
        <DonorForm value={donorForm} onChange={setDonorForm} />
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            className={btn("secondary")}
            onClick={() => setModal(null)}
          >
            Cancel
          </button>
          <button
            className={btn()}
            onClick={handleAddDonor}
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register Donor"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
