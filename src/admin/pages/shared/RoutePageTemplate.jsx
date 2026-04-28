import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";
import Table from "../../components/ui/Table";
import { confirmDelete, errorAlert, successAlert } from "../../../utils/alert";
import { toast } from "sonner";

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

const empty = {
  busName: "",
  ferryName: "",
  routeName: ["", ""],
  timings: [{ departure: "", arrival: "" }],
  stops: "",
  fare: "",
};

const columns = [

  {
    key: "routeName",
    label: "Route",
    render: (v) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {Array.isArray(v) ? v.join(" ↔ ") : v}
      </span>
    ),
  },
  {
    key: "stops",
    label: "Stops",
    render: (v) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {Array.isArray(v) ? v.join(" → ") : v}
      </span>
    ),
  },
  {
    key: "timings",
    label: "Next Timing",
    render: (v) => (
      <div className="flex flex-col gap-1">
        {Array.isArray(v) && v.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              {v[0].departure}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{v[0].arrival}</span>
            {v.length > 1 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                +{v.length - 1} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400">N/A</span>
        )}
      </div>
    ),
  },
  { key: "fare", label: "Fare", render: (v) => `₹${v}` },
];

export default function RoutePageTemplate({
  title,
  data,
  loading: externalLoading,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  placeholder = {},
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  const [routes, setRoutes] = useState(data ?? []);
  const [prevData, setPrevData] = useState(data);

  // Sync prop to state without effect to avoid cascading renders
  if (data !== prevData) {
    setPrevData(data);
    setRoutes(data || []);
  }

  const [internalLoading, setInternalLoading] = useState(!data);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const loading = externalLoading ?? internalLoading;

  useEffect(() => {
    if (!data && fetchFn) {
      fetchFn()
        .then((res) => res && setRoutes(res))
        .catch(console.error)
        .finally(() => setInternalLoading(false));
    }
  }, [data, fetchFn]);

  const openAdd = () => {
    setForm(empty);
    setModal("add");
  };
const formatTime = (timeStr) => {
  if (!timeStr) return "";

  
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = String(Number(hours) + 12);
  }
  if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};
  const openEdit = (r) => {
  setForm({
    ...r,
    routeName: Array.isArray(r.routeName)
      ? r.routeName
      : [r.routeName || "", ""],

    stops: Array.isArray(r.stops)
      ? r.stops.join(", ")
      : r.stops || "",

    timings:
      Array.isArray(r.timings) && r.timings.length > 0
        ? r.timings.map((t) => ({
            departure: formatTime(t.departure),
            arrival: formatTime(t.arrival),
          }))
        : [{ departure: "", arrival: "" }],
  });

  setModal("edit");
};

  const handleSave = async () => {
    if (!form.routeName[0] || !form.routeName[1]) {
      errorAlert("Please fill in both Start and End points");
      return;
    }

    const payload = {
      ...form,
      // Fix: Map routeNumber to ferryNumber for backend if it's a Ferry Route
      ferryNumber: title === "Ferry Route" ? form.routeNumber : undefined,
      routeName: form.routeName.filter(Boolean),
      stops:
        typeof form.stops === "string"
          ? form.stops
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : form.stops,
      fare: Number(form.fare),
      timings: form.timings.filter((t) => t.departure && t.arrival),
    };

    try {
      if (modal === "add") {
        const res = await createFn(payload);
        toast.success(res.message)
        const created = res.bus || res.ferry || res;
        setRoutes((prev) => [created, ...prev]);
        // successAlert(`${title} created successfully`);
      } else {
        const res = await updateFn(form._id || form.id, payload);
        toast.success(res.message)
        const updated = res.bus || res.ferry || res;
        setRoutes((prev) =>
          prev.map((r) =>
            (r._id || r.id) === (form._id || form.id) ? updated : r,
          ),
        );
        // successAlert(`${title} updated successfully`);
      }
      setModal(null);
    } catch (err) {
      console.error(err);
      errorAlert(err.response?.data?.message || `Failed to save ${title}`);
    }
  };

  const handleTimingChange = (index, field, value) => {
    const newTimings = [...form.timings];
    newTimings[index][field] = value;
    setForm({ ...form, timings: newTimings });
  };

  const addTiming = () => {
    setForm({
      ...form,
      timings: [...form.timings, { departure: "", arrival: "" }],
    });
  };

  const removeTiming = (index) => {
    if (form.timings.length <= 1) return;
    setForm({
      ...form,
      timings: form.timings.filter((_, i) => i !== index),
    });
  };

  const handleDelete = async (row) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    try {
      await deleteFn(row._id || row.id);
      setRoutes((prev) =>
        prev.filter((r) => (r._id || r.id) !== (row._id || row.id)),
      );
      successAlert(`${title} deleted successfully`);
    } catch (err) {
      console.error(err);
      errorAlert(err.response?.data?.message || `Failed to delete ${title}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}s
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {routes.length} routes registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fetchFn && (
            <button
              className={btn("secondary")}
              onClick={fetchFn}
              title={`Refresh ${title}s`}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
          {canCreate && (
            <button className={btn()} onClick={openAdd}>
              <Plus size={15} /> Add Route
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={routes}
              searchKeys={["routeName"]}
              actions={(row) => (
                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <button
                      className={btn("ghost")}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={btn("ghost")}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={`${modal === "add" ? "Add New" : "Edit"} ${title}`}
      >
        <div className="space-y-5 pb-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label={title === "Bus Route" ? "Bus Name" : "Ferry Name"}>
              <input
                className={inp}
                value={title === "Bus Route" ? form.busName : form.ferryName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [title === "Bus Route" ? "busName" : "ferryName"]:
                      e.target.value,
                  })
                }
                placeholder="Name (Optional)"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="From (Start Point)">
              <input
                className={inp}
                value={form.routeName[0] || ""}
                onChange={(e) => {
                  const newRoute = [...form.routeName];
                  newRoute[0] = e.target.value;
                  setForm({ ...form, routeName: newRoute });
                }}
                placeholder="e.g. Shyampur"
              />
            </Field>
            <Field label="To (End Point)">
              <input
                className={inp}
                value={form.routeName[1] || ""}
                onChange={(e) => {
                  const newRoute = [...form.routeName];
                  newRoute[1] = e.target.value;
                  setForm({ ...form, routeName: newRoute });
                }}
                placeholder="e.g. Howrah Station"
              />
            </Field>
          </div>

          <Field label="Intermediate Stops (comma separated)">
            <input
              className={inp}
              value={
                Array.isArray(form.stops) ? form.stops.join(", ") : form.stops
              }
              onChange={(e) => setForm({ ...form, stops: e.target.value })}
              placeholder={placeholder.stops}
            />
          </Field>

          <Field label="Fare (₹)">
            <input
              className={inp}
              type="number"
              value={form.fare}
              onChange={(e) => setForm({ ...form, fare: e.target.value })}
              placeholder="e.g. 45"
            />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Timings
              </label>
              <button
                type="button"
                onClick={addTiming}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus size={12} /> Add More
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {form.timings.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block mb-1">
                        DEPARTURE
                      </span>
                      <input
                        className={inp}
                        type="time"
                        value={t.departure}
                        onChange={(e) =>
                          handleTimingChange(i, "departure", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block mb-1">
                        ARRIVAL
                      </span>
                      <input
                        className={inp}
                        type="time"
                        value={t.arrival}
                        onChange={(e) =>
                          handleTimingChange(i, "arrival", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {form.timings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTiming(i)}
                      className="mt-5 p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button className={btn("secondary")} onClick={() => setModal(null)}>
            Cancel
          </button>
          <button className={btn()} onClick={handleSave}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}