import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Heart, Sparkles, Cake, PartyPopper } from "lucide-react";
import fetchUser from "../hooks/userhook";
import { getBirthdayUsers } from "../api/authApi";

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
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [isMyBirthday, setIsMyBirthday] = useState(false);

  useEffect(() => {
    const checkBirthdays = async () => {
      if (!profile) return;

      const today = new Date();
      const dateStr = today.toDateString(); // e.g. "Mon Apr 27 2026"
      const storageKey = `birthday_popup_${profile._id || 'guest'}_${dateStr}`;

      // If already shown today for this user, don't show again
      if (sessionStorage.getItem(storageKey)) {
        console.log("🎂 Birthday popup already shown for today.");
        return;
      }

      console.log("🎂 Birthday check initiated for:", profile.name);

      try {
        const users = await getBirthdayUsers();
        
        // Manual check for current user (robust comparison)
        const profileDob = profile?.dob ? new Date(profile.dob) : null;
        const manualIsBirthday = profileDob && 
          profileDob.getUTCDate() === today.getDate() && 
          profileDob.getUTCMonth() === today.getMonth();

        const celebratesToday = users && users.length > 0;
        
        if (celebratesToday || manualIsBirthday || profile?.isBirthday) {
          console.log("✅ Birthday detected! Showing popup.");
          setBirthdayUsers(users || []);
          
          const meInList = users?.find(u => u._id === profile?._id);
          setIsMyBirthday(!!meInList || !!manualIsBirthday || !!profile?.isBirthday);
          
          setShow(true);
          sessionStorage.setItem(storageKey, "true");
        }
      } catch (error) {
        console.error("❌ Error fetching birthday users:", error);
      }
    };

    checkBirthdays();
  }, [profile]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                className={`w-24 h-24 bg-linear-to-br ${isMyBirthday ? 'from-rose-500 to-pink-500 shadow-rose-500/30' : 'from-amber-400 to-orange-500 shadow-amber-500/30'} rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8`}
              >
                {isMyBirthday ? <Gift size={48} className="text-white" /> : <PartyPopper size={48} className="text-white" />}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic">
                  {isMyBirthday 
                    ? `Happy Birthday, ${profile?.name?.split(" ")[0]}!`
                    : "Birthday Celebration!"}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
                    {isMyBirthday 
                      ? "Wishing you a wonderful day!" 
                      : `Special day for our team members`}
                  </p>
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                </div>
                
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-8">
                   {isMyBirthday ? (
                     <>
                       <Heart size={24} className="text-rose-500 mx-auto mb-3 fill-rose-500" />
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                         The entire team at <span className="font-bold text-rose-600">Aporajeo Foundation</span> wishes you health, happiness, and prosperity on your special day.
                       </p>
                     </>
                   ) : (
                     <div className="space-y-4">
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                         Today we celebrate the birthdays of:
                       </p>
                       <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto p-2">
                         {birthdayUsers.map((user, idx) => (
                           <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold ring-1 ring-amber-200 dark:ring-amber-800">
                             {user.name}
                           </span>
                         ))}
                       </div>
                       <p className="text-[10px] text-slate-400 italic">
                         Let's wish them a wonderful year ahead!
                       </p>
                     </div>
                   )}
                </div>

                <button
                  onClick={() => setShow(false)}
                  className={`w-full py-4 bg-linear-to-r ${isMyBirthday ? 'from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700' : 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'} text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all`}
                >
                  {isMyBirthday ? "Thank You!" : "That's Great!"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
