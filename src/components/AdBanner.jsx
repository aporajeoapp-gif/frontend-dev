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

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // smooth "ease-out-expo" feel

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
      className="group relative shrink-0 w-[290px] mx-2.5 flex flex-col overflow-hidden rounded-2xl select-none"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.88)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        backdropFilter: "blur(12px)",
        boxShadow: dark
          ? "0 4px 24px rgba(0,0,0,0.35)"
          : "0 4px 18px rgba(15,23,42,0.06)",
        transform: "translateY(0) scale(1)",
        transition: `transform 0.45s ${EASE}, box-shadow 0.45s ${EASE}, border-color 0.45s ${EASE}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.015)";
        e.currentTarget.style.boxShadow = dark
          ? "0 16px 40px rgba(0,0,0,0.5)"
          : "0 16px 36px rgba(15,23,42,0.14)";
        e.currentTarget.style.borderColor = dark
          ? "rgba(255,255,255,0.16)"
          : "rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = dark
          ? "0 4px 24px rgba(0,0,0,0.35)"
          : "0 4px 18px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = dark
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.06)";
      }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden rounded-t-2xl pointer-events-none bg-slate-100 dark:bg-slate-800">
        {ad.image || ad.imageUrl ? (
          <img
            src={ad.image || ad.imageUrl}
            alt={ad.title}
            draggable={false}
            className="w-full h-full object-cover"
            style={{ transition: `transform 0.7s ${EASE}` }}
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
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white"
            style={{
              background: accent,
              transition: `gap 0.3s ${EASE}, transform 0.3s ${EASE}`,
            }}
          >
            {ad.cta}
            <span
              className="inline-block"
              style={{ transition: `transform 0.3s ${EASE}` }}
            >
              →
            </span>
          </span>
        </div>
      </div>

      {/* Hover inset glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${accent}55`,
          transition: `opacity 0.45s ${EASE}`,
        }}
      />
    </a>
  );
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const AUTO_SPEED = 32;    // px/s target cruise speed
const VEL_SMOOTH = 0.085; // per-16.67ms lerp factor toward target velocity (higher = snappier)
const MAX_DT     = 50;    // ms — cap to avoid jumps after tab-hide

/* ── Marquee track ──────────────────────────────────────────────────────── */
function MarqueeTrack({ dark, ads }) {
  const containerRef = useRef(null);
  const trackRef      = useRef(null);
  const posRef        = useRef(0);
  const halfWRef      = useRef(0);
  const rafRef        = useRef(null);
  const initializedRef = useRef(false);

  const hoveredRef  = useRef(false);
  const pressingRef = useRef(false);
  const didDragRef  = useRef(false);
  const startXRef   = useRef(0);
  const lastXRef    = useRef(0);
  const lastTRef    = useRef(0);
  const velRef      = useRef(0); // px/ms, unified drag + auto-scroll velocity
  const prevTRef    = useRef(null);

  const tripled = [...ads, ...ads, ...ads];

  /* Recompute layout whenever ad set changes (fixes async-loaded ads) */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || ads.length === 0) return;
    const raf = requestAnimationFrame(() => {
      halfWRef.current = track.scrollWidth / 3;
      if (!initializedRef.current) {
        posRef.current = -halfWRef.current;
        initializedRef.current = true;
      }
      track.style.transform = `translateX(${posRef.current}px)`;
    });
    return () => cancelAnimationFrame(raf);
  }, [ads.length]);

  /* Main animation loop */
  useEffect(() => {
    const step = (ts) => {
      const dt = prevTRef.current !== null
        ? Math.min(ts - prevTRef.current, MAX_DT)
        : 0;
      prevTRef.current = ts;

      const half = halfWRef.current;

      if (!pressingRef.current && dt > 0) {
        const target = hoveredRef.current ? 0 : -(AUTO_SPEED / 1000);
        // Smooth, framerate-independent lerp toward target velocity —
        // handles flick-momentum decay AND hover pause/resume in one motion.
        const t = 1 - Math.pow(1 - VEL_SMOOTH, dt / 16.67);
        velRef.current += (target - velRef.current) * t;
        posRef.current += velRef.current * dt;
      }

      if (half > 0) {
        if (posRef.current <= -half * 2) posRef.current += half;
        if (posRef.current > -half)      posRef.current -= half;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Non-passive touchmove so preventDefault reliably stops page scroll */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e) => {
      const t  = e.touches[0];
      const dx = Math.abs(t.clientX - startXRef.current);
      const dy = Math.abs(t.clientY - touchStartYRef.current);

      if (!isHorizRef.current && dy > dx) {
        onEnd();
        return;
      }
      isHorizRef.current = true;
      e.preventDefault();
      onMove(t.clientX);
    };

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, []);

  const onStart = (clientX) => {
    pressingRef.current = true;
    didDragRef.current  = false;
    startXRef.current   = clientX;
    lastXRef.current    = clientX;
    lastTRef.current    = performance.now();
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  const onMove = (clientX) => {
    if (!pressingRef.current) return;
    const now = performance.now();
    const dx  = clientX - lastXRef.current;
    const dt  = now - lastTRef.current || 1;

    if (Math.abs(clientX - startXRef.current) > 4) didDragRef.current = true;

    posRef.current  += dx;
    velRef.current   = dx / dt; // becomes the starting point for the eased coast-down
    lastXRef.current = clientX;
    lastTRef.current = now;
  };

  const onEnd = () => {
    pressingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  };

  const touchStartYRef = useRef(0);
  const isHorizRef     = useRef(false);

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    isHorizRef.current     = false;
    onStart(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-hidden w-full py-3 select-none"
      style={{ cursor: "grab", touchAction: "pan-y" }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; onEnd(); }}
      onMouseDown={(e) => { e.preventDefault(); onStart(e.clientX); }}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onTouchStart={handleTouchStart}
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
    fetchAds({ status: "active" });
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
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
