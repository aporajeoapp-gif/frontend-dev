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
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { getAllLogs, getAuditActions, exportAuditLogsCsv } from "../../api/auditlogsApi";
import Table from "../components/ui/Table";
import { extractApiErrorMessage } from "../../utils/alert";

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
  const [exporting, setExporting] = useState(false);
  const [actions, setActions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  async function fetchlogs(currentPage = 1, currentFilters = filters) {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      };

      if (currentFilters.search.trim()) params.search = currentFilters.search.trim();
      if (currentFilters.action.trim()) params.action = currentFilters.action.trim();
      if (currentFilters.startDate) params.startDate = currentFilters.startDate;
      if (currentFilters.endDate) params.endDate = currentFilters.endDate;

      const response = await getAllLogs(params);
      if (response.success) {
        setLogs(response.data);
        setPagination(response.pagination || { page: 1, pages: 1, total: response.data?.length || 0, limit: 10 });
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to fetch logs"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchlogs(1, filters);
    fetchActionOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchActionOptions() {
    try {
      const response = await getAuditActions();
      if (response.success) {
        setActions(response.data || []);
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to fetch action options"));
    }
  }

  const applyFilters = () => fetchlogs(1, filters);
  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.action.trim()) params.action = filters.action.trim();
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const blob = await exportAuditLogsCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const datePart = new Date().toISOString().slice(0, 10);
      a.download = `audit-logs-${datePart}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to export CSV"));
    } finally {
      setExporting(false);
    }
  };
  const resetFilters = () => {
    const initial = {
      search: "",
      action: "",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortOrder: "desc",
    };
    setFilters(initial);
    fetchlogs(1, initial);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
          <input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search user/task/details..."
            className="lg:col-span-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          />
          <select
            value={filters.action}
            onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          >
            <option value="">All Actions</option>
            {actions.map((actionName) => (
              <option key={actionName} value={actionName}>
                {actionName}
              </option>
            ))}
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="action">Sort by Action</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <div className="flex gap-2">
            <button className={btn("primary")} onClick={applyFilters}>Apply</button>
            <button className={btn("secondary")} onClick={resetFilters}>Reset</button>
            
          </div>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent focus:border-primary-400 outline-none"
          />
          <button className={btn("secondary")} onClick={handleExportCsv} disabled={exporting}>
            <Download size={15}/>  {exporting ? "Exporting..." : "Export CSV"}
            </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Fetching logs...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={logs}
              searchKeys={[]}
              pageSize={10}
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
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{pagination.total} total logs</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchlogs(pagination.page - 1, filters)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {pagination.page} / {Math.max(pagination.pages, 1)}
                </span>
                <button
                  onClick={() => fetchlogs(pagination.page + 1, filters)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
