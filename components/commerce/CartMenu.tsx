"use client";

import { useCart } from "@/lib/store/useCart";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel"; // Assuming you have this or similar
import { X, Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function CartMenu() {
    const cart = useCart();
    const [mounted, setMounted] = useState(false);

    // Hydration fix for persisted store
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {cart.isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={cart.closeCart}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-primary/20 backdrop-blur-xl shadow-2xl"
                        style={{ background: 'var(--checkout-bg)' }}
                    >
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-primary/20 p-6">
                                <div>
                                    <h2 className="font-headline text-2xl font-bold text-white">ARMORY CART</h2>
                                    <p className="font-mono text-xs text-primary/60">SECURE TRANSACTION PROTOCOL</p>
                                </div>
                                <button
                                    onClick={cart.closeCart}
                                    className="rounded-full p-2 text-primary/60 transition-colors hover:bg-primary/10 hover:text-primary"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {cart.items.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                                        <div className="rounded-full bg-primary/5 p-4">
                                            <ShieldCheck className="h-8 w-8 text-primary/40" />
                                        </div>
                                        <p className="font-mono text-sm text-primary/60">NO ASSETS DETECTED</p>
                                        <Button variant="secondary" onClick={cart.closeCart}>
                                            RETURN TO CATALOG
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.items.map((item) => (
                                            <div key={`${item.id}__${item.selectedSize ?? ""}`} className="flex gap-4">
                                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-primary/20 bg-white/5">
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between">
                                                            <h3 className="font-headline text-sm font-bold text-white">{item.name}</h3>
                                                            <p className="font-mono text-sm text-accent-a">${item.price * item.quantity}</p>
                                                        </div>
                                                        <p className="font-mono text-[10px] text-primary/60">
                                                            {item.category}
                                                            {item.selectedSize && <span className="ml-2 text-accent-b">SIZE: {item.selectedSize}</span>}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 rounded-md border border-primary/10 bg-white/5 px-2 py-1">
                                                            <button
                                                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                                                className="text-primary/60 hover:text-white"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="font-mono text-xs text-white w-4 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                                                className="text-primary/60 hover:text-white"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => cart.removeItem(item.id, item.selectedSize)}
                                                            className="text-primary/40 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer / Checkout */}
                            {cart.items.length > 0 && (
                                <div className="border-t border-primary/20 bg-black/40 p-6 backdrop-blur-md">
                                    <div className="mb-4 flex justify-between">
                                        <span className="font-mono text-sm text-primary/60">TOTAL</span>
                                        <span className="font-mono text-xl font-bold text-accent-a">${cart.total()}</span>
                                    </div>
                                    <Button
                                        className="w-full relative overflow-hidden group"
                                        onClick={cart.openCheckout}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            INITIATE CHECKOUT sequence
                                            <span className="animate-pulse">_</span>
                                        </span>
                                        {/* Progress fill animation on hover could go here */}
                                        <div className="absolute inset-0 bg-accent-a/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
