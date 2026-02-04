import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassPanelProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

export function GlassPanel({ children, className, style }: GlassPanelProps) {
    return (
        <div className={cn("glass-panel rounded-2xl p-6", className)} style={style}>
            {children}
        </div>
    );
}
