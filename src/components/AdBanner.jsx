import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { useAds } from "../hooks/adsHook";

/* ── Dark mode observer ─────────────────────────────────────────────────── */
function useDark() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const TAG_COLORS = {
  Healthcare: { light: "#ef4444", dark: "#fca5a5" },
  Pharmacy:   { light: "#10b981", dark: "#6ee7b7" },
  Transport:  { light: "#6366f1", dark: "#a5b4fc" },
  Events:     { light: "#f59e0b", dark: "#fcd34d" },
  Education:  { light: "#3b82f6", dark: "#93c5fd" },
  Default:    { light: "#8b5cf6", dark: "#c4b5fd" }
};

/* ── Single ad card ─────────────────────────────────────────────────────── */
function AdCard({ ad, dark, didDragRef }) {
  const tagMeta = TAG_COLORS[ad.tag] || TAG_COLORS.Default;
  const accent = dark 
    ? (ad.colorDark || tagMeta.dark) 
    : (ad.color || tagMeta.light);

  return (
    <a
      href={ad.link || ad.redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      onClick={(e) => {
        if (didDragRef.current) e.preventDefault();
      }}
      className="group relative shrink-0 w-[290px] mx-2.5 flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 select-none"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
        backdropFilter: "blur(12px)",
        boxShadow: dark
          ? "0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden rounded-t-2xl pointer-events-none bg-slate-100 dark:bg-slate-800">
        {ad.image || ad.imageUrl ? (
          <img
            src={ad.image || ad.imageUrl}
            alt={ad.title}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
             <ImageIcon size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span
          className="absolute bottom-2.5 left-3 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-md text-white"
          style={{ background: accent }}
        >
          {ad.tag}
        </span>
        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-white/60 border border-white/25 px-1.5 py-0.5 rounded backdrop-blur-sm tracking-widest">
          AD
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1 pointer-events-none">
        <h3
          className="text-[13px] font-bold leading-snug"
          style={{ color: dark ? "#f1f5f9" : "#1e293b" }}
        >
          {ad.title}
        </h3>
        <p
          className="text-[11.5px] leading-relaxed flex-1"
          style={{ color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}
        >
          {ad.description}
        </p>

        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{
            borderTop: `1px solid ${
              dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"
            }`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent }}
            />
            <span className="text-[10px] font-semibold" style={{ color: accent }}>
              Sponsored
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white transition-all duration-200 group-hover:gap-2.5"
            style={{ background: accent }}
          >
            {ad.cta} →
          </span>
        </div>
      </div>

      {/* Hover inset glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1.5px ${accent}55` }}
      />
    </a>
  );
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const AUTO_SPEED = 32;   // px/s
const FRICTION   = 0.88; // momentum decay per frame
const MAX_DT     = 50;   // ms — cap to avoid jumps after tab-hide

/* ── Marquee track ──────────────────────────────────────────────────────── */
function MarqueeTrack({ dark, ads }) {
  const trackRef    = useRef(null);
  const posRef      = useRef(0);
  const halfWRef    = useRef(0);
  const rafRef      = useRef(null);

  // Interaction state in refs — no re-renders needed
  const hoveredRef  = useRef(false);
  const pressingRef = useRef(false);
  const didDragRef  = useRef(false);
  const startXRef   = useRef(0);
  const lastXRef    = useRef(0);
  const lastTRef    = useRef(0);
  const velRef      = useRef(0);       // px/ms
  const prevTRef    = useRef(null);

  // 3 copies for seamless bidirectional loop
  const tripled = [...ads, ...ads, ...ads];

  /* RAF loop */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Initialise to middle copy after first paint
    const init = requestAnimationFrame(() => {
      halfWRef.current = track.scrollWidth / 3;
      posRef.current   = -halfWRef.current;
      track.style.transform = `translateX(${posRef.current}px)`;
    });

    const step = (ts) => {
      const dt   = prevTRef.current !== null
        ? Math.min(ts - prevTRef.current, MAX_DT)
        : 0;
      prevTRef.current = ts;

      const half = halfWRef.current;

      if (!pressingRef.current) {
        if (Math.abs(velRef.current) > 0.05) {
          // Coast with momentum
          posRef.current += velRef.current * dt;
          velRef.current *= FRICTION;
        } else if (!hoveredRef.current) {
          // Normal auto-scroll
          velRef.current  = 0;
          posRef.current -= (AUTO_SPEED / 1000) * dt;
        }
        // hovering + vel~0 → do nothing (fully stopped)
      }

      // Seamless clamp: stay within the middle copy range
      if (half > 0) {
        if (posRef.current <= -half * 2) posRef.current += half;
        if (posRef.current >  -half)     posRef.current -= half;
      }

      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(init);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Shared pointer helpers */
  const onStart = (clientX) => {
    pressingRef.current = true;
    didDragRef.current  = false;
    velRef.current      = 0;
    startXRef.current   = clientX;
    lastXRef.current    = clientX;
    lastTRef.current    = performance.now();
  };

  const onMove = (clientX) => {
    if (!pressingRef.current) return;
    const now = performance.now();
    const dx  = clientX - lastXRef.current;
    const dt  = now - lastTRef.current || 1;

    if (Math.abs(clientX - startXRef.current) > 4) didDragRef.current = true;

    posRef.current  += dx;
    velRef.current   = dx / dt;
    lastXRef.current = clientX;
    lastTRef.current = now;
  };

  const onEnd = () => {
    pressingRef.current = false;
    // velRef keeps its value → momentum handled in RAF
  };

  /* Touch — respect vertical scroll */
  const touchStartYRef  = useRef(0);
  const isHorizRef      = useRef(false);

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    isHorizRef.current     = false;
    onStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const t  = e.touches[0];
    const dx = Math.abs(t.clientX - startXRef.current);
    const dy = Math.abs(t.clientY - touchStartYRef.current);

    if (!isHorizRef.current && dy > dx) {
      // Vertical swipe — release and let the page scroll
      onEnd();
      return;
    }
    isHorizRef.current = true;
    e.preventDefault(); // block page scroll only for horizontal swipes
    onMove(t.clientX);
  };

  return (
    <div
      className="overflow-hidden w-full py-3 select-none"
      style={{ cursor: "grab", touchAction: "pan-y" }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; onEnd(); }}
      onMouseDown={(e) => { e.preventDefault(); onStart(e.clientX); }}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ userSelect: "none" }}
      >
        {tripled.map((ad, i) => (
          <AdCard
            key={`${ad.id}-${i}`}
            ad={ad}
            dark={dark}
            didDragRef={didDragRef}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────────────────── */
export default function AdSection() {
  const dark = useDark();
  const { ads, fetchAds, loading } = useAds();

  useEffect(() => {
    fetchAds("active");
  }, [fetchAds]);

  if (!loading && ads.length === 0) return null;

  const sectionBg = dark
    ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
    : "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f8faff 100%)";

  const fadeBg = dark ? "#0f172a" : "#f8faff";

  return (
    <section className="overflow-hidden py-12" style={{ background: sectionBg }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-2 mb-10 px-4 text-center"
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{
            background: dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.1)",
            color:      dark ? "rgba(255,255,255,0.5)"  : "#6366f1",
            border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.2)"}`,
          }}
        >
          <Sparkles size={10} />
          Sponsored
        </div>

        <h2
          className="text-4xl sm:text-5xl font-black tracking-tight leading-none"
          style={{ color: dark ? "#f8fafc" : "#0f172a" }}
        >
          Offers &amp;{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Promotions
          </span>
        </h2>

        <div
          className="mt-1 w-12 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
        />

        <p
          className="text-[12px] mt-0.5"
          style={{ color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}
        >
          Drag or swipe to explore · {ads.length} active promotions
        </p>
      </motion.div>

      {/* Marquee with fade edges */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
          style={{ background: `linear-gradient(to right, ${fadeBg}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
          style={{ background: `linear-gradient(to left, ${fadeBg}, transparent)` }}
        />
        <MarqueeTrack dark={dark} ads={ads} />
      </div>

      <p
        className="text-center text-[10px] mt-5 tracking-wide"
        style={{ color: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.25)" }}
      >
        Advertisements help keep this platform free for everyone
      </p>
    </section>
  );
}