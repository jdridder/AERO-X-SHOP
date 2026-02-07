"use client";

import { motion } from "framer-motion";

export default function IdentityPage() {
    return (
        <div className="container mx-auto px-4 py-32 min-h-screen flex flex-col items-center">
            <div className="max-w-3xl w-full flex flex-col gap-24">

                {/* Chapter 1 */}
                <section className="flex flex-col gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="font-mono text-accent-b text-xs tracking-widest">CHAPTER 01: GENESIS</span>
                        <h1 className="font-headline text-5xl md:text-7xl font-bold mt-2">BORN IN THE<br />WIND TUNNEL</h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-mono text-sm md:text-base text-primary/70 leading-relaxed indent-12"
                    >
                        Wasp Aerodynamics began not as a fashion brand, but as a skunkworks project within the Technical University of Dortmund's chemical engineering division.
                        The hypothesis was simple: human runners generate turbulent wakes similar to aircraft fuselages.
                        By applying boundary layer control theory to textiles, we could reduce drag and increase speed.
                    </motion.p>
                </section>

                {/* Chapter 2 */}
                <section className="flex flex-col gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="font-mono text-accent-a text-xs tracking-widest">CHAPTER 02: THE ALGORITHM</span>
                        <h2 className="font-headline text-4xl md:text-6xl font-bold mt-2">DATA DRIVEN<br />DESIGN</h2>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-mono text-sm md:text-base text-primary/70 leading-relaxed indent-12"
                    >
                        Every seam, every texture, and every silhouette is dictated.
                        We don't sketch; we engineer. The result is AERO-X—a design language spoken in science.
                    </motion.p>
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-12" />

                <div className="text-center font-mono text-xs text-primary/40">
                    EST. 2024 — DORTMUND
                </div>

            </div>
        </div>
    );
}
