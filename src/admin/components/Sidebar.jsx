import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Bus,
  Ship,
  Stethoscope,
  AlertTriangle,
  CalendarDays,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  X,
  Droplets,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import logo from "../../../public/logo.png";
import { useAuth } from "../../context/AuthContext";
import { confirmLogout,successAlert } from "../../utils/alert";
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, memberHidden: true },
  { to: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/admin/bus", label: "Bus Routes", icon: Bus, memberHidden: true },
  { to: "/admin/ferry", label: "Ferry Routes", icon: Ship, memberHidden: true },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, memberHidden: true },
  { to: "/admin/emergency", label: "Emergency", icon: AlertTriangle, memberHidden: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/blood-donation", label: "Blood Donation", icon: Droplets, memberHidden: true },
  { to: "/admin/advertisements", label: "Advertisements", icon: Megaphone, memberHidden: true },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { to: "/admin/analytics", label: "Overview" },
      { to: "/admin/analytics/auditlogs", label: "Audit Logs", memberHidden: true },
    ],
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings,
    adminOnly: true,
  },
  { to: "/admin/docs", label: "DDocs", icon: BookOpen, adminOnly: true, target: "_blank" },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isAuthorized = isSuperAdmin || isAdmin;
  const location = useLocation();
const handleLogout = async () => {
  const result = await confirmLogout();

  if (!result.isConfirmed) return;

  logout(); // clear token + user

  successAlert("Logged out successfully");

  // optional redirect
  window.location.href = "/";
};
  // track which dropdowns are open
  const [openGroups, setOpenGroups] = useState({ Analytics: true });
  const toggleGroup = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const renderItem = ({
    to,
    label,
    icon: Icon,
    end,
    adminOnly,
    memberHidden,
    children,
    target,
  }) => {
    if (adminOnly && !isAuthorized) return null;
    if (memberHidden && user?.role === "member") return null;

    // ── Dropdown group ──
    if (children) {
      const isGroupActive = children.some((c) =>
        location.pathname.startsWith(c.to),
      );
      const isOpen = openGroups[label];
      return (
        <div key={label}>
          <button
            onClick={() => toggleGroup(label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group outline-none focus:outline-none
              ${isGroupActive
                ? "bg-primary-50 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? label : undefined}
          >
            <Icon
              size={18}
              className={`shrink-0 ${isGroupActive ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap flex-1 text-left"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            )}
          </button>

          <AnimatePresence>
            {isOpen && !collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3"
              >
                {children.filter(c => !(c.memberHidden && user?.role === "member")).map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    end={child.to === "/admin/analytics"}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 outline-none focus:outline-none
                      ${isActive
                        ? "bg-primary-50 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // ── Regular link ──
    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        target={target}
        onClick={onMobileClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group outline-none focus:outline-none
          ${isActive
            ? "bg-primary-50 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          } ${collapsed ? "justify-center" : ""}`
        }
        title={collapsed ? label : undefined}
      >
        {({ isActive }) => (
          <>
            <Icon
              size={18}
              className={`shrink-0 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
      </NavLink>
    );
  };
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex flex-col items-center px-4 py-5 border-b border-slate-200 dark:border-slate-800 ${collapsed ? "justify-center" : ""
          }`}
      >
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />

          <button
            onClick={onToggle}
            className="ml-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                Admin Panel
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => renderItem(item))}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 hidden lg:block">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          {/* Icon */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-500 text-white text-xs font-semibold">
            {user?.role?.charAt(0)?.toUpperCase() || "A"}
          </div>

          {/* Role */}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                {user?.role || "Admin"}
              </span>
            </div>
          )}

        </div>
        <div className="mt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
    text-sm font-medium transition-all duration-200
    bg-red-50 text-red-600 hover:bg-red-100
    dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <LogOut size={18} className="shrink-0" />

            {!collapsed && <span>Terminate</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 z-30"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
