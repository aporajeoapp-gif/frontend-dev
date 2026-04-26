import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Stethoscope,
  AlertTriangle,
  Bus,
  Ship,
  CalendarDays,
  Droplets,
  Sun,
  Moon,
  Globe,
  LogIn,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";

const NAV_LINKS = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/doctor", label: "Doctors", Icon: Stethoscope },
  { path: "/emergency", label: "Emergency", Icon: AlertTriangle },
  { path: "/bus", label: "Bus", Icon: Bus },
  { path: "/ferry", label: "Ferry", Icon: Ship },
  { path: "/events", label: "Events", Icon: CalendarDays },
  { path: "/blood-donation", label: "Blood Donation", Icon: Droplets },
];

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();
  const isDark = theme === "dark";

  return (
    <>
      <nav className="sticky top-0 z-[10000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo.png"
              alt="Oporajeo"
              className="h-7 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ path, label, Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? "Switch to light" : "Switch to dark"}
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-primary-500" />
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              <Globe size={13} className="text-primary-500" />
              <span className="text-xs font-bold">
                {language === "en" ? "বাংলা" : "EN"}
              </span>
            </button>

            {/* Auth button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-md"
                >
                  <LayoutDashboard size={14} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {/* <button
                  onClick={logout}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} className="text-red-500" />
                </button> */}
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                data-testid="login-button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-md"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
