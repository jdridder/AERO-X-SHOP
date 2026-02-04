"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight } from "lucide-react";

const articles = [
    {
        id: "001",
        category: "AERODYNAMICS",
        title: "Boundary Layer Manipulation via Surface Texturing",
        date: "2025.10.12",
        abstract: "Investigating the effects of hexagonal micro-structures on turbulent wake reduction at various Reynolds numbers.",
    },
    {
        id: "002",
        category: "MATERIALS",
        title: "Phase-Change Textiles for Metabolic Heat Regulation",
        date: "2025.09.28",
        abstract: "Integration of encapsulated paraffin wax within polymer matrices to buffer skin temperature fluctuations.",
    },
    {
        id: "003",
        category: "BIOMECHANICS",
        title: "Kinetic Energy Return in compression garments",
        date: "2025.09.15",
        abstract: "Quantifying the elastic potential energy storage and release in zoned compression textiles during sprinting.",
    },
    {
        id: "004",
        category: "DATA ANALYSIS",
        title: "AERO-X Project: Initial Wind Tunnel Findings",
        date: "2025.08.30",
        abstract: "Comparative analysis of standard competition gear vs. AERO-X prototypes in controlled wind tunnel environments.",
    }
];

export default function LabPage() {
    return (
        <div className="container mx-auto px-4 py-32 min-h-screen">
            <div className="flex flex-col gap-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-primary/20 pb-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-accent-b font-mono text-xs tracking-widest">ARCHIVE_ACCESS_GRANTED</span>
                        <h1 className="font-headline text-5xl md:text-7xl font-bold">THE LAB</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" size="sm">ALL</Button>
                        <Button variant="ghost" size="sm">AERODYNAMICS</Button>
                        <Button variant="ghost" size="sm">MATERIALS</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {articles.map((article) => (
                        <GlassPanel key={article.id} className="group cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <span className="font-mono text-xs text-accent-a">{article.category}</span>
                                <span className="font-mono text-xs text-primary/40">{article.date}</span>
                            </div>
                            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4 group-hover:text-white transition-colors">
                                {article.title}
                            </h2>
                            <p className="font-mono text-sm text-primary/60 mb-6 leading-relaxed">
                                {article.abstract}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-primary/80 group-hover:text-accent-b transition-colors">
                                READ_PAPER <ArrowUpRight className="w-3 h-3" />
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            </div>
        </div>
    );
}
