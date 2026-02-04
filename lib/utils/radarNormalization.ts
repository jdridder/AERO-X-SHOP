/**
 * AERO-X Intelligence Web - Data Normalization Utilities
 * Converts raw product stats to 0-1 scale for radar chart visualization
 */

export interface RadarDataPoint {
    axis: string;       // Display label (e.g., "WEIGHT")
    value: number;      // Normalized 0-1 value
    rawValue: string;   // Original display value (e.g., "85g")
    unit: string;       // Unit of measurement
}

/**
 * Normalize weight: 500g = 0 (worst), 0g = 1 (best)
 * Inverse scale: lighter is better
 */
export function normalizeWeight(grams: number): number {
    const min = 0;
    const max = 500;
    const clamped = Math.max(min, Math.min(max, grams));
    return 1 - (clamped - min) / (max - min); // Inverse
}

/**
 * Normalize temperature: -5°C = 0, 35°C = 1
 * Linear scale: higher operating range is better
 */
export function normalizeTemperature(celsius: number): number {
    const min = -5;
    const max = 35;
    const clamped = Math.max(min, Math.min(max, celsius));
    return (clamped - min) / (max - min);
}

/**
 * Normalize drag coefficient: 1.5 = 0 (worst), 0.5 = 1 (best)
 * Inverse scale: lower drag is better
 */
export function normalizeDragCoefficient(coefficient: number): number {
    const min = 0.5;
    const max = 1.5;
    const clamped = Math.max(min, Math.min(max, coefficient));
    return 1 - (clamped - min) / (max - min); // Inverse
}

/**
 * Normalize accommodation (discrete levels)
 * Casual = 0.25, Easy = 0.5, Hard = 0.75, Race = 1.0
 */
export function normalizeOccasion(level: string): number {
    const map: Record<string, number> = {
        casual: 0.25,
        easy: 0.5,
        hard: 0.75,
        race: 1.0,
    };
    return map[level.toLowerCase()] ?? 0.5; // Default to "easy"
}

/**
 * Normalize compression: 0 (Loose) = 0, 1 (Tight) = 1
 * Direct linear scale
 */
export function normalizeCompression(value: number): number {
    return Math.max(0, Math.min(1, value));
}

/**
 * Parse weight string to number (e.g., "85g" -> 85)
 */
function parseWeight(weightStr: string): number {
    const match = weightStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Parse drag coefficient string to number (e.g., "0.24" -> 0.24)
 */
function parseDragCoefficient(dragStr: string): number {
    return parseFloat(dragStr) || 0;
}

/**
 * Parse temperature string to number (e.g., "15°C" -> 15)
 */
function parseTemperature(tempStr: string): number {
    const match = tempStr.match(/(-?\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Main orchestrator: Convert product tech_stats to radar data points
 */
export function normalizeProductStats(stats: {
    weight?: string;
    drag_coefficient?: string;
    temperature?: string;
    occasion?: string;
    fit?: string;
}): RadarDataPoint[] {
    const dataPoints: RadarDataPoint[] = [];

    // Weight
    if (stats.weight) {
        const grams = parseWeight(stats.weight);
        dataPoints.push({
            axis: "WEIGHT",
            value: normalizeWeight(grams),
            rawValue: stats.weight,
            unit: "g",
        });
    }

    // Drag Coefficient
    if (stats.drag_coefficient) {
        const coefficient = parseDragCoefficient(stats.drag_coefficient);
        dataPoints.push({
            axis: "DRAG COEFFICIENT",
            value: normalizeDragCoefficient(coefficient),
            rawValue: stats.drag_coefficient,
            unit: "Cd",
        });
    }

    // Temperature
    if (stats.temperature) {
        const celsius = parseTemperature(stats.temperature);
        dataPoints.push({
            axis: "TEMP CONDITION",
            value: normalizeTemperature(celsius),
            rawValue: stats.temperature,
            unit: "°C",
        });
    }

    // Accommodation
    if (stats.occasion) {
        dataPoints.push({
            axis: "OCCASION",
            value: normalizeOccasion(stats.occasion),
            rawValue: stats.occasion,
            unit: "",
        });
    }

    // Compression
    if (stats.fit) {
        const compressionValue = parseFloat(stats.fit) || 0;
        dataPoints.push({
            axis: "FIT",
            value: normalizeCompression(compressionValue),
            rawValue: stats.fit,
            unit: "",
        });
    }

    return dataPoints;
}
