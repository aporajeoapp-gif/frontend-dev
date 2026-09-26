import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { loginUser, getUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Invalid email address.");
    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      // alert(res.message)
      console.log(res);
      // store token first so getUser() request is authenticated
      localStorage.setItem("token", res.token);
      const userData = await getUser();
      login(res.token, userData.user);
      onClose();
      navigate("/admin");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary-500/30 via-violet-500/20 to-purple-500/30 blur-xl" />

            <div className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-primary-500 via-violet-500 to-purple-500" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
                {/* Logo */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-primary-500/20 blur-lg" />
                  <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="Aporajeo"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sign in to your account
                </p>
              </div>

              {/* Form */}
              <div className="px-8 pb-8">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-5 text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                        data-testid="login-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="login-submit-button"
                    className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900/40 mt-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn size={15} />
                    )}
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
