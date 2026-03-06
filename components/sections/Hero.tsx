"use client";

import { Button } from "@/components/ui/Button";
import {
  motion
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";


/* ─── Hero ───────────────────────────────────────────────────────────── */

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* Phase for logo draw-in */
  const titleOpacity = 1
  const titleY = 0


  return (
    <div ref={containerRef} className="relative h-[100vh]">
      <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ zIndex: 1 }}>
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
          className="absolute top-[38.2%] left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none"
          style={{
            opacity: titleOpacity,
            y: titleY,
          }}
        >
          <h1
            className="font-[family-name:var(--font-oxanium)] text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tight leading-[0.92]"
            style={{ color: "#ffffff"}}
          >
            PERFORMANCE RUNNING <span className="text-accent-a">APPAREL </span> FOR
          </h1>
        </motion.div>
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
