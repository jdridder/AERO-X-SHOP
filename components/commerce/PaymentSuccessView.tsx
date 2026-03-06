"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Calendar, Clock, MapPin, Package, X, Zap } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Internal payment status — provider-agnostic. Driven by the DB, not Stripe/PayPal. */
export type PaymentStatus = "VERIFYING" | "SUCCESS" | "TIMEOUT" | "FAILED";

export interface OrderSuccessData {
    id: string;
    totalPrice: number;
    currency: string;
    status: string;
    createdAt: string;
    shippingAddress: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
        country?: string;
    };
    items: { id: string; name?: string; quantity: number; price?: number }[];
}

export interface ShippingEstimate {
    tier: string;
    displayRange: string;
    minDays: number;
    maxDays: number;
    cutoffApplied: boolean;
}

interface PaymentSuccessViewProps {
    status: PaymentStatus;
    order: OrderSuccessData | null;
    shipping: ShippingEstimate | null;
    amount?: number;
    currency?: string;
    onKeepShopping?: () => void;
    onRetry?: () => void;
}

// ─── VERIFYING state ──────────────────────────────────────────────────────────
// Holographic orbital spinner with animated dots.
// Deliberately shows NO checkmark — that reveal is reserved for SUCCESS.

function VerifyingState({ amount, currency}: { amount?: number, currency?: string }) {
    console.log(amount)
    return (
        <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-10 text-center"
        >
            {/* Orbital spinner */}
            <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer ring — clockwise, acid green */}
                <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-transparent"
                    style={{ borderTopColor: "#CCFF00", borderRightColor: "#CCFF00" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                />
                {/* Middle ring — counter-clockwise, plasma blue */}
                <motion.div
                    className="absolute inset-4 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: "#4D4DFF", borderLeftColor: "#4D4DFF" }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner ring — clockwise, dim green */}
                <motion.div
                    className="absolute inset-8 rounded-full border border-transparent"
                    style={{ borderTopColor: "rgba(204,255,0,0.4)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                {/* Core pulse */}
                <motion.div
                    className="w-4 h-4 rounded-full bg-accent-b"
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.8, 0.3, 0.8],
                        boxShadow: [
                            "0 0 8px rgba(204,255,0,0.4)",
                            "0 0 20px rgba(204,255,0,0.7)",
                            "0 0 8px rgba(204,255,0,0.4)",
                        ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Text + dots */}
            <div className="space-y-3">
                <h2 className="font-headline text-2xl font-bold tracking-widest text-white">
                    VERIFYING PAYMENT
                </h2>

                <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-xs text-primary/40 tracking-wider">
                        SYNCING WITH PAYMENT SYSTEM
                    </span>
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="font-mono text-xs text-accent-b"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                        >
                            .
                        </motion.span>
                    ))}
                </div>

                {amount !== undefined && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-mono text-xl font-bold text-accent-b"
                    >
                        {amount.toFixed(2)} {currency}
                    </motion.p>
                )}
            </div>

            {/* Scanning progress bar */}
            <div className="w-56 h-[2px] rounded-full overflow-hidden bg-white/5">
                <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent-b to-transparent"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <p className="font-mono text-[10px] text-primary/25 tracking-widest max-w-xs">
                DO NOT CLOSE THIS PAGE — CONFIRMING WITH PAYMENT PROVIDER
            </p>
        </motion.div>
    );
}

// ─── SUCCESS state ─────────────────────────────────────────────────────────────
// Checkmark mounts fresh on every SUCCESS transition — the spring animation
// plays from scratch, giving the customer a satisfying payment-confirmed reveal.

function AnimatedCheckmark() {
    return (
        <div className="relative flex items-center justify-center">
            {/* Pulse ring 1 */}
            <motion.div
                className="absolute rounded-full border-2 border-accent-b/40"
                initial={{ width: 80, height: 80, opacity: 0.9 }}
                animate={{ width: 160, height: 160, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            {/* Pulse ring 2 — staggered */}
            <motion.div
                className="absolute rounded-full border border-accent-b/20"
                initial={{ width: 80, height: 80, opacity: 0.6 }}
                animate={{ width: 130, height: 130, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />

            {/* Circle */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.1 }}
                className="relative flex items-center justify-center w-20 h-20 rounded-full bg-accent-b/10 border-2 border-accent-b"
                style={{ boxShadow: "0 0 40px rgba(204,255,0,0.4), 0 0 80px rgba(204,255,0,0.15)" }}
            >
                <svg viewBox="0 0 52 52" className="w-10 h-10" fill="none">
                    <motion.path
                        d="M14 27 L22 35 L38 18"
                        stroke="#CCFF00"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
                    />
                </svg>
            </motion.div>
        </div>
    );
}

function OrderSummary({ order, shipping }: { order: OrderSuccessData; shipping: ShippingEstimate | null }) {
    let { shippingAddress, items, totalPrice, currency, id } = order;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="w-full max-w-lg space-y-5"
        >
            {/* ORDER MANIFEST */}
            <GlassPanel className="rounded-xl border-primary/10 overflow-hidden">
                <div className="px-5 py-3 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-accent-b" />
                        <span className="font-headline text-xs tracking-widest text-primary/60">ORDER MANIFEST</span>
                    </div>
                    <span className="font-mono text-[10px] text-primary/30">
                        #{id.slice(0, 8).toUpperCase()}
                    </span>
                </div>

                <div className="divide-y divide-primary/5">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-5 py-3">
                            <div>
                                <span className="font-mono text-sm text-white">{item.name || item.id}</span>
                                <span className="ml-2 font-mono text-xs text-primary/40">×{item.quantity}</span>
                            </div>
                            {item.price !== undefined && (
                                <span className="font-mono text-sm text-accent-b">
                                    {currency}{(item.price * item.quantity).toFixed(2)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="px-5 py-4 border-t border-primary/10 flex items-center justify-between bg-accent-b/5">
                    <span className="font-headline text-sm font-bold tracking-widest text-white">TOTAL CHARGED</span>
                    <span className="font-mono text-xl font-bold text-accent-b">{totalPrice.toFixed(2)} {currency}</span>
                </div>
            </GlassPanel>

            {/* DEPLOYMENT DESTINATION */}
            <GlassPanel className="rounded-xl border-primary/10 overflow-hidden">
                <div className="px-5 py-3 border-b border-primary/10 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-a" />
                    <span className="font-headline text-xs tracking-widest text-primary/60">DEPLOYMENT COORDINATES</span>
                </div>
                <div className="px-5 py-4 space-y-1">
                    <p className="font-mono text-sm text-white">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                    <p className="font-mono text-xs text-primary/50">{shippingAddress.email}</p>
                    <p className="font-mono text-xs text-primary/40 mt-2">{shippingAddress.address}</p>
                    <p className="font-mono text-xs text-primary/40">
                        {shippingAddress.postalCode} {shippingAddress.city}
                        {shippingAddress.country ? `, ${shippingAddress.country.toUpperCase()}` : ""}
                    </p>
                </div>
            </GlassPanel>

            {/* ESTIMATED ARRIVAL */}
            {shipping && (
                <GlassPanel className="rounded-xl border-accent-a/20 overflow-hidden">
                    <div className="px-5 py-3 border-b border-accent-a/10 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent-a" />
                        <span className="font-headline text-xs tracking-widest text-primary/60">ESTIMATED ARRIVAL</span>
                        <span className={cn(
                            "ml-auto font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full",
                            shipping.tier === "DE"
                                ? "bg-accent-b/10 text-accent-b"
                                : shipping.tier === "EU"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-orange-500/10 text-orange-400"
                        )}>
                            {shipping.tier}
                        </span>
                    </div>
                    <div className="px-5 py-4 space-y-2">
                        <p className="font-mono text-sm font-bold text-white">{shipping.displayRange}</p>
                        <p className="font-mono text-xs text-primary/40">
                            {shipping.minDays}–{shipping.maxDays} business days
                        </p>
                        {shipping.cutoffApplied && (
                            <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-primary/30" />
                                <p className="font-mono text-[10px] text-primary/30">
                                    Order received after 14:00 — dispatch from next business day.
                                </p>
                            </div>
                        )}
                    </div>
                </GlassPanel>
            )}
        </motion.div>
    );
}

function SuccessState({
    order,
    shipping,
    onKeepShopping,
}: {
    order: OrderSuccessData;
    shipping: ShippingEstimate | null;
    onKeepShopping?: () => void;
}) {
    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 text-center"
        >
            {/* Checkmark mounts fresh here — spring plays from scratch */}
            <AnimatedCheckmark />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
            >
                <h1 className="font-headline text-4xl font-bold tracking-widest text-white">
                    PAYMENT CONFIRMED
                </h1>
                <p className="font-mono text-primary/40 text-sm tracking-wider">
                    YOUR ORDER HAS BEEN DEPLOYED
                </p>
            </motion.div>

            <OrderSummary order={order} shipping={shipping} />

            {onKeepShopping && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    onClick={onKeepShopping}
                    className="font-headline text-xs tracking-widest text-accent-b border border-accent-b/40 px-8 py-3.5 rounded-full hover:bg-accent-b/10 transition-colors"
                >
                    KEEP SHOPPING →
                </motion.button>
            )}
        </motion.div>
    );
}

// ─── TIMEOUT state ─────────────────────────────────────────────────────────────

function TimeoutState() {
    return (
        <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-7 text-center max-w-sm"
        >
            <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center"
                style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}
            >
                <AlertTriangle className="w-9 h-9 text-orange-400" />
            </motion.div>

            <div className="space-y-3">
                <h2 className="font-headline text-2xl font-bold tracking-widest text-white">
                    TAKING LONGER THAN USUAL
                </h2>
                <p className="font-mono text-sm text-primary/50 leading-relaxed">
                    Your payment was processed successfully, but our systems are
                    still syncing. Your order will be confirmed shortly.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 animate-pulse" />
                    <span className="font-mono text-[10px] text-orange-400/60 tracking-widest">
                        SYNC IN PROGRESS
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Link
                    href="/dashboard"
                    className="font-headline text-xs tracking-widest text-accent-b border border-accent-b/30 px-6 py-3.5 rounded-full hover:bg-accent-b/10 transition-colors"
                >
                    CHECK DASHBOARD
                </Link>
                <a
                    href="mailto:support@aero-x.com"
                    className="font-headline text-xs tracking-widest text-primary/40 hover:text-primary transition-colors py-2"
                >
                    CONTACT SUPPORT →
                </a>
            </div>
        </motion.div>
    );
}

// ─── FAILED state ──────────────────────────────────────────────────────────────

function FailedState({
    onRetry,
    onKeepShopping,
}: {
    onRetry?: () => void;
    onKeepShopping?: () => void;
}) {
    return (
        <motion.div
            key="failed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-7 text-center max-w-sm"
        >
            <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center"
                style={{ boxShadow: "0 0 30px rgba(239,68,68,0.2)" }}
            >
                <X className="w-9 h-9 text-red-400" />
            </motion.div>

            <div className="space-y-3">
                <h2 className="font-headline text-2xl font-bold tracking-widest text-white">
                    PAYMENT VERIFICATION FAILED
                </h2>
                <p className="font-mono text-sm text-primary/50 leading-relaxed">
                    We could not confirm your payment. No charges have been made to your account.
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="font-headline text-xs tracking-widest text-accent-b border border-accent-b/30 px-6 py-3.5 rounded-full hover:bg-accent-b/10 transition-colors"
                    >
                        RETRY PAYMENT →
                    </button>
                )}
                {onKeepShopping && (
                    <button
                        onClick={onKeepShopping}
                        className="font-headline text-xs tracking-widest text-primary/50 border border-primary/20 px-6 py-3.5 rounded-full hover:border-primary/40 hover:text-primary transition-colors"
                    >
                        KEEP SHOPPING
                    </button>
                )}
                <a
                    href="mailto:support@aero-x.com"
                    className="font-headline text-xs tracking-widest text-primary/40 hover:text-primary transition-colors py-2"
                >
                    CONTACT SUPPORT →
                </a>
            </div>
        </motion.div>
    );
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function PaymentSuccessView({ status, order, shipping, amount, currency, onKeepShopping, onRetry }: PaymentSuccessViewProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 gap-10">

            {/* Persistent brand header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
            >
                <Zap className="w-4 h-4 text-accent-b" />
                <span className="font-headline text-xs tracking-[0.4em] text-primary/30">
                    AERO-X SYSTEMS
                </span>
            </motion.div>

            {/*
             * AnimatePresence with mode="wait" ensures the exiting state fully fades
             * before the entering state mounts. This guarantees the checkmark spring
             * animation always plays from scratch when SUCCESS appears.
             */}
            <AnimatePresence mode="wait">
                {status === "VERIFYING" && <VerifyingState key="verifying" amount={amount} currency={currency}/>}

                {status === "SUCCESS" && order && (
                    <SuccessState key="success" order={order} shipping={shipping} onKeepShopping={onKeepShopping} />
                )}

                {status === "TIMEOUT" && <TimeoutState key="timeout" />}

                {status === "FAILED" && <FailedState key="failed" onRetry={onRetry} onKeepShopping={onKeepShopping} />}
            </AnimatePresence>
        </div>
    );
}
