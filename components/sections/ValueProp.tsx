"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { Rose, Rotate3D, Thermometer, Zap } from "lucide-react";

const features = [
    {
        title: "AURA BOOST",
        value: "+24.2 %",
        unit: "INCREASED AURA",
        description: "Use of subtle, energizing color therapy to mentally sharpen your focus and elevate your mood on the run.",
        icon: Rose,
        colSpan: "col-span-1 md:col-span-2",
    },
    {
        title: "WARMING/COOLING REGULATOR",
        value: "1.5 K",
        unit: "SKIN TEMPERATURE MODULATION",
        description: "Features intelligent fabric that adapts to your body's temperature, actively generating warmth when cold and releasing heat when you overheat.",
        icon: Thermometer,
        colSpan: "col-span-1",
    },
    {
        title: "NEXT DIMENSION HOLOGRAPHS",
        value: "3D",
        unit: "SIZE VISUALIZATION",
        description: "Anatomical constructions that present our size guides including immersive descriptions and visuals.",
        icon: Rotate3D,
        colSpan: "col-span-1",
    },
    {
        title: "DRY EFFECT",
        value: "2.26 kJ/mL",
        unit: "COOLING BY EVAPORATION",
        description: "Enhanced Lycra fabric allows for phase change of sweat at the fabric-air boundary layer to keep your skin dry and comfortable, mile after mile.",
        icon: Zap,
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
