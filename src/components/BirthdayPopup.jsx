import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Heart, Sparkles } from "lucide-react";
import fetchUser from "../hooks/userhook";

const FloatingParticle = ({ delay }) => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ 
      y: [-20, -100], 
      opacity: [0, 1, 0],
      x: Math.random() * 100 - 50
    }}
    transition={{ 
      duration: 2 + Math.random() * 2, 
      delay, 
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute w-2 h-2 rounded-full bg-rose-400/30"
  />
);

export default function BirthdayPopup() {
  const { profile } = fetchUser();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show only if profile says it's birthday and we haven't shown it this session
    if (profile?.isBirthday && !sessionStorage.getItem("birthdayShown")) {
      setShow(true);
      sessionStorage.setItem("birthdayShown", "true");
    }
  }, [profile]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={() => setShow(false)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Animated Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>
                <FloatingParticle delay={i * 0.3} />
              </div>
            ))}
          </div>

          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-rose-500 to-violet-600 opacity-10" />
          
          <button 
            onClick={() => setShow(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative p-10 text-center">
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 bg-linear-to-br from-rose-500 to-pink-500 rounded-3xl shadow-xl shadow-rose-500/30 flex items-center justify-center mx-auto mb-8"
            >
              <Gift size={48} className="text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic">
                Happy Birthday, {profile?.name?.split(" ")[0]}!
              </h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
                  Wishing you a wonderful day!
                </p>
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
              </div>
              
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-8">
                 <Heart size={24} className="text-rose-500 mx-auto mb-3 fill-rose-500" />
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                   The entire team at <span className="font-bold text-rose-600">Shyampur NGO</span> wishes you health, happiness, and prosperity on your special day.
                 </p>
              </div>

              <button
                onClick={() => setShow(false)}
                className="w-full py-4 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/20 active:scale-[0.98] transition-all"
              >
                Thank You!
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
