import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut,
  User, Settings, ExternalLink, Globe, X, Shield,
  Mail, Calendar, CheckCircle, Clock, Key, Camera, Save, Pencil
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile } from "../../api/authApi";
import { toast } from "sonner";
import eventApi from "../../api/eventApi";

function initials(name = "") {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : parts[0]?.[0] ?? "?";
}

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

/* ── Profile Detail Modal ── */
function ProfileModal({ user, onClose }) {
  const { setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEditing(false);
      setFile(null);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (file) formData.append("avatar", file);

      const res = await updateProfile(formData);
      setUser(res.user);
      toast.success(res.message);
      setEditing(false);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1 bg-linear-to-r from-primary-500 via-violet-500 to-purple-500" />

            {/* Close */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>

            {/* Avatar + name header */}
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl" />
                <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg overflow-hidden group">
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    initials(user.name)
                  )}
                  {/* Hover Overlay for change */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {/* online dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>

              {editing ? (
                <div className="flex flex-col items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-[200px] text-center px-3 py-1 bg-slate-50 dark:bg-slate-800 border-2 border-primary-400 rounded-lg text-lg font-bold outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={loading}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase">
                      {user.name}
                    </h2>
                    {/* <button
                      onClick={() => setEditing(true)}
                      className="p-1 text-slate-400 hover:text-primary-500 transition-colors"
                    >
                      <Pencil size={12} />
                    </button> */}
                  </div>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 capitalize">
                    <Shield size={10} /> {user.role}
                  </span>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="px-8 pb-8 space-y-3">
              {[
                { Icon: Mail,         label: "Email",       value: user.email },
                {
                  Icon: CheckCircle,
                  label: "Email Verified",
                  value: user.isEmailVerified ? "Verified" : "Not verified",
                  valueClass: user.isEmailVerified
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500",
                },
                {
                  Icon: User,
                  label: "Status",
                  value: user.status,
                  valueClass: user.status === "active"
                    ? "text-emerald-600 dark:text-emerald-400 capitalize"
                    : "text-slate-500 capitalize",
                },
                // {
                //   Icon: Key,
                //   label: "Permissions",
                //   value: user.permissions?.includes("*") ? "Full Access" : user.permissions?.join(", "),
                // },
                { Icon: Calendar, label: "Joined",       value: fmt(user.createdAt) },
                { Icon: CheckCircle, label: "Registered Since", value: timeSince(user.createdAt).replace(" ago", "") },
                { Icon: Clock,    label: "Last Updated", value: fmt(user.updatedAt) },
              ].map(({ Icon, label, value, valueClass }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</p>
                    <p className={`text-sm font-semibold text-slate-700 dark:text-slate-200 truncate ${valueClass ?? ""}`}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Quick action button for image if not editing name but file selected */}
            {!editing && file && (
              <div className="px-8 pb-4">
                 <button
                   onClick={handleUpdate}
                   disabled={loading}
                   className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {loading ? "Uploading..." : <><Save size={16}/> Update Profile Picture</>}
                 </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ── Main Navbar ── */
export default function AdminNavbar({ onMenuClick }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen]     = useState(false);
  const [dropOpen, setDropOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [latestEvents, setLatestEvents] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(true);

  const notifRef   = useRef(null);
  const dropRef    = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await eventApi.getLatestEvents();
        
        setLatestEvents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch notification events:", err);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes, users, events..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-400 dark:focus:border-primary-500 rounded-lg outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Globe size={15} className="text-primary-500" />
            <span className="text-xs font-bold hidden sm:inline">
              {language === "en" ? "বাংলা" : "EN"}
            </span>
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setUnreadNotifs(false);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Bell size={18} />
              {unreadNotifs && latestEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Recent Events</span>
                    <Link to="/admin/events" onClick={() => setNotifOpen(false)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
                  </div>
                  {latestEvents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No recent events.</div>
                  ) : (
                    latestEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                           <img src={ev.image} alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{timeSince(ev.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
         <div ref={dropRef} className="relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initials(user?.name)
                )}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                {user?.name?.split(" ")[0]}
              </span>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Mini profile header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        initials(user?.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* View Profile */}
                  <button
                    onClick={() => { setDropOpen(false); setProfileOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <User size={15} /> View Profile
                  </button>

                  <Link
                    to="/admin/settings"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Settings size={15} /> Settings
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ExternalLink size={15} /> View Site
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Profile detail modal */}
      <ProfileModal user={profileOpen ? user : null} onClose={() => setProfileOpen(false)} />
    </>
  );
}
