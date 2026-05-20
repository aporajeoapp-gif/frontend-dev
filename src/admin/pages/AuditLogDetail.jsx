import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  History,
  AlertCircle,
  ShieldAlert,
  Activity,
  CalendarDays,
  User,
  Monitor,
  Globe,
  Plus,
  Minus,
  Equal,
} from "lucide-react";
import { toast } from "sonner";
import { getLogById } from "../../api/auditlogsApi";
import { extractApiErrorMessage } from "../../utils/alert";

const SEVERITY_CONFIG = {
  low: {
    cls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    label: "Low Impact",
  },
  medium: {
    cls: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    label: "Medium Impact",
  },
  high: {
    cls: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    label: "High Security Risk",
  },
};

/* ── Format a single value for display ── */
function formatVal(val) {
  if (val === null || val === undefined)
    return <span className="italic text-slate-400">null</span>;
  if (typeof val === "boolean")
    return (
      <span className={val ? "text-emerald-500" : "text-rose-500"}>
        {String(val)}
      </span>
    );
  if (Array.isArray(val)) {
    if (val.length === 0)
      return <span className="text-slate-400 italic">[ empty ]</span>;
    return (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {val.map((v, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300"
          >
            {String(v)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof val === "object")
    return (
      <span className="text-slate-400 italic text-xs">{"{ object }"}</span>
    );
  // truncate long strings like passwords/hashes
  const str = String(val);
  if (str.startsWith("$2b$") || str.startsWith("$2a$"))
    return (
      <span className="font-mono text-xs text-slate-400 italic">
        [ hashed ]
      </span>
    );
  if (str.length > 60)
    return (
      <span className="font-mono text-xs break-all">{str.slice(0, 60)}…</span>
    );
  return <span className="font-mono text-xs break-all">{str}</span>;
}

/* ── Diff renderer ── */
function DiffTable({ before, after }) {
  if (!before && !after)
    return (
      <p className="text-slate-400 italic text-sm p-4">No data available</p>
    );

  const allKeys = [
    ...new Set([...Object.keys(before || {}), ...Object.keys(after || {})]),
  ].filter((k) => !["__v"].includes(k)); // skip mongo internals

  const rows = allKeys.map((key) => {
    const bVal = before?.[key];
    const aVal = after?.[key];
    const bStr = JSON.stringify(bVal);
    const aStr = JSON.stringify(aVal);
    const changed = bStr !== aStr;
    const added = bVal === undefined && aVal !== undefined;
    const removed = bVal !== undefined && aVal === undefined;
    return { key, bVal, aVal, changed, added, removed };
  });

  const changed = rows.filter((r) => r.changed);
  const unchanged = rows.filter((r) => !r.changed);

  return (
    <div className="space-y-4">
      {/* Changed fields */}
      {changed.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{" "}
            Changed Fields ({changed.length})
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[140px_1fr_1fr] bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Field
              </div>
              <div className="px-3 py-2 text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Minus size={10} /> Before
              </div>
              <div className="px-3 py-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Plus size={10} /> After
              </div>
            </div>
            {changed.map(({ key, bVal, aVal, added, removed }, i) => (
              <div
                key={key}
                className={`grid grid-cols-[140px_1fr_1fr] ${i < changed.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
              >
                <div className="px-3 py-3 flex items-start">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                    {key}
                  </span>
                </div>
                <div
                  className={`px-3 py-3 border-l border-slate-100 dark:border-slate-800 ${!added ? "bg-rose-50/40 dark:bg-rose-950/10" : ""}`}
                >
                  {added ? (
                    <span className="text-[10px] italic text-slate-400">
                      — not set —
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400">
                      {formatVal(bVal)}
                    </span>
                  )}
                </div>
                <div
                  className={`px-3 py-3 border-l border-slate-100 dark:border-slate-800 ${!removed ? "bg-emerald-50/40 dark:bg-emerald-950/10" : ""}`}
                >
                  {removed ? (
                    <span className="text-[10px] italic text-slate-400">
                      — removed —
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatVal(aVal)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unchanged fields (collapsed) */}
      {unchanged.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 select-none list-none">
            <Equal size={10} className="text-slate-300" />
            Unchanged Fields ({unchanged.length}) — click to expand
          </summary>
          <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="grid grid-cols-[140px_1fr] bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Field
              </div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Value
              </div>
            </div>
            {unchanged.map(({ key, bVal }, i) => (
              <div
                key={key}
                className={`grid grid-cols-[140px_1fr] ${i < unchanged.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
              >
                <div className="px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {key}
                  </span>
                </div>
                <div className="px-3 py-2.5 border-l border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  {formatVal(bVal)}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default function AuditLogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      try {
        const response = await getLogById(id);
        if (response.success) {
          setLog(response.data);
        } else {
          toast.error("Audit log not found");
        }
      } catch (error) {
        toast.error(extractApiErrorMessage(error, "Failed to fetch log details"));
      } finally {
        setLoading(false);
      }
    }
    fetchLog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium italic">
          Loading security analysis...
        </p>
      </div>
    );
  }

  if (!log) return null;

  const severityCfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.medium;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-500 hover:border-primary-200 dark:hover:border-primary-800 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Log Analysis
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                ID: {log._id}
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Detailed inspection of administrative event
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${severityCfg.cls}`}
        >
          <ShieldAlert size={18} />
          <span className="text-sm font-bold uppercase tracking-wide">
            {severityCfg.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={16} className="text-primary-500" />
                Performer Metadata
              </h3>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary-500/20">
                  {log.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {log.userName}
                  </h4>
                  <p className="text-xs font-medium text-slate-400">
                    {log.userEmail}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded border border-slate-200 dark:border-slate-700">
                    {log.userRole}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-2 font-semibold text-[10px] tracking-wider uppercase">
                    <CalendarDays size={14} className="text-slate-300" /> Date
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(log.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-2 font-semibold text-[10px] tracking-wider uppercase">
                    <Activity size={14} className="text-slate-300" /> Time
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono italic">
                    {new Date(log.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-2 font-semibold text-[10px] tracking-wider uppercase">
                    <Globe size={14} className="text-slate-300" /> IP Address
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold underline decoration-primary-500 underline-offset-4">
                    {log.ipAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Monitor size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                User Agent Profile
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium">
              {log.userAgent}
            </p>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <History size={120} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />{" "}
                Activity Summary
              </h3>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 italic">
                {log.task}
              </h2>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 font-mono tracking-tighter shadow-sm">
                  {log.action}
                </span>
                <span className="px-3 py-1 bg-white dark:bg-slate-900 text-[11px] font-bold text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200 dark:border-primary-800 shadow-sm">
                  ENTITY: {log.entityModel}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-slate-400" />
                Data Changes
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <Minus size={10} className="text-rose-500" />
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    Before
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <Plus size={10} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    After
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <DiffTable
                before={log.payload?.oldData}
                after={log.payload?.newData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
