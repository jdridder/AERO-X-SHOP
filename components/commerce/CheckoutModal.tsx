"use client";

import { OrderManifest } from "@/components/commerce/OrderManifest";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile, ProfileResponse } from "@/lib/services/api";
import { getStripe } from "@/lib/stripe";
import { useCart } from "@/lib/store/useCart";
import { cn } from "@/lib/utils";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, CheckCircle, Lock, Shield, User, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
// OUTER COMPONENT — Manages Elements provider + clientSecret lifecycle
// ============================================================================

export function CheckoutModal() {
    const { isCheckoutOpen, closeCheckout, items } = useCart();
    const [mounted, setMounted] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [intentError, setIntentError] = useState<string | null>(null);
    const [creatingIntent, setCreatingIntent] = useState(false);

    const stripePromise = useMemo(() => getStripe(), []);

    const showToast = useCallback((type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => { setMounted(true); }, []);

    // Reset clientSecret when modal closes
    useEffect(() => {
        if (!isCheckoutOpen) {
            setClientSecret(null);
            setIntentError(null);
        }
    }, [isCheckoutOpen]);

    // Scroll lock
    useEffect(() => {
        if (isCheckoutOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isCheckoutOpen]);

    if (!mounted) return null;

    // Called by CheckoutForm when user is ready to pay — creates the PaymentIntent
    const createPaymentIntent = async (shippingAddress: Record<string, string>, password?: string) => {
        setCreatingIntent(true);
        setIntentError(null);
        try {
            const orderItems = items.map(item => ({
                id: item.id,
                quantity: item.quantity,
            }));

            const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    items: orderItems,
                    shipping_address: shippingAddress,
                    password,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payment intent failed");

            setClientSecret(data.clientSecret);
            return data.clientSecret as string;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to initialize payment";
            setIntentError(msg);
            showToast("error", msg);
            return null;
        } finally {
            setCreatingIntent(false);
        }
    };

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
                        style={{ background: 'var(--checkout-backdrop)' }}
                    />

                    {/* Holographic Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: [0, -4, 0, 4, 0],
                            x: [0, 2, 0, -2, 0]
                        }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{
                            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                            x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 0.3 }
                        }}
                        className={cn(
                            "relative w-full max-w-6xl h-[85vh] overflow-hidden rounded-lg border backdrop-blur-xl flex flex-col pointer-events-auto",
                            "z-10"
                        )}
                        style={{
                            background: 'var(--checkout-bg)',
                            borderColor: 'var(--color-border-strong)',
                            boxShadow: 'var(--checkout-shadow)'
                        }}
                    >
                        {/* Header */}
                        <CheckoutHeader closeCheckout={closeCheckout} />

                        {/* Split Pane Layout */}
                        <div className="flex-1 flex overflow-hidden">
                            {clientSecret ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                                >
                                    <CheckoutForm
                                        clientSecret={clientSecret}
                                        showToast={showToast}
                                    />
                                </Elements>
                            ) : (
                                <CheckoutForm
                                    clientSecret={null}
                                    showToast={showToast}
                                    onCreateIntent={createPaymentIntent}
                                    creatingIntent={creatingIntent}
                                    intentError={intentError}
                                />
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
// INNER FORM COMPONENT — Uses Stripe hooks when Elements is available
// ============================================================================

interface CheckoutFormProps {
    clientSecret: string | null;
    showToast: (type: "success" | "error", message: string) => void;
    onCreateIntent?: (shippingAddress: Record<string, string>, password?: string) => Promise<string | null>;
    creatingIntent?: boolean;
    intentError?: string | null;
}

function CheckoutForm({ clientSecret, showToast, onCreateIntent, creatingIntent, intentError }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { isAuthenticated } = useAuth();
    const { clearCart, closeCheckout } = useCart();
    const [loading, setLoading] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const { isCheckoutOpen } = useCart();

    // Guest account creation toggle
    const [wantsAccount, setWantsAccount] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        password: "",
    });

    const [termsAccepted, setTermsAccepted] = useState(false);

    // Auto-fill form for authenticated users
    useEffect(() => {
        if (isAuthenticated && isCheckoutOpen && !profileLoaded) {
            loadProfile();
        }
    }, [isAuthenticated, isCheckoutOpen, profileLoaded]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isCheckoutOpen) {
            setProfileLoaded(false);
            setWantsAccount(false);
        }
    }, [isCheckoutOpen]);

    const loadProfile = async () => {
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
                password: "",
            });
            setProfileLoaded(true);
        } catch {
            setProfileLoaded(true);
        }
    };

    // Validation
    const baseValidation =
        formData.email.length > 0 &&
        formData.address.length > 0 &&
        formData.firstName.length > 0 &&
        formData.lastName.length > 0 &&
        formData.city.length > 0 &&
        formData.postalCode.length > 0 &&
        termsAccepted;

    const passwordValid = !wantsAccount || (
        formData.password.length >= 8 &&
        /[0-9]/.test(formData.password) &&
        /[A-Z]/.test(formData.password)
    );

    const isFormValid = baseValidation && passwordValid;

    const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
    };

    // ── Phase 1: Create PaymentIntent (no Stripe Elements yet) ──
    const handleInitiatePayment = async () => {
        if (!isFormValid || !onCreateIntent) return;
        const password = wantsAccount && !isAuthenticated ? formData.password : undefined;
        await onCreateIntent(shippingAddress, password);
    };

    // ── Phase 2: Confirm payment (Stripe Elements available) ────
    const handleConfirmPayment = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        try {
            const returnUrl = `${window.location.origin}/shop?payment=success`;

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: returnUrl,
                    payment_method_data: {
                        billing_details: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                postal_code: formData.postalCode,
                            },
                        },
                    },
                },
                redirect: "if_required",
            });

            if (error) {
                showToast("error", error.message || "Payment failed");
            } else {
                // Payment succeeded without redirect
                showToast("success", "ORDER DEPLOYED SUCCESSFULLY");
                clearCart();
                closeCheckout();
                setFormData({
                    firstName: "", lastName: "", email: "", address: "", city: "", postalCode: "", password: ""
                });
                setTermsAccepted(false);
                setWantsAccount(false);
            }
        } catch (error) {
            showToast("error", error instanceof Error ? error.message : "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isPaymentPhase = clientSecret !== null;

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-b/20 scrollbar-track-transparent p-8 lg:p-10 border-r"
            style={{ borderColor: 'var(--color-border-strong)' }}
        >
            <div className="max-w-2xl mx-auto space-y-10">

                {/* Identity Section */}
                <div className="space-y-6">
                    <SectionHeader title="01 // OPERATOR IDENTITY" />

                    {isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-accent-b/20 bg-accent-b/5 p-4 mb-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-b/20 border border-accent-b/40 flex items-center justify-center">
                                    <User className="w-5 h-5 text-accent-b" />
                                </div>
                                <div>
                                    <p className="font-headline text-sm font-bold text-accent-b tracking-wider">
                                        AUTHENTICATED PILOT
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
                            disabled={isPaymentPhase}
                        />
                        <HoloInput
                            label="LAST NAME"
                            value={formData.lastName}
                            onChange={(e) => handleInput("lastName", e.target.value)}
                            required
                            disabled={isPaymentPhase}
                        />
                    </div>
                    <HoloInput
                        label="COMM-LINK (EMAIL)"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInput("email", e.target.value)}
                        required
                        disabled={isAuthenticated || isPaymentPhase}
                    />

                    {/* Account Creation Option for Guests */}
                    {!isAuthenticated && !isPaymentPhase && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg border border-accent-a/20 bg-accent-a/5 p-4 mt-4"
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

                {/* Shipping Section */}
                <div className="space-y-6">
                    <SectionHeader title="02 // DEPLOYMENT COORDINATES" />
                    <HoloInput
                        label="STREET ADDRESS"
                        value={formData.address}
                        onChange={(e) => handleInput("address", e.target.value)}
                        required
                        disabled={isPaymentPhase}
                    />
                    <div className="grid grid-cols-2 gap-5">
                        <HoloInput
                            label="SECTOR (CITY)"
                            value={formData.city}
                            onChange={(e) => handleInput("city", e.target.value)}
                            required
                            disabled={isPaymentPhase}
                        />
                        <HoloInput
                            label="POSTAL CODE"
                            value={formData.postalCode}
                            onChange={(e) => handleInput("postalCode", e.target.value)}
                            required
                            disabled={isPaymentPhase}
                        />
                    </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-6">
                    <SectionHeader title="03 // PAYMENT PROTOCOL" />

                    {isPaymentPhase ? (
                        /* Stripe Payment Element — rendered inside <Elements> */
                        <div className="space-y-4">
                            <PaymentElement
                                options={{
                                    layout: "tabs",
                                }}
                            />
                        </div>
                    ) : (
                        /* Pre-payment: show locked state prompting user to proceed */
                        <div className="rounded-lg border border-primary/10 bg-white/5 p-6 text-center space-y-3">
                            <Lock className="w-6 h-6 text-primary/30 mx-auto" />
                            <p className="font-mono text-xs text-primary/40 tracking-wider">
                                PAYMENT TERMINAL WILL ACTIVATE AFTER FORM VALIDATION
                            </p>
                            {intentError && (
                                <p className="font-mono text-xs text-red-400/80">{intentError}</p>
                            )}
                        </div>
                    )}

                    {/* Terms */}
                    {!isPaymentPhase && (
                        <div
                            className="group flex cursor-pointer items-center gap-3 pt-4"
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
                    )}

                    {/* Action Button */}
                    <div className="pt-8 pb-12">
                        {isPaymentPhase ? (
                            /* Phase 2: Confirm payment with Stripe */
                            <Button
                                size="lg"
                                className="w-full h-16 text-lg tracking-widest transition-all duration-500 rounded-lg bg-accent-b text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                                disabled={!stripe || !elements || loading}
                                onClick={handleConfirmPayment}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        PROCESSING PAYMENT...
                                    </span>
                                ) : (
                                    <>
                                        CONFIRM & DEPLOY <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            /* Phase 1: Validate form + create PaymentIntent */
                            <Button
                                size="lg"
                                className={cn(
                                    "w-full h-16 text-lg tracking-widest transition-all duration-500 rounded-lg",
                                    isFormValid
                                        ? "bg-accent-b text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                                        : "bg-primary/5 text-primary/20 cursor-not-allowed border-primary/10 hover:bg-primary/5"
                                )}
                                disabled={!isFormValid || creatingIntent}
                                onClick={handleInitiatePayment}
                            >
                                {creatingIntent ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        INITIALIZING PAYMENT...
                                    </span>
                                ) : (
                                    <>
                                        {isAuthenticated ? "PROCEED TO PAYMENT" : wantsAccount ? "CREATE ACCOUNT & PAY" : "PROCEED AS GUEST"}
                                        {isFormValid && <ArrowRight className="ml-2 h-5 w-5" />}
                                    </>
                                )}
                            </Button>
                        )}

                        {!isFormValid && !isPaymentPhase && (
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
    const { isAuthenticated } = useAuth();
    const { user } = useAuth();

    return (
        <div className="flex-shrink-0 flex items-center justify-between border-b bg-black/90 px-8 py-5 backdrop-blur-xl z-20" style={{ borderColor: 'var(--color-border-strong)' }}>
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
                <button onClick={closeCheckout} className="group p-2 transition-colors hover:bg-accent-b/10 rounded-md">
                    <X className="h-6 w-6 text-primary/60 transition-colors group-hover:text-accent-b" />
                </button>
            </div>
        </div>
    );
}

function SectionHeader({ title, className }: { title: string, className?: string }) {
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
    icon: Icon
}: {
    label: string,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string,
    placeholder?: string,
    required?: boolean,
    disabled?: boolean,
    icon?: React.ComponentType<{ className?: string }>
}) {
    const [isFocused, setIsFocused] = useState(false);

    const displayPlaceholder = placeholder === "REQUIRED" && required ? (isFocused ? "" : "REQUIRED") : placeholder;

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
