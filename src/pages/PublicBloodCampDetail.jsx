import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  MapPin,
  Clock,
  CalendarDays,
  Phone,
  Mail,
  Users,
  Target,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  ShieldCheck,
  Heart,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useBloodCamp } from "../hooks/bloodCampHook";
import { successAlert, errorAlert } from "../utils/alert";
import PageBanner from "../components/PageBanner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATUS_META = {
  upcoming: {
    label: "Upcoming",
    cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  ongoing: {
    label: "Ongoing",
    cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  },
  completed: {
    label: "Completed",
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
};

export default function PublicBloodCampDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCampById, addDonor, loading } = useBloodCamp();
  const [camp, setCamp] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    age: "",
    phone: "",
    donatedAt: "", // Empty for new registration
  });

  const loadData = useCallback(async () => {
    const res = await fetchCampById(id);
    if (res.success) {
      setCamp(res.data);
    } else {
      errorAlert(res.message);
      navigate("/blood-donation");
    }
  }, [id, fetchCampById, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.bloodGroup || !formData.phone || !formData.age) {
       errorAlert("Please fill all required fields");
       return;
    }

    setSubmitting(true);
    try {
      const res = await addDonor({ ...formData, campId: id });
      if (res.success) {
        successAlert("Registration Successful! Thank you for your contribution.");
        setShowForm(false);
        setFormData({ name: "", bloodGroup: "", age: "", phone: "", donatedAt: "" });
        loadData();
      } else {
        errorAlert(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!camp && loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
         <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-slate-500 font-medium">Fetching camp details...</p>
      </div>
    );
  }

  if (!camp) return null;

  const progress = camp.targetUnits > 0 ? Math.min((camp.collectedUnits / camp.targetUnits) * 100, 100) : 0;
  const statusMeta = STATUS_META[camp.status] || STATUS_META.upcoming;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <PageBanner
        title={camp.campName}
        subtitle={camp.organizer}
        image={camp.banner_image || "https://images.unsplash.com/photo-1536856492748-81a49e0c70d4?w=1400&auto=format&fit=crop&q=80"}
        gradient="from-rose-950/95 via-rose-900/90 to-slate-950/95"
        Icon={Droplets}
        badge="Community Blood Drive"
      />

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <button 
                    onClick={() => navigate("/blood-donation")}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <ArrowLeft size={16} /> Back to List
                  </button>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${statusMeta.cls}`}>
                    {statusMeta.label}
                  </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Event Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                        <CalendarDays className="text-rose-600 dark:text-rose-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{camp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                        <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{camp.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <MapPin className="text-blue-600 dark:text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{camp.location}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{camp.address}, {camp.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <h2 className="text-2xl font-black text-slate-800 dark:text-white">Demand & Impact</h2>
                   <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-end mb-3">
                         <div>
                            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{camp.collectedUnits}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Units Collected</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-bold text-slate-400 dark:text-slate-600">/ {camp.targetUnits}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goal</p>
                         </div>
                      </div>
                      <div className="h-3 bg-white dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-linear-to-r from-rose-500 via-pink-500 to-rose-400 rounded-full"
                        />
                      </div>
                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Help us reach our goal! Each donation can save up to 3 lives.
                      </p>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h2 className="text-xl font-black text-slate-800 dark:text-white">About this Camp</h2>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                   {camp.description || "No specific details provided for this event. Please contact the organizers for more information."}
                 </p>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                     <Heart size={32} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Emergency Blood Needed</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">The following blood groups are in high demand for this camp:</p>
                    <div className="flex flex-wrap gap-2">
                      {(camp.bloodGroupsNeeded || []).map(g => (
                        <span key={g} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-black text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-800">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
              </div>
            </motion.div>

            {/* Donors Preview */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800"
             >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Users className="text-rose-500" size={24} />
                    Registered Donors
                  </h3>
                  <div className="px-4 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                    {camp.donors?.length || 0} People
                  </div>
                </div>

                {camp.donors?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {camp.donors.slice(0, 6).map((d, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xs">
                          {d.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{d.name}</p>
                          <span className="text-[10px] text-rose-500 font-black">{d.bloodGroup}</span>
                        </div>
                      </div>
                    ))}
                    {camp.donors.length > 6 && (
                      <div className="flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-500">+ {camp.donors.length - 6} more</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                     <p className="text-sm text-slate-400 italic">Be the first hero to register for this camp!</p>
                  </div>
                )}
             </motion.div>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-600 rounded-3xl p-8 text-white shadow-2xl shadow-rose-900/40 relative overflow-hidden"
              >
                <Droplets className="absolute -top-10 -right-10 w-40 h-40 opacity-10 rotate-12" />
                
                <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                  <UserPlus size={24} />
                  Register Now
                </h3>
                <p className="text-rose-100 text-sm mb-8 leading-relaxed">
                  Join the lifeline of our community. Your presence and participation are highly valued.
                </p>

                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
                >
                  Confirm Participation
                </button>

                <div className="mt-8 pt-8 border-t border-rose-500/30 space-y-4">
                   <div className="flex items-start gap-3">
                      <ShieldCheck className="text-rose-200 shrink-0" size={18} />
                      <p className="text-[10px] text-rose-100 uppercase tracking-wider font-bold">100% Safe Process</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <Phone className="text-rose-200 shrink-0" size={18} />
                      <p className="text-[10px] text-rose-100 uppercase tracking-wider font-bold">{camp.contactPhone}</p>
                   </div>
                </div>
              </motion.div>

              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
                 <h4 className="text-lg font-black text-white mb-4">Organizer</h4>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                       <ImageIcon size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-white text-sm">{camp.organizer}</p>
                       <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Verified NGO</p>
                    </div>
                 </div>
                 <a href={`mailto:${camp.contactEmail}`} className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                       <Mail className="text-rose-400" size={18} />
                       <span className="text-xs font-bold text-slate-300">Email Organizer</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-500" />
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               onClick={() => setShowForm(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
             >
                <div className="p-10">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <h3 className="text-3xl font-black text-slate-800 dark:text-white">Registration</h3>
                         <p className="text-sm text-slate-500 mt-1">Provide your details to register as a donor.</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                         <X size={24} />
                      </button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-1.5 focus-within:text-rose-500">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Full Name</label>
                         <input 
                           type="text"
                           required
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold text-slate-800 dark:text-white"
                           placeholder="Enter your name"
                         />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5 focus-within:text-rose-500">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Blood Group</label>
                           <select 
                             required
                             value={formData.bloodGroup}
                             onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                             className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold text-slate-800 dark:text-white appearance-none"
                           >
                              <option value="">Select</option>
                              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5 focus-within:text-rose-500">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Age</label>
                           <input 
                             type="number"
                             required
                             min="18"
                             max="65"
                             value={formData.age}
                             onChange={e => setFormData({...formData, age: e.target.value})}
                             className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold text-slate-800 dark:text-white"
                             placeholder="Yrs"
                           />
                        </div>
                      </div>

                      <div className="space-y-1.5 focus-within:text-rose-500">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-400">Phone number</label>
                         <input 
                           type="tel"
                           required
                           value={formData.phone}
                           onChange={e => setFormData({...formData, phone: e.target.value})}
                           className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold text-slate-800 dark:text-white"
                           placeholder="+91 XXXXX XXXXX"
                         />
                      </div>

                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/30 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {submitting ? "Registering..." : "Confirm Registration"}
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
