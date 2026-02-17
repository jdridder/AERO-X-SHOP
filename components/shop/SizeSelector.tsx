"use client";

import { SizeEntry } from "@/lib/services/api";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
    sizes: SizeEntry[];
    selectedSize: string | null;
    onSizeChange: (size: string) => void;
    compact?: boolean;
}

export function SizeSelector({ sizes, selectedSize, onSizeChange, compact }: SizeSelectorProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
            {sizes.map((entry) => (
                <button
                    key={entry.size}
                    onClick={() => onSizeChange(entry.size)}
                    className={cn(
                        "font-mono h3 font-bold transition-all duration-300 border rounded-md",
                        compact ? "py-1.5 px-2" : "py-1.5 px-2",
                        selectedSize === entry.size
                            ? "bg-accent-b/20 border-accent-b text-accent-b shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                            : "bg-transparent border-primary/20 text-primary/60 hover:border-accent-a/40 hover:text-primary"
                    )}
                >
                    {entry.size}
                </button>
            ))}
        </div>
    );
}
