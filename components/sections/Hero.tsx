"use client";

import { Button } from "@/components/ui/Button";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

/* ─── Segment Data ──────────────────────────────────────────────────── */

const segments = [
  { id: "hybrid", label: "Hybrid Athletes", tag: "03", image: "/pictures/hybrid-couple-1204.jpg" },
  { id: "casual", label: "Casual Runners", tag: "02", image: "/pictures/casual-runners-1023.jpg" },
  { id: "track", label: "Track Athletes", tag: "01", image: "/pictures/track-athletes-1024.jpg" },
];

/* Premium cubic-bezier for weighted expansion */
const EXPAND_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EXPAND_DURATION = 0.7;

/* ─── Full-Bleed Card ────────────────────────────────────────────────── */

interface CardProps {
  seg: (typeof segments)[number];
  index: number;
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function HeroCard({ seg, index, hoveredIndex, onHover, scrollYProgress }: CardProps) {
  const isActive = hoveredIndex === index;
  const isIdle = hoveredIndex === null;

  /* ── Scroll-synced transforms ──────────────────────────────────── */

  /* Phase 1: holographic mesh bloom (scroll 0% → 40%) */
  const meshOpacity = 0
  const meshRadius = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const cardX = "0%"
  const cardOpacity = 1

  /* Chromatic aberration for label */
  const aberration = useTransform(scrollYProgress, [0, 1], [0, 8]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        flex: 1,
        x: cardX,
        willChange: "width, transform, opacity",
      }}
      transition={{ duration: EXPAND_DURATION, ease: EXPAND_EASE }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image layer */}
      <motion.div
        className="absolute inset-0"
      >
        <Image
          src={seg.image}
          alt={seg.label}
          fill
          sizes="50vw"
          className="object-cover"
          style={{
            filter: isActive ? "brightness(1.15)" : "brightness(1)",
            transition: "filter 0.5s ease",
          }}
          priority
        />
      </motion.div>

      {/* Gradient scrim */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none"
        style={{ opacity: 1 }}
      />

      {/* Holographic mesh overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: meshOpacity}}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(204,255,0,0.12) 19px, rgba(204,255,0,0.12) 20px),
                         repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(204,255,0,0.12) 19px, rgba(204,255,0,0.12) 20px)`,
            maskImage: useTransform(meshRadius, (v) =>
              `radial-gradient(circle, black ${v * 70}%, transparent ${v * 70 + 15}%)`
            ),
            WebkitMaskImage: useTransform(meshRadius, (v) =>
              `radial-gradient(circle, black ${v * 70}%, transparent ${v * 70 + 15}%)`
            ),
            filter: "drop-shadow(0 0 4px rgba(204,255,0,0.3))",
          }}
        />
      </motion.div>

      {/* Corner brackets — brighter when active */}
      {[
        "top-3 left-3 border-t border-l",
        "top-3 right-3 border-t border-r",
        "bottom-3 left-3 border-b border-l",
        "bottom-3 right-3 border-b border-r",
      ].map((pos) => (
        <span
          key={pos}
          className={`absolute w-5 h-5 ${pos} transition-colors duration-500 ${
            isActive ? "border-accent-b/60" : "border-white/10"
          }`}
        />
      ))}

      {/* Scanline */}
      <div
        className={`absolute left-0 right-0 h-px bg-accent-b/25 pointer-events-none animate-scanline transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Tag index (top-right) — visible when active */}
      <div
        className={`absolute top-4 right-5 font-mono text-[10px] tracking-[0.3em] text-accent-b/50 transition-opacity duration-500 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        {seg.tag}
      </div>

      {/* Label bar */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-10 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <motion.span
          className="font-mono text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.2em] uppercase text-white text-center px-4"
          style={{
            textShadow: useTransform(aberration, (v) =>
              v > 0.5
                ? `${v}px 0 rgba(255,0,0,0.7), ${-v}px 0 rgba(0,100,255,0.7), 0 0 ${v * 2}px rgba(255,255,255,0.3)`
                : "0 0 15px rgba(255,255,255,0.5)"
            ),
          }}
        >
          {seg.label}
        </motion.span>
        <motion.div
          className="mt-4 h-[2px] bg-accent-b shadow-[0_0_10px_rgba(204,255,0,0.5)]"
          transition={{ duration: 0.5, ease: EXPAND_EASE }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /* Phase for logo draw-in */
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPhase(v));

  /* Status + title dissolve */
  // const titleOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);
  // const titleY = useTransform(scrollYProgress, [0.8, 1], [0, -40]);
  // const titleBlur = useTransform(scrollYProgress, [0.8, 1], [0, 8]);
  const titleOpacity = 1
  const titleY = 0
  const titleBlur = 0

  /* Logo reveal */
  // const logoOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  // const logoScale = useTransform(scrollYProgress, [0.35, 0.6], [0.8, 1]);

  /* CTA reveal */
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0, 0.03], [300, 0]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-screen flex flex-col overflow-hidden" style={{ zIndex: 1 }}>
        {/* ── Background ──────────────────────────────────────────── */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_1%)] bg-[length:24px_24px] opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-a/[0.04] blur-[140px] rounded-full" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.008)_3px,rgba(255,255,255,0.008)_4px)] pointer-events-none" />
        </div>

        {/* ── Status line ─────────────────────────────────────────── */}
        <motion.div
          className="absolute top-[21%] left-1/2 -translate-x-1/2 z-100 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-b animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary">
            system online v0.0.4
          </span>
        </motion.div>

        {/* ── Title overlay ───────────────────────────────────────── */}
        <motion.div
          className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none"
          style={{
            opacity: titleOpacity,
            y: titleY,
            // filter: useTransform(titleBlur, (v) => `blur(${v}px)`),
          }}
        >
          <h1
            className="font-[family-name:var(--font-oxanium)] text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tight leading-[0.92]"
            style={{ color: "#ffffff"}}
          >
            PERFORMANCE RUNNING <span className="text-accent-a">APPAREL </span> FOR
          </h1>
        </motion.div>
        {/* ── Full-Bleed Card Wall ────────────────────────────────── */}
        {/* Desktop: horizontal flex with hover expansion */}
        <div className="hidden sm:flex relative z-10 w-full h-full">
          {segments.map((seg, i) => (
            <div key={seg.id} className="flex h-full" style={{ flex: 1, minWidth: 0 }}>
              {/* Hairline divider between cards */}
              {i > 0 && (
                <div className="w-px h-full bg-white/10 flex-shrink-0" />
              )}
              <HeroCard
                seg={seg}
                index={i}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                scrollYProgress={scrollYProgress}
              />
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack (no expansion) */}
        <div className="flex sm:hidden flex-col relative z-10 w-full flex-1 overflow-hidden">
          {segments.map((seg, i) => (
            <div key={seg.id} className="relative flex-1 overflow-hidden">
              {i > 0 && (
                <div className="h-px w-full bg-white/10 flex-shrink-0" />
              )}
              <MobileCard seg={seg} scrollYProgress={scrollYProgress} />
            </div>
          ))}
        </div>

        {/* ── CTA (always interactive, z-40) ──────────────────────── */}
        <motion.div
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-40"
        >
          <Link href="/shop">
            <Button size="lg" className="group" variant="accent">
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="absolute bottom-[21%] left-1/2 -translate-x-1/2 z-100 flex items-center gap-2"
        >
          <span className="font-mono text-[12px] tracking-[0.1em] uppercase text-primary">
            free shipping
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Mobile Card (no expansion, simplified) ─────────────────────────── */

function MobileCard({
  seg,
  scrollYProgress,
}: {
  seg: (typeof segments)[number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const imageOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.6, 0.85], [1, 0]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity: cardOpacity }}>
      <motion.div className="absolute inset-0" style={{ opacity: imageOpacity }}>
        <Image src={seg.image} alt={seg.label} fill sizes="100vw" className="object-cover" priority />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-6 pt-10 bg-gradient-to-t from-black/80 to-transparent">
        <span className="font-mono text-lg font-black tracking-[0.2em] uppercase text-white text-center">
          {seg.label}
        </span>
        <div className="mt-3 h-[2px] w-8 bg-accent-b shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
      </div>
    </motion.div>
  );
}

/* ─── Logo with draw-in + glitch ─────────────────────────────────────── */

interface LogoProps {
  className?: string;
  strokeProgress: number;
  fillOpacity: number;
  glitchActive: boolean;
}

function WaspLogoDrawIn({ className, strokeProgress, fillOpacity, glitchActive }: LogoProps) {
  const paths = [
    { d: "M743.501,510.678L557.27,442.069L759.208,595.22L743.501,510.678Z", transform: "matrix(3.50785,-1.06912e-16,-4.35719e-17,0.97758,-1704.95,-13.997)", len: 600, sw: 3 },
    { d: "M743.501,510.678L557.27,442.069L759.208,595.22L743.501,510.678Z", transform: "matrix(3.50785,1.06912e-16,-4.35719e-17,-0.97758,-1704.95,612.358)", len: 600, sw: 3 },
    { d: "M560.167,360.421 h168.368 v168.368 h-168.368 z", transform: "matrix(0.532154,-0.532154,0.532154,0.532154,-193.794,405.219)", len: 674, sw: 4 },
    { d: "M343.406,288.174L301.611,246.379L228.023,319.968L301.611,393.557L343.406,351.762L311.611,319.968L343.406,288.174Z", transform: "matrix(1.28161,0,0,1.28161,-134.054,-111.15)", len: 450, sw: 3 },
    { d: "M479.269,426.537L692.569,374.353L479.269,322.135L454.04,345.708L482.668,374.336L454.032,402.972L479.269,426.537Z", transform: "matrix(1.76382,0,0,1.77078,-345.826,-363.943)", len: 700, sw: 2 },
  ];

  return (
    <div className="relative">
      {/* Chromatic glitch layers */}
      {glitchActive && (
        <>
          <svg className={`${className} absolute inset-0 opacity-30`} viewBox="0 0 1050 1050" fill="none" style={{ transform: "translate(3px, -2px)" }}>
            <g transform="translate(-1166.45,-1178.85)"><g transform="matrix(1.02539,0,0,1.02539,-72.786,1178.85)"><g transform="matrix(0.893963,0,0,0.901582,1221.53,242.264)">
              {paths.map((p, i) => (
                <g key={`r-${i}`} transform={p.transform}>
                  <path d={p.d} stroke="rgba(255,0,0,0.8)" strokeWidth={p.sw} fill="none" strokeLinejoin="round" strokeDasharray={p.len} strokeDashoffset={strokeProgress * p.len} />
                </g>
              ))}
            </g></g></g>
          </svg>
          <svg className={`${className} absolute inset-0 opacity-30`} viewBox="0 0 1050 1050" fill="none" style={{ transform: "translate(-3px, 2px)" }}>
            <g transform="translate(-1166.45,-1178.85)"><g transform="matrix(1.02539,0,0,1.02539,-72.786,1178.85)"><g transform="matrix(0.893963,0,0,0.901582,1221.53,242.264)">
              {paths.map((p, i) => (
                <g key={`b-${i}`} transform={p.transform}>
                  <path d={p.d} stroke="rgba(0,100,255,0.8)" strokeWidth={p.sw} fill="none" strokeLinejoin="round" strokeDasharray={p.len} strokeDashoffset={strokeProgress * p.len} />
                </g>
              ))}
            </g></g></g>
          </svg>
        </>
      )}

      {/* Main logo */}
      <svg className={className} viewBox="0 0 1050 1050" fill="none">
        <g transform="translate(-1166.45,-1178.85)"><g transform="matrix(1.02539,0,0,1.02539,-72.786,1178.85)"><g transform="matrix(0.893963,0,0,0.901582,1221.53,242.264)">
          {paths.map((p, i) => (
            <g key={i} transform={p.transform}>
              <path
                d={p.d}
                stroke="#ccff00"
                strokeWidth={p.sw}
                strokeLinejoin="round"
                fill={fillOpacity > 0 ? "#ccff00" : "none"}
                fillOpacity={fillOpacity}
                strokeDasharray={p.len}
                strokeDashoffset={strokeProgress * p.len}
                style={{ filter: "drop-shadow(0 0 6px rgba(204,255,0,0.4))" }}
              />
            </g>
          ))}
        </g></g></g>
      </svg>
    </div>
  );
}
