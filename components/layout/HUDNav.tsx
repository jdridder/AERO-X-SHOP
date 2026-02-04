"use client";

import { useState, useRef, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/lib/store/useCart";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, ShoppingBag, Activity, Home, Package, User, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HUDNav() {
    const pathname = usePathname();
    const { isAuthenticated, isLoading, user, authPath } = useAuth();

    const navItems = [
        { name: "HOME", path: "/", icon: Home },
        { name: "SHOP", path: "/shop", icon: Package },
        { name: "LAB", path: "/lab", icon: Activity },
        { name: "MISSION", path: "/identity", icon: Hexagon },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
            {/* Two-Tier Command Center */}
            <div className="flex flex-col gap-3">
                {/* TIER 1: Brand Anchor (Top) */}
                <GlassPanel
                    className="flex items-center justify-between py-2 px-6 rounded-full border-primary/20 backdrop-blur-xl shadow-[var(--hud-shadow)]"
                    style={{ background: 'var(--hud-bg)' }}
                >
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Image src="/logos/wasp-logo-black.svg"
                                alt="Wasp Aerodynamics Logo"
                                width={48}
                                height={48}
                                className="invert-0 dark:invert transition-all duration-300" />
                        </Link>
                        <span className="font-headline font-bold text-sm tracking-widest text-white">WASP COCKPIT</span>
                    </div>

                    {/* Active Pilot Indicator */}
                    <ActivePilotIndicator
                        isAuthenticated={isAuthenticated}
                        isLoading={isLoading}
                        user={user}
                        authPath={authPath}
                    />
                </GlassPanel>

                {/* TIER 2: Functional Navigation (Bottom) */}
                <GlassPanel
                    className="flex items-center justify-between px-4 py-3 rounded-full border-primary/20 backdrop-blur-xl gap-4 shadow-[var(--hud-shadow)]"
                    style={{ background: 'var(--hud-bg)' }}
                >
                    {/* Nav Links */}
                    <nav className="flex items-center gap-1 flex-1 justify-center">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link key={item.path} href={item.path} className="relative group px-3 py-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <Icon className={cn(
                                            "w-4 h-4 transition-colors duration-300",
                                            isActive ? "text-accent-a" : "text-primary/40 group-hover:text-accent-b"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-headline tracking-widest transition-colors duration-300",
                                            isActive ? "text-accent-a font-bold" : "text-primary/40 group-hover:text-accent-b"
                                        )}>
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Active State Glow */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 bg-accent-a/10 rounded-lg -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    {/* Plasma Leak Hover Effect - Expanding Underline */}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-accent-b"
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "80%" }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Theme Toggle */}
                    <div className="pl-2 pr-2 border-l border-r border-primary/10 flex items-center">
                        <ThemeToggle />
                    </div>

                    {/* Checkout Button */}
                    <div className="pl-2">
                        <AttentionMorphButton />
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}

interface ActivePilotIndicatorProps {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { userId: number; email: string; shortId: string } | null;
    authPath: string;
}

function ActivePilotIndicator({ isAuthenticated, isLoading, user, authPath }: ActivePilotIndicatorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleIconClick = () => {
        if (isAuthenticated) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    // If not authenticated, render as link
    if (!isAuthenticated) {
        return (
            <Link href={authPath} className="relative group p-2">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 bg-white/5 border border-primary/10 hover:border-accent-a/40"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-accent-a rounded-full animate-spin" />
                    ) : (
                        <User className="w-4 h-4 text-primary/40 group-hover:text-accent-a transition-colors duration-300" />
                    )}
                </motion.div>
            </Link>
        );
    }

    return (
        <div ref={dropdownRef} className="relative">
            {/* Active Pilot Button with ID Badge */}
            <motion.button
                onClick={handleIconClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 p-2 group"
            >
                {/* ID Badge */}
                <span className="font-mono text-[10px] tracking-wider text-accent-b hidden sm:block">
                    {user?.shortId || "USR-0000"}
                </span>

                {/* Icon Container with Breathing Glow */}
                <div className="relative">
                    {/* Breathing Glow Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "linear-gradient(135deg, rgba(77, 77, 255, 0.3), rgba(204, 255, 0, 0.3))",
                        }}
                        animate={{
                            boxShadow: [
                                "0 0 10px rgba(204, 255, 0, 0.3), 0 0 20px rgba(77, 77, 255, 0.2)",
                                "0 0 20px rgba(204, 255, 0, 0.5), 0 0 30px rgba(77, 77, 255, 0.3)",
                                "0 0 10px rgba(204, 255, 0, 0.3), 0 0 20px rgba(77, 77, 255, 0.2)",
                            ],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Icon */}
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent-a/20 to-accent-b/20 border border-accent-b/50">
                        <User className="w-4 h-4 text-accent-b" />
                    </div>
                </div>

                {/* Active Status Dot */}
                <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-b"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-3 w-52"
                    >
                        <GlassPanel className="rounded-xl border-accent-a/20 backdrop-blur-2xl overflow-hidden shadow-[0_0_30px_rgba(77,77,255,0.2)]">
                            {/* User Info Header */}
                            <div className="px-4 py-3 border-b border-primary/10">
                                <div className="font-mono text-[10px] text-primary/40 tracking-wider">ACTIVE PILOT</div>
                                <div className="font-mono text-xs text-accent-b truncate mt-1">
                                    {user?.email}
                                </div>
                                <div className="font-mono text-[10px] text-accent-a/60 mt-0.5">
                                    {user?.shortId}
                                </div>
                            </div>

                            {/* Menu Options */}
                            <div className="p-2">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-primary/40 group-hover:text-accent-a transition-colors" />
                                    <span className="font-headline text-xs tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                                        VIEW DASHBOARD
                                    </span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors group"
                                >
                                    <LogOut className="w-4 h-4 text-primary/40 group-hover:text-red-400 transition-colors" />
                                    <span className="font-headline text-xs tracking-widest text-primary/60 group-hover:text-red-400 transition-colors">
                                        TERMINATE SESSION
                                    </span>
                                </button>
                            </div>

                            {/* Status Footer */}
                            <div className="px-4 py-2 border-t border-primary/10 flex items-center gap-2">
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-accent-b"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="font-mono text-[9px] text-primary/30 tracking-wider">
                                    SESSION ACTIVE
                                </span>
                            </div>
                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AttentionMorphButton() {
    const { items, openCart, openCheckout } = useCart();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const hasItems = itemCount > 0;

    const handleClick = () => {
        if (hasItems) {
            openCheckout();
        } else {
            openCart();
        }
    }

    return (
        <motion.button
            onClick={handleClick}
            layout
            className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 overflow-hidden font-mono text-xs font-bold tracking-wider",
                hasItems
                    ? "bg-accent-b text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                    : "bg-white/5 text-primary/40 hover:bg-white/10"
            )}
            whileHover={hasItems ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.95 }}
        >
            {/* Morphing Background Animation for Active State */}
            {hasItems && (
                <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            <div className="relative z-10 flex items-center gap-2">
                <ShoppingBag className={cn("w-4 h-4", hasItems ? "text-black" : "text-primary/40")} />
                {hasItems ? (
                    <span className="hidden sm:inline">CHECKOUT <span className="opacity-60">({itemCount})</span></span>
                ) : (
                    <span className="hidden sm:inline">EMPTY</span>
                )}
            </div>
        </motion.button>
    )
}
