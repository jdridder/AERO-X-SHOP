"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-full bg-white/5" />
        );
    }

    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 overflow-hidden",
                isDark
                    ? "bg-accent-b/10 hover:bg-accent-b/20 border border-accent-b/20"
                    : "bg-accent-a/10 hover:bg-accent-a/20 border border-accent-a/20"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
        >
            {/* Animated Glow Effect */}
            <motion.div
                className={cn(
                    "absolute inset-0 rounded-full opacity-0",
                    isDark ? "bg-accent-b/20" : "bg-accent-a/20"
                )}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Icon Container with Morphing Animation */}
            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.3, ease: "backOut" }}
                        >
                            <Moon className="w-5 h-5 text-accent-b" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, rotate: 90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -90 }}
                            transition={{ duration: 0.3, ease: "backOut" }}
                        >
                            <Sun className="w-5 h-5 text-accent-a" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
