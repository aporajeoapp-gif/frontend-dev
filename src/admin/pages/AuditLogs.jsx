import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  Activity, 
  ShieldAlert, 
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRightCircle,
  LogsIcon
} from "lucide-react";
import { toast } from "sonner";
import { getAllLogs } from "../../api/auditlogsApi";
import Table from "../components/ui/Table";

const btn = (v = "primary") =>
  ({
    primary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors",
    secondary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors",
    ghost:
      "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors",
  })[v];

const SEVERITY_CONFIG = {
  low: {
    icon: CheckCircle2,
    cls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  },
  medium: {
    icon: AlertTriangle,
    cls: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  },
  high: {
    icon: ShieldAlert,
    cls: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  },
};

const SeverityBadge = ({ value }) => {
  const cfg = SEVERITY_CONFIG[(value ?? "").toLowerCase()] ?? SEVERITY_CONFIG.medium;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.cls}`}>
      <Icon size={11} /> {value}
    </span>
  );
};

function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
console.log(logs)
  async function fetchlogs() {
    setLoading(true);
    try {
      const response = await getAllLogs();
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchlogs();
  }, []);

  const columns = [
    {
      key: "createdAt",
      label: "Timestamp",
      render: (v) => {
        const d = new Date(v);
        return (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <CalendarDays size={13} className="text-primary-500 shrink-0" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase">
                {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "userName",
      label: "Performer",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0 border border-slate-200 dark:border-slate-700">
            {v?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{v}</p>
            <p className="text-[11px] text-slate-400 font-medium">{row.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 font-mono tracking-tight lowercase">
          <Activity size={10} /> {v}
        </span>
      ),
    },
    {
      key: "task",
      label: "Task & Entity",
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{v}</p>
          <div className="flex items-center gap-1 mt-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.entityModel}</span>
             <span className="text-[10px] text-slate-300 dark:text-slate-600">|</span>
             <span className="text-[10px] font-mono text-slate-500">{row.entityId?.slice(-6)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (v) => <SeverityBadge value={v} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track all administrative actions on the platform</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Fetching logs...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={logs}
            searchKeys={["userName", "task", "details", "action", "userEmail"]}
            actions={(row) => (
              <button
                className={btn("ghost")}
                onClick={() => navigate(`/admin/analytics/auditlogs/${row._id || row.id}`)}
                title="Explore detailed log"
              >
                <span className="text-xs font-bold mr-1">Explore</span>
                <ArrowRightCircle size={15} />
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
