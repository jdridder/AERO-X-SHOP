"use client";

import { OrderManifest } from "@/components/commerce/OrderManifest";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile, ProfileResponse } from "@/lib/services/api";
import { useCart } from "@/lib/store/useCart";
import { getStripe } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, CheckCircle, Lock, Shield, User, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Toast {
    type: "success" | "error";
    message: string;
}

// ============================================================================
// STRIPE APPEARANCE — Dark holographic theme
// ============================================================================

const STRIPE_APPEARANCE: Appearance = {
    theme: "night",
    variables: {
        colorPrimary: "#CCFF00",
        colorBackground: "#0a0a0c",
        colorText: "#f5f5f5",
        colorTextSecondary: "#a0a0a0",
        colorDanger: "#ef4444",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        borderRadius: "6px",
        spacingUnit: "4px",
    },
    rules: {
        ".Input": {
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.15)",
            boxShadow: "none",
        },
        ".Input:focus": {
            borderColor: "#CCFF00",
            boxShadow: "0 4px 12px -6px rgba(204,255,0,0.3)",
            backgroundColor: "rgba(204,255,0,0.05)",
        },
        ".Label": {
            fontWeight: "700",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9ca3af",
        },
        ".Tab": {
            borderColor: "rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
        },
        ".Tab--selected": {
            borderColor: "#CCFF00",
            backgroundColor: "rgba(204,255,0,0.1)",
            color: "#CCFF00",
        },
    },
};

// ============================================================================
// OUTER COMPONENT — Stable <Elements> provider, no clientSecret toggling
// ============================================================================

export function CheckoutModal() {
    const { isCheckoutOpen, closeCheckout, items, total } = useCart();
    const [mounted, setMounted] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    // Zero-footprint Stripe init — loadStripe() only fires when checkout first opens.
    // The module-level singleton in lib/stripe.ts guarantees it only loads once.
    const stripeInitialized = useRef(false);
    const [stripePromise, setStripePromise] = useState<ReturnType<typeof getStripe> | null>(null);

    useEffect(() => {
        if (isCheckoutOpen && !stripeInitialized.current) {
            stripeInitialized.current = true;
            setStripePromise(getStripe());
        }
    }, [isCheckoutOpen]);


    // Amount is frozen when the modal first opens. Stripe requires > 0 cents.
    const amountInCents = useMemo(
        () => Math.max(Math.round(total() * 100), 50),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCheckoutOpen]
    );

    const showToast = useCallback((type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => { setMounted(true); }, []);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = isCheckoutOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isCheckoutOpen]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isCheckoutOpen && (
                <motion.div
                    key="checkout-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    data-overlay-active="true"
                >
                    {/* Backdrop */}
                    <div
                        onClick={closeCheckout}
                        className="absolute inset-0 backdrop-blur-xl cursor-pointer"
                        style={{ background: "var(--checkout-backdrop)" }}
                    />

                    {/* Holographic Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            x: 0,
                        }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className={cn(
                            "relative w-full max-w-6xl h-[85vh] overflow-hidden rounded-lg border backdrop-blur-xl flex flex-col pointer-events-auto",
                            "z-10"
                        )}
                        style={{
                            background: "var(--checkout-bg)",
                            borderColor: "var(--color-border-strong)",
                            boxShadow: "var(--checkout-shadow)",
                        }}
                    >
                        <CheckoutHeader closeCheckout={closeCheckout} />

                        {/* Split Pane Layout */}
                        <div className="flex-1 flex overflow-hidden">

                            {/*
                             * Single stable <Elements> provider mounted for the entire
                             * modal lifetime. Using deferred intent pattern:
                             *   - `mode` + `currency` + `amount` instead of clientSecret
                             *   - PaymentElement renders immediately
                             *   - clientSecret is fetched server-side at submit time
                             */}
                            {stripePromise ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        mode: "payment",
                                        currency: "eur",
                                        amount: amountInCents,
                                        appearance: STRIPE_APPEARANCE,
                                        paymentMethodTypes: ["card"],
                                    }}
                                >
                                    <CheckoutForm
                                        cartItems={items.map(i => ({ id: i.id, quantity: i.quantity }))}
                                        showToast={showToast}
                                    />
                                </Elements>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-accent-b/20 border-t-accent-b rounded-full animate-spin" />
                                </div>
                            )}

                            {/* RIGHT COLUMN: MANIFEST */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-[40%] hidden lg:block bg-black/40 backdrop-blur-md p-8 overflow-hidden relative"
                            >
                                <OrderManifest />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-4 rounded-full font-mono text-sm tracking-wider ${
                                    toast.type === "success"
                                        ? "bg-accent-b text-black shadow-[0_0_30px_rgba(204,255,0,0.4)]"
                                        : "bg-red-500/90 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                                }`}
                            >
                                {toast.type === "success" ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5" />
                                )}
                                {toast.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// CHECKOUT FORM — Always inside <Elements>, no phase-gating
// ============================================================================

interface CheckoutFormProps {
    cartItems: { id: string; quantity: number }[];
    showToast: (type: "success" | "error", message: string) => void;
}

function CheckoutForm({ cartItems, showToast }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { isAuthenticated } = useAuth();
    const { clearCart, closeCheckout, isCheckoutOpen, total } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [wantsAccount, setWantsAccount] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        password: "",
    });

    const [termsAccepted, setTermsAccepted] = useState(false);

    // Card holder — mirrors first+last name until the user overrides it manually
    const [cardHolder, setCardHolder] = useState("");
    const cardHolderDirty = useRef(false);
    useEffect(() => {
        if (!cardHolderDirty.current) {
            setCardHolder(`${formData.firstName} ${formData.lastName}`.trim());
        }
    }, [formData.firstName, formData.lastName]);

    // Stable ref — setFormData/setProfileLoaded are React dispatch refs, never change
    const loadProfile = useCallback(async () => {
        try {
            const profile: ProfileResponse = await getProfile();
            const nameParts = (profile.name || "").split(" ");
            setFormData({
                firstName: profile.shippingAddress?.firstName || nameParts[0] || "",
                lastName: profile.shippingAddress?.lastName || nameParts.slice(1).join(" ") || "",
                email: profile.email,
                address: profile.shippingAddress?.address || "",
                city: profile.shippingAddress?.city || "",
                postalCode: profile.shippingAddress?.postalCode || "",
                country: profile.shippingAddress?.country || "",
                password: "",
            });
        } catch {
            // silently fall through — empty form is fine
        } finally {
            setProfileLoaded(true);
        }
    }, []);

    // Auto-fill for authenticated users
    useEffect(() => {
        if (isAuthenticated && isCheckoutOpen && !profileLoaded) {
            loadProfile();
        }
    }, [isAuthenticated, isCheckoutOpen, profileLoaded, loadProfile]);

    // Reset when modal closes
    useEffect(() => {
        if (!isCheckoutOpen) {
            setWantsAccount(false);
        }
    }, [isCheckoutOpen]);

    const handleInput = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // ── Validation ───────────────────────────────────────────────
    const fieldsComplete =
        formData.firstName.length > 0 &&
        formData.lastName.length > 0 &&
        formData.email.length > 0 &&
        formData.address.length > 0 &&
        formData.city.length > 0 &&
        formData.postalCode.length > 0 &&
        formData.country.length > 0 &&
        termsAccepted;

    const passwordValid = !wantsAccount || (
        formData.password.length >= 8 &&
        /[0-9]/.test(formData.password) &&
        /[A-Z]/.test(formData.password)
    );

    const emailValid = (formData.email.indexOf("@") > -1)

    const isFormValid = fieldsComplete && passwordValid && emailValid;

    // ── Unified submit handler ────────────────────────────────────
    const handleSubmit = async () => {
        if (!stripe || !elements) return;

        // 1. Client-side form validation — surface errors inline
        if (!isFormValid) {
            showToast("error", "FILL ALL REQUIRED FIELDS BEFORE DEPLOYING");
            return;
        }

        setLoading(true);
        try {
            // 2. Validate the PaymentElement fields (Stripe's own validation)
            const { error: submitError } = await elements.submit();
            if (submitError) {
                showToast("error", submitError.message || "Invalid payment details");
                return;
            }

            const shippingAddress = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country,
            };

            // 3. Create PaymentIntent on the server (server validates pricing)
            const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    items: cartItems,
                    shipping_address: shippingAddress,
                    password: wantsAccount && !isAuthenticated ? formData.password : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payment initialisation failed");

            // 4. Confirm payment with the server-issued clientSecret
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret: data.clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/shop?payment=success`,
                    payment_method_data: {
                        billing_details: {
                            name: cardHolder,
                            email: formData.email,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                postal_code: formData.postalCode,
                                country: formData.country,
                            },
                        },
                    },
                },
                redirect: "if_required",
            });

            if (error) {
                showToast("error", error.message || "Payment failed");
            } else {
                // Navigate to the success page. paymentIntent.id is used by the
                // polling endpoint to look up the order once the webhook fires.
                const amount = total().toFixed(2);
                clearCart();
                closeCheckout();
                router.push(
                    `/order-success?pi=${encodeURIComponent(paymentIntent?.id ?? "")}&amount=${amount}`
                );
            }
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-b/20 scrollbar-track-transparent p-8 lg:p-10 border-r"
            style={{ borderColor: "var(--color-border-strong)" }}
        >
            <div className="max-w-2xl mx-auto space-y-10">

                {/* 01 — OPERATOR IDENTITY */}
                <div className="space-y-6">
                    <SectionHeader title="01 // OPERATOR IDENTITY" />

                    {isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-accent-b/20 bg-accent-b/5 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-b/20 border border-accent-b/40 flex items-center justify-center">
                                    <User className="w-5 h-5 text-accent-b" />
                                </div>
                                <div>
                                    <p className="font-headline text-sm font-bold text-accent-b tracking-wider">
                                        AUTHENTICATED USER
                                    </p>
                                    <p className="font-mono text-[10px] text-primary/50">
                                        Your saved profile data has been loaded.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                        <HoloInput
                            label="FIRST NAME"
                            value={formData.firstName}
                            onChange={(e) => handleInput("firstName", e.target.value)}
                            required
                        />
                        <HoloInput
                            label="LAST NAME"
                            value={formData.lastName}
                            onChange={(e) => handleInput("lastName", e.target.value)}
                            required
                        />
                    </div>
                    <HoloInput
                        label="COMM-LINK (EMAIL)"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInput("email", e.target.value)}
                        required
                        disabled={isAuthenticated}
                    />

                    {/* Account creation — available throughout the form */}
                    {!isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg border border-accent-a/20 bg-accent-a/5 p-4"
                        >
                            <div
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => setWantsAccount(!wantsAccount)}
                            >
                                <div className="flex items-center gap-3">
                                    <Zap className="h-4 w-4 text-accent-a" />
                                    <div>
                                        <h4 className="font-headline text-sm font-bold text-accent-a tracking-wider">
                                            CREATE PILOT ACCOUNT
                                        </h4>
                                        <p className="font-mono text-[10px] text-primary/50">
                                            Track orders & save preferences (optional)
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "flex h-6 w-6 items-center justify-center border rounded transition-all",
                                    wantsAccount
                                        ? "bg-accent-a/20 border-accent-a"
                                        : "border-primary/30 group-hover:border-accent-a/50"
                                )}>
                                    {wantsAccount && <Check className="h-4 w-4 text-accent-a" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {wantsAccount && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 border-t border-accent-a/20 mt-4">
                                            <HoloInput
                                                label="SET ACCESS KEY (PASSWORD)"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => handleInput("password", e.target.value)}
                                                required
                                                placeholder="MIN 8 CHARS, 1 DIGIT, 1 UPPERCASE"
                                                icon={Lock}
                                            />
                                            {formData.password.length > 0 && !passwordValid && (
                                                <p className="mt-2 font-mono text-[10px] text-red-400/80">
                                                    Password requires: 8+ chars, 1 digit, 1 uppercase
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

                {/* 02 — DEPLOYMENT COORDINATES */}
                <div className="space-y-6">
                    <SectionHeader title="02 // DEPLOYMENT ADDRESS" />
                    <HoloInput
                        label="STREET ADDRESS"
                        value={formData.address}
                        onChange={(e) => handleInput("address", e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-5">
                        <HoloInput
                            label="CITY"
                            value={formData.city}
                            onChange={(e) => handleInput("city", e.target.value)}
                            required
                        />
                        <HoloInput
                            label="POSTAL CODE"
                            value={formData.postalCode}
                            onChange={(e) => handleInput("postalCode", e.target.value)}
                            required
                        />
                    </div>
                    <HoloInput
                        label="COUNTRY (ISO CODE)"
                        value={formData.country}
                        onChange={(e) => handleInput("country", e.target.value.toUpperCase())}
                        required
                        placeholder="DE, FR, US..."
                    />
                </div>

                {/* 03 — PAYMENT PROTOCOL */}
                <div className="space-y-6">
                    <SectionHeader title="03 // PAYMENT PROTOCOL" />

                    {/* Card holder — auto-filled from name, independently editable */}
                    <HoloInput
                        label="CARD HOLDER"
                        value={cardHolder}
                        onChange={(e) => {
                            cardHolderDirty.current = true;
                            setCardHolder(e.target.value);
                        }}
                        required
                        placeholder="NAME ON CARD"
                    />

                    {/* PaymentElement always visible — no phase gating */}
                    <div className="rounded-lg border border-primary/10 bg-white/[0.02] p-4">
                        <PaymentElement options={{ layout: "tabs" }} />
                    </div>

                    {/* Terms */}
                    <div
                        className="group flex cursor-pointer items-center gap-3 pt-2"
                        onClick={() => setTermsAccepted(!termsAccepted)}
                    >
                        <div className={cn(
                            "flex h-5 w-5 items-center justify-center border border-primary/40 rounded transition-colors group-hover:border-accent-b",
                            termsAccepted ? "bg-accent-b/10 border-accent-b" : "bg-transparent"
                        )}>
                            {termsAccepted && <Check className="h-3 w-3 text-accent-b" />}
                        </div>
                        <span className={cn(
                            "font-mono text-xs transition-colors",
                            termsAccepted ? "text-accent-b" : "text-primary/60 group-hover:text-primary"
                        )}>
                            I ACCEPT THE MISSION TERMS & LIABILITY PROTOCOLS
                        </span>
                    </div>

                    {/* Submit Button — single, unified */}
                    <div className="pt-8 pb-12">
                        <Button
                            size="lg"
                            className={cn(
                                "w-full h-16 text-lg tracking-widest transition-all duration-500 rounded-lg",
                                isFormValid
                                    ? "bg-accent-b text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                                    : "bg-primary/5 text-primary/20 cursor-not-allowed border border-primary/10"
                            )}
                            disabled={loading || !stripe || !elements}
                            onClick={handleSubmit}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    PROCESSING...
                                </span>
                            ) : (
                                <>
                                    {isAuthenticated
                                        ? "DEPLOY ORDER"
                                        : wantsAccount
                                            ? "CREATE ACCOUNT & DEPLOY"
                                            : "DEPLOY AS GUEST"}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>

                        {!isFormValid && (
                            <p className="mt-3 text-center font-mono text-[10px] text-red-500/60 animate-pulse">
                                [!] FILL MANDATORY FIELDS TO UNLOCK SYSTEM
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CheckoutHeader({ closeCheckout }: { closeCheckout: () => void }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <div
            className="flex-shrink-0 flex items-center justify-between border-b bg-black/90 px-8 py-5 backdrop-blur-xl z-20"
            style={{ borderColor: "var(--color-border-strong)" }}
        >
            <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-accent-b" />
                <h2 className="font-headline text-2xl font-bold tracking-widest text-white">
                    COMMAND CENTER <span className="text-accent-b">// CHECKOUT</span>
                </h2>
            </div>
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-b/10 border border-accent-b/30">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-accent-b"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="font-mono text-[10px] text-accent-b tracking-wider">
                            {user?.shortId || "PILOT ACTIVE"}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-primary/20">
                        <User className="w-3 h-3 text-primary/40" />
                        <span className="font-mono text-[10px] text-primary/40 tracking-wider">
                            GUEST MODE
                        </span>
                    </div>
                )}
                <button
                    onClick={closeCheckout}
                    className="group p-2 transition-colors hover:bg-accent-b/10 rounded-md"
                >
                    <X className="h-6 w-6 text-primary/60 transition-colors group-hover:text-accent-b" />
                </button>
            </div>
        </div>
    );
}

function SectionHeader({ title, className }: { title: string; className?: string }) {
    return (
        <h3 className={cn("border-b border-primary/10 pb-2 font-headline text-sm font-bold text-primary/40", className)}>
            {title}
        </h3>
    );
}

function HoloInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "REQUIRED",
    required,
    disabled,
    icon: Icon,
}: {
    label: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const displayPlaceholder = placeholder === "REQUIRED" && required
        ? (isFocused ? "" : "REQUIRED")
        : placeholder;

    return (
        <div className="space-y-1">
            <div className="flex justify-between">
                <label className="font-headline text-xs font-bold text-gray-400/80">{label}</label>
                {required && <span className="font-mono text-[9px] text-accent-b/40">*REQ</span>}
            </div>
            <div className="relative group">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    className={cn(
                        "h-12 w-full rounded-md border-b border-primary/20 bg-white/5 px-4 font-mono text-sm text-primary caret-accent-b transition-all focus:outline-none placeholder:text-primary/20",
                        (isFocused || (value && value.length > 0)) && required
                            ? "border-accent-a shadow-[0_4px_12px_-6px_rgba(204,255,0,0.3)] bg-accent-a/5"
                            : "focus:border-accent-a focus:bg-accent-a/5",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder={displayPlaceholder}
                />
                {Icon && (
                    <div className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                        (isFocused || (value && value.length > 0)) ? "text-accent-b" : "text-primary/40"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                )}
            </div>
        </div>
    );
}
