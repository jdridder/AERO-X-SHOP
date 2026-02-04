"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { Wind, Thermometer, Zap, Shield } from "lucide-react";

const features = [
    {
        title: "AERO EFFICIENCY",
        value: "-14.2%",
        unit: "CdA REDUCTION",
        description: "Computational Fluid Dynamics optimized surface texturing reduces turbulent wake.",
        icon: Wind,
        colSpan: "col-span-1 md:col-span-2",
    },
    {
        title: "THERMAL REGULATION",
        value: "3.5°C",
        unit: "CORE COOLING",
        description: "Active phase-change material matrix adapts to metabolic heat output.",
        icon: Thermometer,
        colSpan: "col-span-1",
    },
    {
        title: "KINETIC RETURN",
        value: "15J",
        unit: "PER STRIDE",
        description: "Elastic compression zones store and release kinetic energy.",
        icon: Zap,
        colSpan: "col-span-1",
    },
    {
        title: "IMPACT SHIELD",
        value: "UPF 50+",
        unit: "RADIATION BLOCK",
        description: "Molecular ceramic coating provides weightless UV and abrasion protection.",
        icon: Shield,
        colSpan: "col-span-1 md:col-span-2",
    },
];

export function ValueProp() {
    return (
        <section className="relative w-full py-24 md:py-32 px-4 container mx-auto">
            <div className="flex flex-col gap-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/20 pb-8">
                    <div>
                        <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tighter">PERFORMANCE<br />METRICS</h2>
                    </div>
                    <div className="font-mono text-xs text-accent-b max-w-xs text-right">
                        Verified by Wasp Aerodynamics Lab<br />
                        Dataset: AERO-X-2025
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <GlassPanel key={idx} className={cn("flex flex-col justify-between gap-6 hover:bg-white/5 transition-colors group", feature.colSpan)}>
                            <div className="flex justify-between items-start">
                                <feature.icon className="w-8 h-8 text-primary/40 group-hover:text-accent-a transition-colors" />
                                <span className="font-mono text-[10px] text-primary/40 border p-1 rounded border-primary/20 bg-black/20">DATA PINT #{idx + 1}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-headline text-4xl md:text-5xl font-bold text-primary group-hover:text-white transition-colors">
                                        {feature.value}
                                    </span>
                                    <span className="font-mono text-xs text-accent-b font-bold">{feature.unit}</span>
                                </div>
                                <h3 className="font-bold text-lg tracking-wide">{feature.title}</h3>
                                <p className="text-sm text-primary/60 font-mono leading-relaxed max-w-md">{feature.description}</p>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            </div>
        </section>
    );
}
