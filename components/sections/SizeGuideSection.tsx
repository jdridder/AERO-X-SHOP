"use client";

import { SizeGuide } from "@/components/3d/SizeGuide";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MeasurementDef, ProductAnnotation, SizeEntry } from "@/lib/services/api";
import { motion } from "framer-motion";
import { useState } from "react";
import { Ruler } from "lucide-react";

interface SizeGuideSectionProps {
    modelPath?: string;
    annotations?: ProductAnnotation[];
    measurements?: MeasurementDef[];
    availableSizes?: SizeEntry[];
}

const DEFAULT_SIZE_CHART: SizeEntry[] = [
    { size: "XS", measurements: { chest: '32-34"', length: '26"', sleeve: '7.5"' } },
    { size: "S", measurements: { chest: '34-36"', length: '27"', sleeve: '8"' } },
    { size: "M", measurements: { chest: '38-40"', length: '28"', sleeve: '8.5"' } },
    { size: "L", measurements: { chest: '42-44"', length: '29"', sleeve: '9"' } },
    { size: "XL", measurements: { chest: '46-48"', length: '30"', sleeve: '9.5"' } },
    { size: "XXL", measurements: { chest: '50-52"', length: '31"', sleeve: '10"' } },
];

const DEFAULT_ANNOTATIONS: ProductAnnotation[] = [
    { id: "chest", label: "A", value: "CHEST" },
    { id: "length", label: "B", value: "LENGTH" },
    { id: "sleeve", label: "C", value: "SLEEVE" },
];

export function SizeGuideSection({ modelPath, annotations, measurements, availableSizes }: SizeGuideSectionProps) {
    const [isReady, setIsReady] = useState(false);
    const sizeChart = availableSizes ?? DEFAULT_SIZE_CHART;
    const annotationData = annotations ?? DEFAULT_ANNOTATIONS;
    const [selectedSize, setSelectedSize] = useState(sizeChart[Math.min(2, sizeChart.length - 1)]?.size ?? "M");

    // Build annotation lookup: id -> { label, value }
    const annotationMap = new Map(annotationData.map((a) => [a.id, a]));

    // Get measurement keys from the first size entry
    const measurementKeys = sizeChart.length > 0 ? Object.keys(sizeChart[0].measurements) : [];

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
                annotations={annotationData}
                measurements={measurements}
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
                        {sizeChart.map((entry) => (
                            <button
                                key={entry.size}
                                onClick={() => setSelectedSize(entry.size)}
                                className={`
                                    py-2 px-3 rounded-md font-mono text-xs font-bold
                                    transition-all duration-300 border
                                    ${selectedSize === entry.size
                                        ? "bg-accent-b/20 border-accent-b text-accent-b shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                                        : "bg-transparent border-primary/20 text-primary/60 hover:border-accent-a/40 hover:text-primary"
                                    }
                                `}
                            >
                                {entry.size}
                            </button>
                        ))}
                    </div>

                    {/* Selected Size Measurements */}
                    <div className="space-y-2">
                        {sizeChart
                            .filter((s) => s.size === selectedSize)
                            .map((entry) => (
                                <div key={entry.size} className="space-y-2">
                                    {measurementKeys.map((key, idx) => {
                                        const annotation = annotationMap.get(key);
                                        const displayLabel = annotation
                                            ? `${annotation.label}: ${annotation.value}`
                                            : key.toUpperCase();
                                        return (
                                            <div
                                                key={key}
                                                className={`flex justify-between items-center py-2 ${
                                                    idx < measurementKeys.length - 1 ? "border-b border-primary/10" : ""
                                                }`}
                                            >
                                                <span className="font-mono text-[10px] text-primary/50 tracking-wider">
                                                    {displayLabel}
                                                </span>
                                                <span className="font-mono text-sm text-accent-b font-bold">
                                                    {entry.measurements[key]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                    </div>

                    {/* Pro Tip */}
                    <div className="mt-4 p-3 bg-accent-a/5 border border-accent-a/20 rounded-md">
                        <p className="font-mono text-[9px] text-primary/40 leading-relaxed">
                            <span className="text-accent-a">PRO TIP:</span> For optimal aerodynamic performance,
                            select a size that allows 1-2&quot; of ease across the primary measurement.
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
                        {annotationData.map((a, i) => (
                            <span key={a.id}>
                                {i > 0 && " \u00B7 "}
                                <span className="text-accent-b">{a.label}</span> {a.value}
                            </span>
                        ))}
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
