import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";
import Table from "../../components/ui/Table";
import PaginationControls from "../../components/ui/PaginationControls";
import { confirmDelete, errorAlert, successAlert } from "../../../utils/alert";
import { toast } from "sonner";

const inputClass =
"w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors";

const buttonClass = (variant = "primary") =>
  ({
    primary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors",
    secondary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors",
    ghost:
      "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors",
  })[variant];

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

const emptyTiming = { departure: "", arrival: "" };
const emptyIntermediateStop = { stopName: "", time: "" };

const emptyForm = {
  busName: "",
  ferryName: "",
  routeNumber: "",
  routeName: ["", ""],
  timings: [{ ...emptyTiming }],
  departureStopageTime: "",
  arrivalStopageTime: "",
  intermediateStops: [{ ...emptyIntermediateStop }],
  stops: "",
  fare: "",
};

const normalizeTimeInput = (value) => {
  if (!value) return "";
  const text = String(value).trim();
  const [timePart, modifierRaw] = text.split(/\s+/);
  const [hours = "", minutes = ""] = String(timePart || "").split(":");
  if (!hours || !minutes) return text;

  let normalizedHours = Number(hours);
  const modifier = modifierRaw?.toUpperCase();
  if (modifier === "PM" && normalizedHours !== 12) normalizedHours += 12;
  if (modifier === "AM" && normalizedHours === 12) normalizedHours = 0;

  return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const normalizeIntermediateStops = (stops) => {
  if (!Array.isArray(stops) || stops.length === 0) {
    return [{ ...emptyIntermediateStop }];
  }

  return stops
    .map((stop) => ({
      stopName: String(stop?.stopName || stop?.name || "").trim(),
      time: String(stop?.time || "").trim(),
    }))
    .filter((stop) => stop.stopName);
};

const formatCurrency = (value) => `Rs. ${value ?? 0}`;

const ferryColumns = [
  {
    key: "routeName",
    label: "Route",
    render: (value) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {Array.isArray(value) ? value.join(" -> ") : value}
      </span>
    ),
  },
  {
    key: "stops",
    label: "Stops",
    render: (value) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {Array.isArray(value) ? value.join(" -> ") : value}
      </span>
    ),
  },
  {
    key: "timings",
    label: "Next Timing",
    render: (value) => {
      const firstTiming = Array.isArray(value) ? value[0] : null;
      if (!firstTiming) return <span className="text-slate-400">N/A</span>;
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-primary-600 dark:text-primary-400 font-semibold">
            {firstTiming.departure || "N/A"}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{firstTiming.arrival || "N/A"}</span>
        </div>
      );
    },
  },
  {
    key: "fare",
    label: "Fare",
    render: (value) => formatCurrency(value),
  },
];

const busColumns = [
  {
    key: "routeName",
    label: "Route",
    render: (value, row) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {Array.isArray(value) ? value.join(" -> ") : value}
        </span>
        {row.busName && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {row.busName}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "departureStopageTime",
    label: "Departure Stopage",
    render: (value, row) => value || row.timings?.[0]?.departure || "N/A",
  },
  {
    key: "arrivalStopageTime",
    label: "Arrival Stopage",
    render: (value, row) => value || row.timings?.[0]?.arrival || "N/A",
  },
  {
    key: "intermediateStops",
    label: "Intermediate Stops",
    render: (value) => (
      <div className="flex flex-wrap gap-1">
        {Array.isArray(value) && value.length > 0 ? (
          value.map((stop, index) => (
            <span
              key={`${stop.stopName}-${index}`}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {stop.stopName}
              {stop.time ? ` · ${stop.time}` : ""}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">N/A</span>
        )}
      </div>
    ),
  },
  {
    key: "fare",
    label: "Fare",
    render: (value) => formatCurrency(value),
  },
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
  const isBusRoute = title === "Bus Route";
  const tableColumns = isBusRoute ? busColumns : ferryColumns;

  const [routes, setRoutes] = useState(data?.data ?? data ?? []);
  const [pagination, setPagination] = useState(data?.pagination ?? null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: "" });
  const [internalLoading, setInternalLoading] = useState(!data);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!fetchFn) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalLoading(true);

    fetchFn(params)
      .then((res) => {
        if (cancelled) return;
        if (res?.data !== undefined && res?.pagination !== undefined) {
          setRoutes(res.data);
          setPagination(res.pagination);
        } else {
          setRoutes(res || []);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setInternalLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn, params]);

  const loading = externalLoading ?? internalLoading;

  const resetForm = () => setForm(emptyForm);

  const openAdd = () => {
    resetForm();
    setModal("add");
  };

  const openEdit = (route) => {
    const routeName = Array.isArray(route.routeName)
      ? route.routeName
      : [route.routeName || "", ""];
    const normalizedIntermediateStops = normalizeIntermediateStops(route.intermediateStops);

    setForm({
      ...emptyForm,
      ...route,
      routeName,
      stops: Array.isArray(route.stops) ? route.stops.join(", ") : route.stops || "",
      timings:
        Array.isArray(route.timings) && route.timings.length > 0
          ? route.timings.map((timing) => ({
              departure: normalizeTimeInput(timing.departure),
              arrival: normalizeTimeInput(timing.arrival),
            }))
          : [{ ...emptyTiming }],
      routeNumber: route.routeNumber || "",
      departureStopageTime: normalizeTimeInput(
        route.departureStopageTime || route.timings?.[0]?.departure || "",
      ),
      arrivalStopageTime: normalizeTimeInput(
        route.arrivalStopageTime || route.timings?.[0]?.arrival || "",
      ),
      intermediateStops: normalizedIntermediateStops.map((stop) => ({
        stopName: stop.stopName,
        time: normalizeTimeInput(stop.time),
      })),
    });
    setModal("edit");
  };

  const handleTimingChange = (index, field, value) => {
    setForm((current) => {
      const next = [...current.timings];
      next[index] = { ...(next[index] || emptyTiming), [field]: value };
      return { ...current, timings: next };
    });
  };

  const addTiming = () => {
    setForm((current) => ({
      ...current,
      timings: [...current.timings, { ...emptyTiming }],
    }));
  };

  const removeTiming = (index) => {
    setForm((current) => {
      if (current.timings.length <= 1) return current;
      return {
        ...current,
        timings: current.timings.filter((_, timingIndex) => timingIndex !== index),
      };
    });
  };

  const addIntermediateStop = () => {
    setForm((current) => ({
      ...current,
      intermediateStops: [...current.intermediateStops, { ...emptyIntermediateStop }],
    }));
  };

  const updateIntermediateStop = (index, field, value) => {
    setForm((current) => {
      const next = [...current.intermediateStops];
      next[index] = { ...(next[index] || emptyIntermediateStop), [field]: value };
      return { ...current, intermediateStops: next };
    });
  };

  const removeIntermediateStop = (index) => {
    setForm((current) => {
      const next = current.intermediateStops.filter((_, stopIndex) => stopIndex !== index);
      return {
        ...current,
        intermediateStops: next.length > 0 ? next : [{ ...emptyIntermediateStop }],
      };
    });
  };

  const buildPayload = () => {
    const routeName = Array.isArray(form.routeName)
      ? form.routeName.map((part) => String(part || "").trim())
      : [String(form.routeName || "").trim(), ""];

    const cleanedRouteName = routeName.filter(Boolean);
    const cleanedIntermediateStops = (form.intermediateStops || [])
      .map((stop) => ({
        stopName: String(stop?.stopName || "").trim(),
        time: String(stop?.time || "").trim(),
      }))
      .filter((stop) => stop.stopName);

    const cleanedStops = isBusRoute
      ? cleanedIntermediateStops.map((stop) => stop.stopName)
      : typeof form.stops === "string"
        ? form.stops
            .split(",")
            .map((stop) => stop.trim())
            .filter(Boolean)
        : Array.isArray(form.stops)
          ? form.stops
          : [];

    return {
      ...form,
      routeName: cleanedRouteName,
      fare: Number(form.fare),
      stops: cleanedStops,
      timings: isBusRoute
        ? [
            {
              departure: form.departureStopageTime || "",
              arrival: form.arrivalStopageTime || "",
            },
          ].filter((timing) => timing.departure || timing.arrival)
        : form.timings
            .map((timing) => ({
              departure: String(timing.departure || "").trim(),
              arrival: String(timing.arrival || "").trim(),
            }))
            .filter((timing) => timing.departure && timing.arrival),
      departureStopageTime: isBusRoute ? form.departureStopageTime || "" : undefined,
      arrivalStopageTime: isBusRoute ? form.arrivalStopageTime || "" : undefined,
      intermediateStops: isBusRoute ? cleanedIntermediateStops : undefined,
      busName: isBusRoute ? String(form.busName || "").trim() : undefined,
      ferryName: !isBusRoute ? String(form.ferryName || "").trim() : undefined,
      routeNumber: !isBusRoute ? String(form.routeNumber || "").trim() : undefined,
    };
  };

  const handleSave = async () => {
    if (!form.routeName[0] || !form.routeName[1]) {
      errorAlert("Please fill in both Start and End points");
      return;
    }

    const payload = buildPayload();

    try {
      if (modal === "add") {
        const res = await createFn(payload);
        toast.success(res?.message || `${title} created successfully`);
        const created = res?.bus || res?.ferry || res;
        setRoutes((current) => [created, ...current]);
      } else {
        const res = await updateFn(form._id || form.id, payload);
        toast.success(res?.message || `${title} updated successfully`);
        const updated = res?.bus || res?.ferry || res;
        setRoutes((current) =>
          current.map((route) =>
            (route._id || route.id) === (form._id || form.id) ? updated : route,
          ),
        );
      }
      setModal(null);
    } catch (err) {
      console.error(err);
      errorAlert(err.response?.data?.message || `Failed to save ${title}`);
    }
  };

  const handleDelete = async (route) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    try {
      await deleteFn(route._id || route.id);
      setRoutes((current) =>
        current.filter((item) => (item._id || item.id) !== (route._id || route.id)),
      );
      successAlert(`${title} deleted successfully`);
    } catch (err) {
      console.error(err);
      errorAlert(err.response?.data?.message || `Failed to delete ${title}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
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
              className={buttonClass("secondary")}
              onClick={() => fetchFn(params)}
              title={`Refresh ${title}s`}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
          {canCreate && (
            <button className={buttonClass()} onClick={openAdd}>
              <Plus size={15} /> Add Route
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
          </div>
        ) : (
          <Table
            columns={tableColumns}
            data={routes}
            serverSide
            pagination={pagination}
            searchValue={params.search}
            onSearch={(value) => setParams((current) => ({ ...current, search: value, page: 1 }))}
            onPageChange={(page) => setParams((current) => ({ ...current, page }))}
            showPagination={false}
            actions={(route) => (
              <div className="flex items-center gap-1">
                {canUpdate && (
                  <button className={buttonClass("ghost")} onClick={() => openEdit(route)}>
                    <Pencil size={14} />
                  </button>
                )}
                {canDelete && (
                  <button className={buttonClass("ghost")} onClick={() => handleDelete(route)}>
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                )}
              </div>
            )}
          />
        )}

        {!loading && pagination?.totalPages > 1 && (
          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          />
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={`${modal === "add" ? "Add New" : "Edit"} ${title}`}
      >
        <div className="space-y-5 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={isBusRoute ? "Bus Name" : "Ferry Name"}>
              <input
                className={inputClass}
                value={isBusRoute ? form.busName : form.ferryName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [isBusRoute ? "busName" : "ferryName"]: e.target.value,
                  })
                }
                placeholder="Name (Optional)"
              />
            </Field>

            {!isBusRoute && (
              <Field label="Route Number">
                <input
                  className={inputClass}
                  value={form.routeNumber || ""}
                  onChange={(e) => setForm({ ...form, routeNumber: e.target.value })}
                  placeholder={placeholder.routeNumber || "e.g. F1"}
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="From (Start Point)">
              <input
                className={inputClass}
                value={form.routeName[0] || ""}
                onChange={(e) => {
                  const next = [...form.routeName];
                  next[0] = e.target.value;
                  setForm({ ...form, routeName: next });
                }}
                placeholder="e.g. Shyampur"
              />
            </Field>
            <Field label="To (End Point)">
              <input
                className={inputClass}
                value={form.routeName[1] || ""}
                onChange={(e) => {
                  const next = [...form.routeName];
                  next[1] = e.target.value;
                  setForm({ ...form, routeName: next });
                }}
                placeholder="e.g. Howrah Station"
              />
            </Field>
          </div>

          {isBusRoute ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Departure Stopage Time">
                  <input
                    className={inputClass}
                    type="time"
                    value={form.departureStopageTime || ""}
                    onChange={(e) =>
                      setForm({ ...form, departureStopageTime: e.target.value })
                    }
                  />
                </Field>
                <Field label="Arrival Stopage Time">
                  <input
                    className={inputClass}
                    type="time"
                    value={form.arrivalStopageTime || ""}
                    onChange={(e) =>
                      setForm({ ...form, arrivalStopageTime: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Intermediate Stops
                  </label>
                  <button
                    type="button"
                    onClick={addIntermediateStop}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Stop
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {(form.intermediateStops || []).map((stop, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <Field label={`Stop ${index + 1}`}>
                        <input
                          className={inputClass}
                          value={stop.stopName || ""}
                          onChange={(e) =>
                            updateIntermediateStop(index, "stopName", e.target.value)
                          }
                          placeholder="Stop name"
                        />
                      </Field>
                      <Field label="Time">
                        <input
                          className={inputClass}
                          type="time"
                          value={stop.time || ""}
                          onChange={(e) =>
                            updateIntermediateStop(index, "time", e.target.value)
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeIntermediateStop(index)}
                        className="md:mb-1 p-2 text-slate-400 hover:text-red-500 transition-colors"
                        disabled={(form.intermediateStops || []).length <= 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <Field label="Intermediate Stops (comma separated)">
                <input
                  className={inputClass}
                  value={Array.isArray(form.stops) ? form.stops.join(", ") : form.stops}
                  onChange={(e) => setForm({ ...form, stops: e.target.value })}
                  placeholder={placeholder.stops || "Stop A, Stop B"}
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
                  {form.timings.map((timing, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 block mb-1">
                            DEPARTURE
                          </span>
                          <input
                            className={inputClass}
                            type="time"
                            value={timing.departure}
                            onChange={(e) =>
                              handleTimingChange(index, "departure", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 block mb-1">
                            ARRIVAL
                          </span>
                          <input
                            className={inputClass}
                            type="time"
                            value={timing.arrival}
                            onChange={(e) =>
                              handleTimingChange(index, "arrival", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      {form.timings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTiming(index)}
                          className="mt-5 p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Field label="Fare (Rs.)">
            <input
              className={inputClass}
              type="number"
              value={form.fare}
              onChange={(e) => setForm({ ...form, fare: e.target.value })}
              placeholder="e.g. 45"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button className={buttonClass("secondary")} onClick={() => setModal(null)}>
            Cancel
          </button>
          <button className={buttonClass()} onClick={handleSave}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

