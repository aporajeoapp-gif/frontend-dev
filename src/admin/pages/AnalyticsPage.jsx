import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Users,
  Bus,
  Stethoscope,
  Ship,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  MapPin,
  Clock,
  BadgeCheck,
  UserX,
  Flame,
  Siren,
  HeartPulse,
  Anchor,
  Route,
  Wallet,
  CalendarDays,
  BarChart3,
  Radar as RadarIcon,
} from "lucide-react";
import useAnalytics from "../../hooks/analyticsHook";
import { Outlet, useLocation } from "react-router-dom";

// ── Palette ───────────────────────────────────────────────────
const C = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  orange: "#f97316",
  teal: "#14b8a6",
  pink: "#ec4899",
  lime: "#84cc16",
};
const PIE = Object.values(C);

// ── Tooltip ───────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-xl text-xs min-w-[120px]">
      {label && (
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 border-b border-slate-100 dark:border-slate-700 pb-1">
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color || p.fill }}
          />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div
        className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300"
        style={{ background: color }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-3"
        style={{ background: bg }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">
        {label}
      </p>
      {sub && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
      )}
    </motion.div>
  );
}

// ── Mini KPI ──────────────────────────────────────────────────
function MiniKPI({ icon: Icon, label, value, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Insight pill ──────────────────────────────────────────────
function Insight({ icon: Icon, text, color = "indigo" }) {
  const map = {
    indigo:
      "bg-indigo-50  dark:bg-indigo-950/30  text-indigo-700  dark:text-indigo-300",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
    amber:
      "bg-amber-50   dark:bg-amber-950/30   text-amber-700   dark:text-amber-300",
    rose: "bg-rose-50    dark:bg-rose-950/30    text-rose-700    dark:text-rose-300",
    sky: "bg-sky-50     dark:bg-sky-950/30     text-sky-700     dark:text-sky-300",
    violet:
      "bg-violet-50  dark:bg-violet-950/30  text-violet-700  dark:text-violet-300",
  };
  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${map[color] || map.indigo}`}
    >
      <Icon size={13} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ── Chart card ────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = C.indigo,
  delay,
  children,
  wide,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 24 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        {Icon && <Icon size={14} style={{ color: iconColor }} />}
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </p>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
          {subtitle}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

// ── Section header ────────────────────────────────────────────
function Section({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-2.5 mt-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: color + "22" }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h2>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

const AXIS = { fontSize: 11, fill: "#94a3b8" };
const GRID = { stroke: "#e2e8f0", strokeDasharray: "3 3" };

// ════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { stats, loading } = useAnalytics();
  const location = useLocation();
  const isChildRoute = location.pathname !== "/admin/analytics";

  if (isChildRoute) return <Outlet />;

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  const { global, users, buses, doctors, ferries, emergencies } = stats;

  return (
    <div className="space-y-7 pb-10">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Live platform intelligence — all figures calculated from real
            backend data
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <Activity size={11} />
          Live
        </div>
      </motion.div>

      {/* ── Primary stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.total}
          sub={`${users.active} active`}
          color={C.indigo}
          bg="#eef2ff"
          delay={0.05}
        />
        <StatCard
          icon={Bus}
          label="Bus Routes"
          value={buses.total}
          sub={`${buses.totalStops} total stops`}
          color={C.emerald}
          bg="#ecfdf5"
          delay={0.08}
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={doctors.total}
          sub={`${doctors.scheduled} with schedule`}
          color={C.amber}
          bg="#fffbeb"
          delay={0.11}
        />
        <StatCard
          icon={Ship}
          label="Ferry Routes"
          value={ferries.total}
          sub={`Avg fare ₹${ferries.avgFare}`}
          color={C.sky}
          bg="#e0f2fe"
          delay={0.14}
        />
        <StatCard
          icon={AlertTriangle}
          label="Emergencies"
          value={emergencies.total}
          sub={`${emergencies.totalContacts} contacts`}
          color={C.rose}
          bg="#fff1f2"
          delay={0.17}
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKPI
          icon={BadgeCheck}
          label="Email Verified"
          value={users.verified}
          color={C.emerald}
          bg="#ecfdf5"
          delay={0.2}
        />
        <MiniKPI
          icon={Wallet}
          label="Avg Bus Fare"
          value={`₹${buses.avgFare}`}
          color={C.amber}
          bg="#fffbeb"
          delay={0.22}
        />
        <MiniKPI
          icon={HeartPulse}
          label="Avg Doc Exp"
          value={`${doctors.avgExperience} yrs`}
          color={C.violet}
          bg="#f5f3ff"
          delay={0.24}
        />
        <MiniKPI
          icon={Clock}
          label="Total Timings"
          value={buses.totalTimings}
          color={C.sky}
          bg="#e0f2fe"
          delay={0.26}
        />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Platform Overview
      ══════════════════════════════════════════════ */}
      <Section icon={BarChart3} title="Platform Overview" color={C.indigo} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Multi-series area */}
        <ChartCard
          title="Registrations Over Time"
          subtitle="All entity types grouped by creation date"
          icon={CalendarDays}
          iconColor={C.indigo}
          delay={0.28}
          wide
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={global.timeline}>
              <defs>
                {[
                  [C.indigo, "u"],
                  [C.emerald, "b"],
                  [C.amber, "d"],
                  [C.sky, "f"],
                ].map(([col, id]) => (
                  <linearGradient
                    key={id}
                    id={`g${id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={col} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={col} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="date"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="Users"
                stroke={C.indigo}
                fill="url(#gu)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Buses"
                stroke={C.emerald}
                fill="url(#gb)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Doctors"
                stroke={C.amber}
                fill="url(#gd)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Ferries"
                stroke={C.sky}
                fill="url(#gf)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar */}
        <ChartCard
          title="Platform Balance Radar"
          subtitle="Relative size of each data category"
          icon={RadarIcon}
          iconColor={C.violet}
          delay={0.31}
        >
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={global.radar} cx="50%" cy="50%" outerRadius={85}>
              <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <PolarRadiusAxis
                angle={30}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
              />
              <Radar
                name="Count"
                dataKey="A"
                stroke={C.violet}
                fill={C.violet}
                fillOpacity={0.22}
                strokeWidth={2}
              />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Users
      ══════════════════════════════════════════════ */}
      <Section icon={Users} title="User Analytics" color={C.indigo} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Role pie */}
        <ChartCard
          title="Role Distribution"
          subtitle="Admin · Coordinator · Member"
          icon={Shield}
          iconColor={C.indigo}
          delay={0.33}
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={users.roleChart}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {users.roleChart.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} />
                ))}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Permission buckets */}
        <ChartCard
          title="Permission Coverage"
          subtitle="How many permissions each user holds"
          icon={Shield}
          iconColor={C.violet}
          delay={0.35}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={users.permBuckets}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Users"
                fill={C.violet}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Role vs avg perms */}
        <ChartCard
          title="Avg Permissions by Role"
          subtitle="Mean valid permissions per role group"
          icon={Users}
          iconColor={C.sky}
          delay={0.37}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={users.rolePermAvg}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="avgPerms"
                name="Avg Perms"
                fill={C.sky}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="count"
                name="Users"
                fill={C.indigo}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Insight
          icon={BadgeCheck}
          text={`${users.verified}/${users.total} emails verified (${users.total ? ((users.verified / users.total) * 100).toFixed(0) : 0}%)`}
          color="emerald"
        />
        <Insight
          icon={Activity}
          text={`${users.active} active accounts out of ${users.total} total`}
          color="indigo"
        />
        <Insight
          icon={UserX}
          text={`${users.total - users.active} inactive account${users.total - users.active !== 1 ? "s" : ""} found`}
          color="rose"
        />
        <Insight
          icon={Shield}
          text={`${users.roles.admin || 0} admin${users.roles.admin !== 1 ? "s" : ""} managing the platform`}
          color="violet"
        />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Bus Routes
      ══════════════════════════════════════════════ */}
      <Section icon={Bus} title="Bus Route Analytics" color={C.emerald} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Operator routes */}
        <ChartCard
          title="Routes per Operator"
          subtitle="Number of routes per bus company"
          icon={Route}
          iconColor={C.emerald}
          delay={0.4}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buses.operators}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Routes"
                fill={C.emerald}
                radius={[4, 4, 0, 0]}
              >
                {buses.operators.map((_, i) => (
                  <Cell key={i} fill={[C.emerald, C.teal, C.lime][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fare histogram */}
        <ChartCard
          title="Fare Distribution"
          subtitle="Routes grouped by fare bracket"
          icon={Wallet}
          iconColor={C.amber}
          delay={0.43}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buses.fareBuckets}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Routes"
                fill={C.amber}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Timings per route */}
        <ChartCard
          title="Timings per Route"
          subtitle="Departure/arrival slots per bus route number"
          icon={Clock}
          iconColor={C.sky}
          delay={0.46}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buses.timingsByRoute}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Timings"
                fill={C.sky}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter: stops vs fare */}
        <ChartCard
          title="Stops vs Fare (Bus)"
          subtitle="Does more stops mean higher fare?"
          icon={MapPin}
          iconColor={C.orange}
          delay={0.49}
        >
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid {...GRID} />
              <XAxis
                type="number"
                dataKey="stops"
                name="Stops"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Stops",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />
              <YAxis
                type="number"
                dataKey="fare"
                name="Fare (₹)"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis range={[60, 200]} />
              <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={buses.stopsVsFare}
                fill={C.orange}
                fillOpacity={0.72}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Insight
          icon={Bus}
          text={`Average ${(buses.totalStops / buses.total || 0).toFixed(1)} stops per bus route`}
          color="emerald"
        />
        <Insight
          icon={Wallet}
          text={`Average bus fare is ₹${buses.avgFare} across all routes`}
          color="amber"
        />
        <Insight
          icon={Clock}
          text={`${buses.totalTimings} total departure/arrival timing slots recorded`}
          color="sky"
        />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Doctors
      ══════════════════════════════════════════════ */}
      <Section icon={Stethoscope} title="Doctor Analytics" color={C.amber} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Specialties horizontal bar */}
        <ChartCard
          title="Doctors by Specialty"
          subtitle="Count of registered doctors per specialty"
          icon={Stethoscope}
          iconColor={C.amber}
          delay={0.52}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doctors.specialties} layout="vertical">
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Doctors"
                fill={C.amber}
                radius={[0, 4, 4, 0]}
              >
                {doctors.specialties.map((_, i) => (
                  <Cell
                    key={i}
                    fill={[C.amber, C.orange, C.rose, C.pink, C.violet][i % 5]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Experience trend line */}
        <ChartCard
          title="Doctor Experience"
          subtitle="Years of experience per doctor"
          icon={HeartPulse}
          iconColor={C.rose}
          delay={0.55}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={doctors.experienceTrend}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Line
                type="monotone"
                dataKey="experience"
                name="Years"
                stroke={C.rose}
                strokeWidth={2.5}
                dot={{ r: 5, fill: C.rose, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Schedule slots bar */}
        <ChartCard
          title="Schedule Slots per Doctor"
          subtitle="Number of scheduled timeslots per doctor"
          icon={CalendarDays}
          iconColor={C.violet}
          delay={0.57}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doctors.scheduleAnalysis}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="slots"
                name="Slots"
                fill={C.violet}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter: experience vs slots */}
        <ChartCard
          title="Experience vs Schedule Slots"
          subtitle="Do senior doctors have more schedule slots?"
          icon={Activity}
          iconColor={C.teal}
          delay={0.59}
        >
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid {...GRID} />
              <XAxis
                type="number"
                dataKey="experience"
                name="Exp (yrs)"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Exp (yrs)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />
              <YAxis
                type="number"
                dataKey="slots"
                name="Slots"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis range={[60, 200]} />
              <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={doctors.scheduleAnalysis}
                fill={C.teal}
                fillOpacity={0.75}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Insight
          icon={HeartPulse}
          text={`Average ${doctors.avgExperience} years of experience across all doctors`}
          color="amber"
        />
        <Insight
          icon={CalendarDays}
          text={`${doctors.scheduled} of ${doctors.total} doctors have a schedule set`}
          color="violet"
        />
        <Insight
          icon={Stethoscope}
          text={`${doctors.specialties[0]?.name || "—"} is the most common specialty`}
          color="rose"
        />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Ferries
      ══════════════════════════════════════════════ */}
      <Section icon={Anchor} title="Ferry Analytics" color={C.sky} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ferry operators */}
        <ChartCard
          title="Routes per Ferry Operator"
          subtitle="Number of routes each ferry company runs"
          icon={Ship}
          iconColor={C.sky}
          delay={0.62}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ferries.operators}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Routes"
                fill={C.sky}
                radius={[4, 4, 0, 0]}
              >
                {ferries.operators.map((_, i) => (
                  <Cell key={i} fill={[C.sky, C.teal, C.indigo][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ferry fare histogram */}
        <ChartCard
          title="Ferry Fare Distribution"
          subtitle="Ferry routes grouped by fare bracket"
          icon={Wallet}
          iconColor={C.teal}
          delay={0.65}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ferries.fareBuckets}>
              <CartesianGrid {...GRID} />
              <XAxis
                dataKey="name"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Routes"
                fill={C.teal}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <Insight
          icon={Anchor}
          text={`Average ferry fare is ₹${ferries.avgFare} across all routes`}
          color="emerald"
        />
        <Insight
          icon={Ship}
          text={`${ferries.total} total ferry routes registered`}
          color="sky"
        />
      </div>

      {/* ══════════════════════════════════════════════
          SECTION: Emergency Services
      ══════════════════════════════════════════════ */}
      <Section
        icon={Siren}
        title="Emergency Services Analytics"
        color={C.rose}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <ChartCard
          title="Service Category Breakdown"
          subtitle="Police · Fire · Ambulance · Hospital"
          icon={Flame}
          iconColor={C.rose}
          delay={0.68}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={emergencies.categories}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {emergencies.categories.map((_, i) => (
                  <Cell
                    key={i}
                    fill={[C.rose, C.orange, C.amber, C.sky, C.violet][i % 5]}
                  />
                ))}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contact numbers per service */}
        <ChartCard
          title="Contacts per Emergency Service"
          subtitle="Phone numbers registered per service"
          icon={HeartPulse}
          iconColor={C.orange}
          delay={0.71}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emergencies.contactAnalysis} layout="vertical">
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Bar
                dataKey="count"
                name="Contacts"
                fill={C.orange}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Insight
          icon={Siren}
          text={`${emergencies.total} emergency services registered on the platform`}
          color="rose"
        />
        <Insight
          icon={HeartPulse}
          text={`${emergencies.totalContacts} total emergency contact numbers available`}
          color="amber"
        />
        <Insight
          icon={MapPin}
          text={`${emergencies.gpsEnabled} of ${emergencies.total} services have GPS coordinates`}
          color="sky"
        />
      </div>
    </div>
  );
}
