"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadarDataPoint, normalizeProductStats } from "@/lib/utils/radarNormalization";
import { cn } from "@/lib/utils";

interface PerformanceRadarProps {
    stats: {
        weight?: string;
        drag_coefficient?: string;
        temperature?: string;
        occasion?: string;
        compression?: string;
    };
    className?: string;
    size?: number;
}

const AXIS_LABELS = ["WEIGHT", "DRAG COEFFICIENT", "TEMP CONDITION", "OCCASION", "FIT"];

export function PerformanceRadar({ stats, className, size = 400 }: PerformanceRadarProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const dataPoints = useMemo(() => {
        const normalized = normalizeProductStats(stats);
        // Ensure we always have 5 points in the correct order for the radar polygon
        const orderedPoints: RadarDataPoint[] = AXIS_LABELS.map(label => {
            const found = normalized.find(p => p.axis === label);
            if (found) return found;

            // Fallback for missing data
            return {
                axis: label,
                value: 0.1, // Minimum floor for visual structure
                rawValue: "N/A",
                unit: ""
            };
        });
        return orderedPoints;
    }, [stats]);

    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / dataPoints.length;

    // Helper to calculate coordinates
    const getCoordinates = (index: number, value: number, offsetRadius = radius) => {
        const angle = index * angleStep - Math.PI / 2;
        return {
            x: center + Math.cos(angle) * (value * offsetRadius),
            y: center + Math.sin(angle) * (value * offsetRadius),
        };
    };

    // Grid lines (Pentagon structure)
    const gridLevels = [0.25, 0.5, 0.75, 1];
    const gridPaths = gridLevels.map((level) => {
        return dataPoints.map((_, i) => {
            const coords = getCoordinates(i, level);
            return `${i === 0 ? "M" : "L"} ${coords.x} ${coords.y}`;
        }).join(" ") + " Z";
    });

    // Axis lines
    const axisLines = dataPoints.map((_, i) => {
        const end = getCoordinates(i, 1);
        return { x1: center, y1: center, x2: end.x, y2: end.y };
    });

    // Data polygon path
    const polygonPath = dataPoints.map((p, i) => {
        const coords = getCoordinates(i, p.value);
        return `${i === 0 ? "M" : "L"} ${coords.x} ${coords.y}`;
    }).join(" ") + " Z";

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                <defs>
                    <linearGradient id="polyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4d4dff" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ccff00" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid Structure */}
                <g className="stroke-primary/10 fill-none">
                    {gridPaths.map((path, i) => (
                        <path key={i} d={path} strokeWidth="0.5" />
                    ))}
                    {axisLines.map((line, i) => (
                        <line key={i} {...line} strokeWidth="0.5" />
                    ))}
                </g>

                {/* Data Polygon */}
                <motion.path
                    d={polygonPath}
                    fill="url(#polyGradient)"
                    stroke="#ccff00"
                    strokeWidth="2"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0, scale: 0 }}
                    animate={{ pathLength: 1, opacity: 1, scale: 1 }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        scale: { type: "spring", stiffness: 100, damping: 15 }
                    }}
                    style={{ transformOrigin: `${center}px ${center}px` }}
                />

                {/* Vertices & Interaction Planes */}
                {dataPoints.map((p, i) => {
                    const coords = getCoordinates(i, p.value);
                    const labelCoords = getCoordinates(i, 1.15, radius); // Push labels out
                    const isHovered = hoveredIndex === i;

                    return (
                        <g key={i}>
                            {/* Hover Pulse Effect */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.circle
                                        cx={coords.x}
                                        cy={coords.y}
                                        initial={{ r: 4, opacity: 0.8 }}
                                        animate={{ r: 12, opacity: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="fill-accent-b"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Point Dot */}
                            <circle
                                cx={coords.x}
                                cy={coords.y}
                                r={isHovered ? 4 : 2}
                                className={cn("transition-all duration-300", isHovered ? "fill-white" : "fill-accent-b")}
                            />

                            {/* Axis Label */}
                            <text
                                x={labelCoords.x}
                                y={labelCoords.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-primary/60 font-mono text-[10px] uppercase tracking-tighter"
                                style={{ pointerEvents: "none" }}
                            >
                                {p.axis}
                            </text>

                            {/* Invisible interaction area */}
                            <circle
                                cx={coords.x}
                                cy={coords.y}
                                r={20}
                                fill="transparent"
                                className="cursor-crosshair"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Technical Tooltip */}
            <AnimatePresence>
                {hoveredIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                    >
                        <div className="bg-black/80 backdrop-blur-md border border-accent-b/40 px-3 py-1.5 rounded flex flex-col items-center">
                            <span className="text-[9px] text-primary/40 font-mono uppercase">
                                {dataPoints[hoveredIndex].axis}
                            </span>
                            <span className="text-sm text-accent-b font-mono font-bold">
                                {dataPoints[hoveredIndex].rawValue}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
