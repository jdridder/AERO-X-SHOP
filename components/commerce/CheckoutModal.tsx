"use client";

import { useCart } from "@/lib/store/useCart";
import { Button } from "@/components/ui/Button";
import { OrderManifest } from "@/components/commerce/OrderManifest";
import { X, Shield, CreditCard, Lock, Zap, ArrowRight, Check, User, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile, smartCheckout, ProfileResponse } from "@/lib/services/api";

type PaymentMethod = "credit_card" | "paypal" | "apple_pay" | "google_pay" | null;

interface Toast {
    type: "success" | "error";
    message: string;
}

export function CheckoutModal() {
    const { isCheckoutOpen, closeCheckout, clearCart, items, total } = useCart();
    const { isAuthenticated, loginSuccess, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

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

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

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
            // Profile load failed, use empty form
            setProfileLoaded(true);
        }
    };

    // Scroll Lock Side Effect
    useEffect(() => {
        if (isCheckoutOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isCheckoutOpen]);

    if (!mounted) return null;

    // Validation Logic
    const baseValidation =
        formData.email.length > 0 &&
        formData.address.length > 0 &&
        formData.firstName.length > 0 &&
        formData.lastName.length > 0 &&
        formData.city.length > 0 &&
        formData.postalCode.length > 0 &&
        paymentMethod !== null &&
        termsAccepted;

    // Password validation for new account creation
    const passwordValid = !wantsAccount || (
        formData.password.length >= 8 &&
        /[0-9]/.test(formData.password) &&
        /[A-Z]/.test(formData.password)
    );

    const isFormValid = baseValidation && passwordValid;

    const handlePurchase = async () => {
        if (!isFormValid) return;

        setLoading(true);
        try {
            const orderItems = items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image_url: item.image_url,
            }));

            const shippingAddress = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
            };

            // Smart checkout handles all 3 cases
            const response = await smartCheckout(
                orderItems,
                total(),
                shippingAddress,
                wantsAccount && !isAuthenticated ? formData.password : undefined
            );

            // If new account was created, update auth state
            if (response.isNewAccount && response.userId && response.email) {
                loginSuccess({ userId: response.userId, email: response.email });
                showToast("success", "ACCOUNT CREATED & ORDER DEPLOYED");
            } else if (response.isGuest) {
                showToast("success", "GUEST ORDER DEPLOYED");
            } else {
                showToast("success", "ORDER DEPLOYED SUCCESSFULLY");
            }

            clearCart();
            closeCheckout();
            setFormData({
                firstName: "", lastName: "", email: "", address: "", city: "", postalCode: "", password: ""
            });
            setPaymentMethod(null);
            setTermsAccepted(false);
            setWantsAccount(false);
        } catch (error) {
            showToast("error", error instanceof Error ? error.message : "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }

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

                    {/* Holographic Modal - Floating Animation Container */}
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
                        <div className="flex-shrink-0 flex items-center justify-between border-b bg-black/90 px-8 py-5 backdrop-blur-xl z-20" style={{ borderColor: 'var(--color-border-strong)' }}>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-accent-b" />
                                <h2 className="font-headline text-2xl font-bold tracking-widest text-white">
                                    COMMAND CENTER <span className="text-accent-b">// CHECKOUT</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Auth Status Badge */}
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

                        {/* Split Pane Layout */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* LEFT COLUMN: FORM (Scrollable) */}
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

                                        {/* Authenticated User Banner */}
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

                                        {/* Account Creation Option for Guests */}
                                        {!isAuthenticated && (
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
                                        />
                                        <div className="grid grid-cols-2 gap-5">
                                            <HoloInput
                                                label="SECTOR (CITY)"
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
                                    </div>

                                    {/* Payment Section */}
                                    <div className="space-y-6">
                                        <SectionHeader title="03 // PAYMENT PROTOCOL" />
                                        <div className="space-y-3">
                                            <PaymentToggle
                                                active={paymentMethod === "credit_card"}
                                                onClick={() => setPaymentMethod("credit_card")}
                                                label="CREDIT CARD (STRIPE)"
                                                icon={CreditCard}
                                            />

                                            <AnimatePresence>
                                                {paymentMethod === "credit_card" && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-4 border-l-2 border-accent-b/20 pl-4 pt-2 mb-4">
                                                            <HoloInput label="CARD NUMBER" placeholder="0000 0000 0000 0000" icon={Lock} />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <HoloInput label="EXPIRY" placeholder="MM/YY" />
                                                                <HoloInput label="CVC" placeholder="123" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <PaymentToggle
                                                active={paymentMethod === "paypal"}
                                                onClick={() => setPaymentMethod("paypal")}
                                                label="PAYPAL SECURE"
                                                icon={Lock}
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <PaymentToggle
                                                    active={paymentMethod === "apple_pay"}
                                                    onClick={() => setPaymentMethod("apple_pay")}
                                                    label="APPLE PAY"
                                                    compact
                                                />
                                                <PaymentToggle
                                                    active={paymentMethod === "google_pay"}
                                                    onClick={() => setPaymentMethod("google_pay")}
                                                    label="GOOGLE PAY"
                                                    compact
                                                />
                                            </div>
                                        </div>

                                        {/* Terms */}
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

                                        {/* Purchase Button */}
                                        <div className="pt-8 pb-12">
                                            <Button
                                                size="lg"
                                                className={cn(
                                                    "w-full h-16 text-lg tracking-widest transition-all duration-500 rounded-lg",
                                                    isFormValid
                                                        ? "bg-accent-b text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                                                        : "bg-primary/5 text-primary/20 cursor-not-allowed border-primary/10 hover:bg-primary/5"
                                                )}
                                                disabled={!isFormValid || loading}
                                                onClick={handlePurchase}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                        PROCESSING...
                                                    </span>
                                                ) : (
                                                    <>
                                                        {isAuthenticated ? "DEPLOY ORDER" : wantsAccount ? "CREATE ACCOUNT & DEPLOY" : "DEPLOY AS GUEST"}
                                                        {isFormValid && <ArrowRight className="ml-2 h-5 w-5" />}
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

// Sub-components

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
                            ? "border-accent-b shadow-[0_4px_12px_-6px_rgba(204,255,0,0.3)] bg-accent-b/5"
                            : "focus:border-accent-b focus:bg-accent-b/5",
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

function PaymentToggle({
    active,
    onClick,
    label,
    icon: Icon,
    compact
}: {
    active: boolean,
    onClick: () => void,
    label: string,
    icon?: React.ComponentType<{ className?: string }>,
    compact?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex w-full items-center gap-3 border transition-all duration-300 overflow-hidden rounded-md",
                compact ? "h-12 justify-center px-4" : "h-14 px-6",
                active
                    ? "border-accent-b bg-accent-b/10 text-accent-b shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                    : "border-primary/10 bg-white/5 text-primary/60 hover:bg-white/10 hover:border-primary/30"
            )}
        >
            {/* Scanline Effect on Active */}
            {active && (
                <motion.div
                    layoutId="payment-scan"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-b/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            )}

            {Icon && <Icon className="h-5 w-5" />}
            <span className="font-mono text-xs font-bold tracking-wider relative z-10">{label}</span>

            {active && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-b shadow-[0_0_5px_#CCFF00]"
                />
            )}
        </button>
    )
}
