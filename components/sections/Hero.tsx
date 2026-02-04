"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-canvas z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_1%)] bg-[length:24px_24px] opacity-[0.03]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-a/5 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2"
                >
                    <span className="text-accent-b font-mono text-xs tracking-[0.2em] uppercase">
                        System Online: v0.0.1
                    </span>
                    <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        WASP
                        <span className="block text-1xl md:text-6xl text-primary/80 mt-2">AERODYNAMICS</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="max-w-xl text-primary/60 font-mono text-sm md:text-base leading-relaxed"
                >
                    Engineering the future of human running. <br />
                    Advanced apparel for elite track performance.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Link href="/shop">
                        <Button size="lg" className="group">
                            Explore Collection
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section >
    );
}
