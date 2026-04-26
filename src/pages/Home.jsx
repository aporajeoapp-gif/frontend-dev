import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  Bus,
  Ship,
  CalendarDays,
  ArrowRight,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Sparkles,
  Globe2,
  HeartHandshake,
} from "lucide-react";


import AdBanner from "../components/AdBanner";
import Testimonials from "../components/Testimonials";
import useDoctors from "../hooks/doctorhook";
import useEmergencyServices from "../hooks/emergencyHook";
import useBuses from "../hooks/bushook";
import useFerries from "../hooks/ferryhook";
import { useEvents } from "../hooks/eventHook";

const SLIDES = [
  {
    id: 0,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80",
    overlay: "from-primary-900/85 via-violet-900/60 to-transparent",
    badge: "Healthcare",
    badgeColor: "bg-primary-500",
    title: "Find Trusted Doctors",
    subtitle: "Expert care, close to home",
    desc: "Connect with verified specialists across all medical fields.",
    cta: "/doctor",
    Icon: Stethoscope,
  },
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1400&q=80",
    overlay: "from-rose-900/85 via-red-900/60 to-transparent",
    badge: "Emergency",
    badgeColor: "bg-rose-500",
    title: "Emergency Services",
    subtitle: "24/7 rapid response",
    desc: "Instant access to emergency contacts when every second counts.",
    cta: "/emergency",
    Icon: AlertTriangle,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&q=80",
    overlay: "from-teal-900/85 via-emerald-900/60 to-transparent",
    badge: "Transport",
    badgeColor: "bg-teal-500",
    title: "Smart Transport",
    subtitle: "Bus & ferry schedules",
    desc: "Real-time routes and schedules at your fingertips.",
    cta: "/bus",
    Icon: Bus,
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/dlsuycdfj/image/upload/v1774797481/aporajeo_banner_xmosjk.jpg",
    overlay: "from-slate-900/70 via-slate-900/30 to-transparent",
    badge: "Community",
    badgeColor: "bg-red-600",
    title: "Aporajeo",
    subtitle: "Undefeated, together",
    desc: "A community built on resilience, hope, and the spirit of the people.",
    cta: "/",
    Icon: Users,
  },
];



const WHY_US = [
  {
    Icon: Shield,
    title: "Trusted & Verified",
    desc: "All services are verified and regularly updated for accuracy.",
    color: "text-primary-500",
    bg: "bg-primary-50 dark:bg-primary-900/30",
  },
  {
    Icon: Clock,
    title: "Available 24/7",
    desc: "Emergency contacts and critical services available round the clock.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/30",
  },
  {
    Icon: Globe2,
    title: "Bilingual Support",
    desc: "Full Bengali and English language support for all users.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    Icon: HeartHandshake,
    title: "Community First",
    desc: "Built for and by the community to serve everyone equally.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/30",
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[current];
  const { doctors } = useDoctors();
  const { emergencies } = useEmergencyServices();
  const { buses } = useBuses();
  const { ferries } = useFerries();
  const { events, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const SERVICES = [
    {
      path: "/doctor",
      label: "Find Doctors",
      Icon: Stethoscope,
      from: "from-primary-500",
      to: "to-violet-600",
      shadow: "shadow-primary-200 dark:shadow-primary-900/40",
      desc: "Verified specialists across all fields",
      count: `${doctors.length}+ Doctors`,
    },
    {
      path: "/emergency",
      label: "Emergency",
      Icon: AlertTriangle,
      from: "from-rose-500",
      to: "to-red-600",
      shadow: "shadow-rose-200 dark:shadow-rose-900/40",
      desc: "24/7 emergency contacts & services",
      count: `${emergencies.length}+ Services`,
    },
    {
      path: "/bus",
      label: "Bus Services",
      Icon: Bus,
      from: "from-emerald-500",
      to: "to-teal-600",
      shadow: "shadow-emerald-200 dark:shadow-emerald-900/40",
      desc: "Live bus routes and schedules",
      count: `${buses.length}+ Routes`,
    },
    {
      path: "/ferry",
      label: "Ferry Services",
      Icon: Ship,
      from: "from-cyan-500",
      to: "to-blue-600",
      shadow: "shadow-cyan-200 dark:shadow-cyan-900/40",
      desc: "Ferry timetables and fares",
      count: `${ferries.length}+ Routes`,
    },
    {
      path: "/events",
      label: "Events",
      Icon: CalendarDays,
      from: "from-violet-500",
      to: "to-purple-600",
      shadow: "shadow-violet-200 dark:shadow-violet-900/40",
      desc: "Community events near you",
      count: `${events.length}+ Events`,
    },
  ];
  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % SLIDES.length),
      6000,
    );
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden z-0"
        style={{ minHeight: "clamp(520px, 72vh, 760px)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ pointerEvents: "none", zIndex: 0 }}
          >
            <div className="absolute inset-0 pointer-events-none z-0">
              <img src={slide.image} className="w-full h-full object-cover" />
            </div>
            <div
              className={`absolute inset-0 pointer-events-none bg-linear-to-r ${slide.overlay} pointer-events-none`}
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-50 dark:from-slate-950 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Grid overlay */}
        {/* <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="hg"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hg)" />
          </svg>
        </div> */}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center py-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <motion.span
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`inline-flex items-center gap-2 ${slide.badgeColor} text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest shadow-lg`}
              >
                <slide.Icon size={11} />
                {slide.badge}
                <Sparkles size={9} className="text-yellow-200" />
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-3 drop-shadow-2xl"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="text-xl font-semibold text-white/90 mb-2"
              >
                {slide.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="text-base text-white/70 mb-8 max-w-lg leading-relaxed"
              >
                {slide.desc}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to={slide.cta}
                  className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold px-7 py-3.5 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                >
                  Explore Now <ArrowRight size={16} />
                </Link>
                {/* <Link
                  to="/"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Learn More
                </Link> */}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() =>
            setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
        {!paused && (
          <motion.div
            key={`p-${current}`}
            className="absolute bottom-0 left-0 h-0.5 z-30 bg-white/60"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
          />
        )}
      </section>

      {/* ── STATS ── */}
      <section className="py-10 px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              count: doctors.length,
              label: "Verified Doctors",
              Icon: Stethoscope,
              from: "from-primary-500",
              to: "to-violet-600",
            },
            {
              count: emergencies.length,
              label: "Emergency Services",
              Icon: AlertTriangle,
              from: "from-rose-500",
              to: "to-red-600",
            },
            {
              count: buses.length + ferries.length,
              label: "Transport Routes",
              Icon: Bus,
              from: "from-emerald-500",
              to: "to-teal-600",
            },
            {
              count: "10K",
              label: "Community Members",
              Icon: Users,
              from: "from-violet-500",
              to: "to-purple-600",
            },
          ].map(({ count, label, Icon, from, to }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="relative bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 overflow-hidden group hover:shadow-lg transition-all"
            >
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-linear-to-br ${from} ${to} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div
                className={`w-10 h-10 rounded-xl bg-linear-to-br ${from} ${to} flex items-center justify-center mb-3 shadow-md`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {count}+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* <AdBanner/> */}
      {/* ── SERVICES ── */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
              <Sparkles size={10} /> Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
              Everything You Need
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
              One platform for healthcare, emergency, transport, and community
              events.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(
              ({ path, label, Icon, from, to, shadow, desc, count }, i) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link to={path}>
                    <motion.div
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all h-full relative overflow-hidden z-0"
                    >
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-linear-to-br ${from} ${to} opacity-5 translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity`}
                      />
                      <div
                        className={`w-12 h-12 rounded-2xl bg-linear-to-br ${from} ${to} flex items-center justify-center mb-4 shadow-lg ${shadow}`}
                      >
                        <Icon size={22} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                        {label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                        {desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {count}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                          View <ArrowRight size={11} />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── ADVERTISEMENTS ── */}
      <AdBanner />
      {/* <AddBanner ads={advertisements} /> */}

      {/* ── WHY US ── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
              <CheckCircle size={10} /> Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
              Our Mission
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
              Empowering communities with reliable, accessible, and trusted
              services.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_US.map(({ Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
                >
                  <Icon size={20} className={color} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {/* <section className="py-16 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 rounded-full">
              <Star size={10} /> Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
              What People Say
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-full translate-x-6 -translate-y-6" />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={12}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed mb-4">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-violet-500 flex items-center justify-center text-base shadow-sm">
                    {item.image}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      <Testimonials />

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center text-white shadow-2xl shadow-slate-400 dark:shadow-slate-900/60"
          >
            <img
              src="https://res.cloudinary.com/dlsuycdfj/image/upload/v1774797481/aporajeo_banner_xmosjk.jpg"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.0]"
              alt="Aporajeo banner"
            />
            <div className="absolute inset-0 bg-slate-900/50" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 p-10 md:p-16">
              <div className="w-44 sm:w-64 mx-auto mb-8">
                <img src="/logo.png" alt="Logo" className="w-full h-auto object-contain" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                Get in Touch
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Have questions? We're here to help you 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/8801712345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <MessageCircle size={17} /> WhatsApp
                </a>
                <a
                  href="mailto:info@oporajeo.com"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Mail size={17} /> Email Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
