"use client";

import { SizeGuide } from "@/components/3d/SizeGuide";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { motion } from "framer-motion";
import { useState } from "react";
import { Ruler } from "lucide-react";

interface SizeGuideSectionProps {
    modelPath?: string;
}

const SIZE_CHART = [
    { size: "XS", chest: '32-34"', length: '26"', sleeve: '7.5"' },
    { size: "S", chest: '34-36"', length: '27"', sleeve: '8"' },
    { size: "M", chest: '38-40"', length: '28"', sleeve: '8.5"' },
    { size: "L", chest: '42-44"', length: '29"', sleeve: '9"' },
    { size: "XL", chest: '46-48"', length: '30"', sleeve: '9.5"' },
    { size: "XXL", chest: '50-52"', length: '31"', sleeve: '10"' },
];

export function SizeGuideSection({ modelPath }: SizeGuideSectionProps) {
    const [isReady, setIsReady] = useState(false);
    const [selectedSize, setSelectedSize] = useState("M");

    return (
        <section
            className="size-guide-section relative"
            data-section="size-guide"
        >
            {/* Background Title */}
            <div className="size-guide-title">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    Size Guide
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Holographic Measurement System
                </motion.p>
            </div>

            {/* 3D Size Guide Hologram */}
            <SizeGuide
                modelPath={modelPath}
                onReady={() => setIsReady(true)}
            />

            {/* Size Selection Panel */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: isReady ? 1 : 0, x: isReady ? 0 : 30 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
            >
                <GlassPanel className="w-64 p-4 holographic-glow">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/20">
                        <Ruler className="w-4 h-4 text-accent-b" />
                        <h3 className="font-mono text-xs tracking-widest text-accent-b uppercase">
                            Select Size
                        </h3>
                    </div>

                    {/* Size Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {SIZE_CHART.map((item) => (
                            <button
                                key={item.size}
                                onClick={() => setSelectedSize(item.size)}
                                className={`
                                    py-2 px-3 rounded-md font-mono text-xs font-bold
                                    transition-all duration-300 border
                                    ${selectedSize === item.size
                                        ? "bg-accent-b/20 border-accent-b text-accent-b shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                                        : "bg-transparent border-primary/20 text-primary/60 hover:border-accent-a/40 hover:text-primary"
                                    }
                                `}
                            >
                                {item.size}
                            </button>
                        ))}
                    </div>

                    {/* Selected Size Details */}
                    <div className="space-y-2">
                        {SIZE_CHART.filter(s => s.size === selectedSize).map((item) => (
                            <div key={item.size} className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                    <span className="font-mono text-[10px] text-primary/50 tracking-wider">A: CHEST</span>
                                    <span className="font-mono text-sm text-accent-b font-bold">{item.chest}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                    <span className="font-mono text-[10px] text-primary/50 tracking-wider">B: LENGTH</span>
                                    <span className="font-mono text-sm text-accent-b font-bold">{item.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-mono text-[10px] text-primary/50 tracking-wider">C: SLEEVE</span>
                                    <span className="font-mono text-sm text-accent-b font-bold">{item.sleeve}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pro Tip */}
                    <div className="mt-4 p-3 bg-accent-a/5 border border-accent-a/20 rounded-md">
                        <p className="font-mono text-[9px] text-primary/40 leading-relaxed">
                            <span className="text-accent-a">PRO TIP:</span> For optimal aerodynamic performance,
                            select a size that allows 1-2&quot; of ease across the chest.
                        </p>
                    </div>
                </GlassPanel>
            </motion.div>

            {/* Mobile Size Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 lg:hidden"
            >
                <GlassPanel className="px-6 py-3 holographic-glow">
                    <p className="font-mono text-xs text-primary/60 text-center">
                        <span className="text-accent-b">A</span> Chest &middot;{" "}
                        <span className="text-accent-b">B</span> Length &middot;{" "}
                        <span className="text-accent-b">C</span> Sleeve
                    </p>
                </GlassPanel>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                viewport={{ once: true }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-accent-b/50 to-transparent animate-pulse" />
                <span className="font-mono text-[8px] text-primary/30 tracking-widest">SCROLL</span>
            </motion.div>
        </section>
    );
}
