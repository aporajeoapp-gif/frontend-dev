import { motion } from "framer-motion";
import {
  Users, Stethoscope, Bus, Ship, AlertTriangle,
  CheckCircle, Info, Clock, TrendingUp, Shield,
  Activity, Database,
} from "lucide-react";
import fetchUser from "../../hooks/userhook";
import useAnalytics from "../../hooks/analyticsHook";

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function timeSince(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    indigo: "bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400",
    cyan:   "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400",
    violet: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
    rose:   "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    amber:  "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`p-1.5 rounded-lg ${colors[color] ?? colors.indigo}`}>
          <Icon size={14} />
        </span>
      </div>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
      {children}
    </h2>
  );
}

function Avatar({ name, role }) {
  const roleColor = {
    super_admin: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
    admin:       "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
    coordinator: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    member:      "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400",
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${roleColor[role] ?? roleColor.member}`}>
      {initials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    super_admin: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
    admin:       "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
    coordinator: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
    member:      "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[role] ?? map.member}`}>
      {role}
    </span>
  );
}

function AlertItem({ type, message }) {
  const styles = {
    error:   { wrap: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",   text: "text-red-700 dark:text-red-300",    Icon: AlertTriangle, iconClass: "text-red-500" },
    warning: { wrap: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", Icon: AlertTriangle, iconClass: "text-amber-500" },
    info:    { wrap: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",  text: "text-blue-700 dark:text-blue-300",   Icon: Info,          iconClass: "text-blue-500" },
    success: { wrap: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", Icon: CheckCircle, iconClass: "text-emerald-500" },
  };
  const s = styles[type];
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${s.wrap}`}>
      <s.Icon size={13} className={`mt-0.5 flex-shrink-0 ${s.iconClass}`} />
      <p className={s.text} dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  );
}

function PermBar({ module, count, max }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-right text-slate-500 dark:text-slate-400 truncate">{module}</span>
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />
      </div>
      <span className="w-4 text-slate-700 dark:text-slate-300 font-medium">{count}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { profile } = fetchUser();
  const { stats, loading } = useAnalytics();
  console.log(stats)

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  const { users, doctors, buses, ferries, emergencies, alerts } = stats;

  const roles = users.roles;
  const permEntries = users.permissionsByModule || [];
  const maxPerm = permEntries[0]?.count ?? 1;

  const fade = (i) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Welcome back, {profile?.name?.split(" ")[0]}. Here's what's happening.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total users",     value: users.total,       icon: Users,       color: "indigo", sub: `${roles.super_admin ?? 0} super · ${roles.admin ?? 0} admin · ${roles.coordinator ?? 0} coord` },
          { label: "Doctors",         value: doctors.total,     icon: Stethoscope, color: "cyan",   sub: `Avg exp ${doctors.avgExperience} yrs` },
          { label: "Bus routes",      value: buses.total,       icon: Bus,         color: "violet", sub: `Avg fare ₹${buses.avgFare}` },
          { label: "Ferry routes",    value: ferries.total,     icon: Ship,        color: "rose",   sub: ferries.sampleName ?? "—" },
          { label: "Emergencies",     value: emergencies.total, icon: Activity,    color: "amber",  sub: emergencies.sampleCategory ?? "—" },
        ].map((s, i) => (
          <motion.div key={s.label} {...fade(i)}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── Enrollment timeline + Last active ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment timeline */}
        <motion.div {...fade(5)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <SectionTitle>Enrollment timeline</SectionTitle>
          <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-4">
            {users.enrollmentTimeline.map((u, i) => (
              <li key={u._id} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-primary-400 dark:bg-primary-500" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                  <RoleBadge role={u.role} />
                  <span className="text-xs text-slate-400 ml-auto">{fmtDate(u.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">#{i + 1} enrolled · {u.email}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Last active */}
        <motion.div {...fade(6)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <SectionTitle>Last Update</SectionTitle>
          <div className="space-y-3">
            {users.lastActive.map((u) => {
              const updated = u.updatedAt !== u.createdAt;
              return (
                <div key={u._id} className="flex items-center gap-3">
                  <Avatar name={u.name} role={u.role} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                  </div>
                  {updated ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <Clock size={10} /> {timeSince(u.updatedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Never updated</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Permissions + Bus analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Permissions by module */}
        <motion.div {...fade(7)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <SectionTitle>Permissions by module</SectionTitle>
          <div className="space-y-2.5 mb-5">
            {permEntries.map((entry) => (
              <PermBar key={entry._id} module={entry._id} count={entry.count} max={maxPerm} />
            ))}
          </div>
          <SectionTitle>User permission count</SectionTitle>
          <div className="space-y-2">
            {users.userPermissionCount.map((u) => {
              const count = u.permCount;
              const isWild = u.isWildcard;
              const isBad  = u.hasMalformed;
              return (
                <div key={u._id} className="flex items-center gap-2">
                  <Avatar name={u.name} role={u.role} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{u.name}</span>
                  {isWild && <span className="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Wildcard *</span>}
                  {isBad  && <span className="text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">⚠ Malformed</span>}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-14 text-right">{count} perms</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bus analysis */}
        <motion.div {...fade(8)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
          <div>
            <SectionTitle>Bus routes · Fare comparison</SectionTitle>
            <div className="space-y-2">
              {buses.list.map((b) => {
                const maxF = buses.fareComparison.max;
                const pct  = Math.round((b.fare / maxF) * 100);
                const color = b.fare <= 20 ? "bg-emerald-500" : b.fare <= 50 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={b._id} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-mono text-slate-500 dark:text-slate-400">{b.routeNumber}</span>
                    <span className="w-36 text-slate-600 dark:text-slate-400 truncate">{b.routeName?.[0] ?? "Unnamed"}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.2 }} />
                    </div>
                    <span className="w-10 text-right font-semibold text-slate-700 dark:text-slate-300">₹{b.fare}</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Min ₹{buses.fareComparison.min}</span>
                <span>Avg ₹{buses.avgFare}</span>
                <span>Max ₹{buses.fareComparison.max}</span>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>Created by</SectionTitle>
            <div className="space-y-2">
              {buses.operators.map((op) => (
                <div key={op.name} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 text-slate-600 dark:text-slate-400">{op.name}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(op.count, 5) }).map((_, i) => (
                      <span key={i} className="w-5 h-5 rounded bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                        <Bus size={10} className="text-primary-500" />
                      </span>
                    ))}
                    {op.count > 5 && <span className="text-[10px] text-slate-400">+{op.count - 5}</span>}
                  </div>
                  <span className="w-12 text-right text-slate-500 dark:text-slate-400">{op.count} route{op.count > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>Doctors</SectionTitle>
            <div className="space-y-2">
              {doctors.list.slice(0, 5).map((d) => (
                <div key={d._id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950/50 flex items-center justify-center flex-shrink-0">
                    <Stethoscope size={10} className="text-cyan-500" />
                  </span>
                  <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium truncate">{d.name}</span>
                  <span className="text-slate-400">{d.specialty}</span>
                  <span className="text-slate-400">{d.experience} yrs</span>
                  <span className="text-slate-400 hidden sm:block">{timeSince(d.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Data quality alerts ── */}
      <motion.div {...fade(9)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionTitle>Data quality &amp; system alerts</SectionTitle>
        <div className="space-y-2">
          {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
        </div>
      </motion.div>
    </div>
  );
}