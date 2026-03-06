"use client";

import {
    PaymentSuccessView,
    type OrderSuccessData,
    type PaymentStatus,
    type ShippingEstimate,
} from "@/components/commerce/PaymentSuccessView";
import { useCart } from "@/lib/store/useCart";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const POLL_INTERVAL_MS = 2_500;
const POLL_TIMEOUT_MS  = 30_000;

// ─── EU country set — mirrors ShippingService.js ─────────────────────────────

const EU_COUNTRIES = new Set([
    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
    "GR","HU","IE","IT","LV","LT","LU","MT","NL","PL",
    "PT","RO","SK","SI","ES","SE",
]);

function addBizDays(from: Date, n: number): Date {
    const d = new Date(from);
    let added = 0;
    while (added < n) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
}

function buildShippingEstimate(shippingAddress: OrderSuccessData["shippingAddress"]): ShippingEstimate {
    const country = (shippingAddress?.country ?? "").toUpperCase();
    const tier = country === "DE" ? "DE" : EU_COUNTRIES.has(country) ? "EU" : "INTERNATIONAL";
    const ranges = { DE: { min: 2, max: 4 }, EU: { min: 3, max: 7 }, INTERNATIONAL: { min: 7, max: 14 } } as const;
    const { min, max } = ranges[tier];

    const now      = new Date();
    const earliest = addBizDays(now, min);
    const latest   = addBizDays(now, max);
    const fmt = (d: Date) =>
        d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

    return {
        tier,
        displayRange: `${fmt(earliest)} – ${fmt(latest)}`,
        minDays: min,
        maxDays: max,
        cutoffApplied: now.getHours() >= 14,
    };
}

// ─── Suspense shell ───────────────────────────────────────────────────────────
// useSearchParams() requires a Suspense boundary in Next.js App Router.

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<PaymentSuccessView status="VERIFYING" order={null} shipping={null} />}>
            <OrderSuccessContent />
        </Suspense>
    );
}

// ─── Core logic ───────────────────────────────────────────────────────────────

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router       = useRouter();
    const { clearCart, closeCheckout } = useCart();

    // Stripe appends `payment_intent` on redirect; our own push uses `pi`.
    const paymentIntentId = searchParams.get("payment_intent") || searchParams.get("pi");
    const amountParam     = searchParams.get("amount");
    const amount       = amountParam ? parseFloat(amountParam) : undefined;
    const currency = searchParams.get("currency");

    const [status, setStatus]     = useState<PaymentStatus>("VERIFYING");
    const [order, setOrder]       = useState<OrderSuccessData | null>(null);
    const [shipping, setShipping] = useState<ShippingEstimate | null>(null);

    const startedAt = useRef(Date.now());
    const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef  = useRef<AbortController | null>(null);

    // Redirect to home if there's no payment intent ID in the URL
    useEffect(() => {
        if (!paymentIntentId) router.replace("/");
    }, [paymentIntentId, router]);

    /**
     * Single poll attempt.
     * Reads the provider-agnostic { status: 'PENDING' | 'PAID' | 'FAILED' }
     * from the backend — no Stripe/PayPal knowledge required.
     */
    const poll = useCallback(async () => {
        // 30-second hard timeout → TIMEOUT state
        if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
            setStatus("TIMEOUT");
            return;
        }

        try {
            abortRef.current = new AbortController();
            const res = await fetch(
                `${API_BASE}/api/orders/status?paymentIntentId=${encodeURIComponent(paymentIntentId!)}`,
                { credentials: "include", signal: abortRef.current.signal }
            );
            const data: { status: "PENDING" | "PAID" | "FAILED"; order: OrderSuccessData | null } =
                await res.json();

            if (data.status === "PAID" && data.order) {
                // Terminal success — stop polling, compute shipping estimate, reveal
                setOrder(data.order);
                setShipping(buildShippingEstimate(data.order.shippingAddress));
                setStatus("SUCCESS");
                return; // no further scheduling
            }

            if (data.status === "FAILED") {
                setStatus("FAILED");
                return;
            }

            // Still PENDING — schedule next poll
            timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);

        } catch (err) {
            // Abort = intentional unmount/navigation — do not retry
            if (err instanceof Error && err.name === "AbortError") return;
            // Network hiccup — keep trying until timeout
            timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
    }, [paymentIntentId]);

    useEffect(() => {
        if (!paymentIntentId) return;

        // Kick off the first poll immediately
        poll();
        return () => {
            // Cancel any scheduled retry and abort any in-flight fetch
            if (timerRef.current) clearTimeout(timerRef.current);
            abortRef.current?.abort();
        };
    }, [poll, paymentIntentId]);

    // Navigate home, clear cart, and kill polling via unmount cleanup above
    const handleKeepShopping = useCallback(() => {
        clearCart();
        closeCheckout();
        router.push("/");
    }, [clearCart, closeCheckout, router]);

    // Client-side nav back to shop so the user can retry (no hard reload)
    const handleRetry = useCallback(() => {
        router.push("/shop");
    }, [router]);

    if (!paymentIntentId) return null;

    return (
        <PaymentSuccessView
            status={status}
            order={order}
            shipping={shipping}
            amount={amount}
            currency={currency ?? undefined}
            onKeepShopping={handleKeepShopping}
            onRetry={handleRetry}
        />
    );
}
