"use client";

import { useCart } from "@/lib/store/useCart";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, AlertTriangle } from "lucide-react";

export function OrderManifest() {
    const { items, total } = useCart();
    const cartTotal = total();
    const isEmpty = items.length === 0;

    return (
        <div className="h-full flex flex-col relative">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-primary/10">
                <ShoppingBag className="w-4 h-4 text-accent-b" />
                <h3 className="font-headline text-sm font-bold text-white tracking-widest">MANIFEST // LIVE</h3>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            layout
                            className="group flex justify-between items-start p-3 rounded-md bg-white/5 border border-primary/5 hover:border-accent-b/30 transition-colors"
                        >
                            <div className="flex-1">
                                <h4 className="font-headline text-xs font-bold text-white group-hover:text-accent-b transition-colors">
                                    {item.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-[10px] text-primary/60">QTY: {item.quantity}</span>
                                    <span className="font-mono text-[10px] text-primary/60">x</span>
                                    <span className="font-mono text-[10px] text-primary/60">${item.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-sm font-bold text-primary/80">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isEmpty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-primary/10 rounded-lg"
                    >
                        <AlertTriangle className="w-8 h-8 text-primary/20 mb-2" />
                        <span className="font-mono text-xs text-primary/40">SYSTEMS EMPTY</span>
                        <span className="font-mono text-[10px] text-accent-b/60 mt-1">ADD GEAR TO PROCEED</span>
                    </motion.div>
                )}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-accent-b/20">
                <div className="flex justify-between items-end">
                    <span className="font-mono text-xs text-primary/60">TOTAL DEPLOYMENT COST</span>
                    <div className="text-right">
                        <motion.div
                            key={cartTotal}
                            initial={{ scale: 1.1, color: "#fff" }}
                            animate={{ scale: 1, color: "#CCFF00" }}
                            className="font-mono text-2xl font-bold text-accent-b drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]"
                        >
                            ${cartTotal.toFixed(2)}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Decor */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-b/20 to-transparent -ml-6 hidden md:block" />
        </div>
    )
}
