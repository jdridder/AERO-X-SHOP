"use client";

import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CreditCard, Wallet } from "lucide-react";

export function PaymentMethods() {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs text-primary/60 mb-2">SELECT PAYMENT PROTOCOL</h3>

            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 p-4 border border-primary/20 rounded bg-white/5 hover:bg-white/10 hover:border-accent-a transition-all group">
                    <CreditCard className="w-4 h-4 text-primary group-hover:text-accent-a" />
                    <span className="font-mono text-xs font-bold">CARD</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-4 border border-primary/20 rounded bg-white/5 hover:bg-white/10 hover:border-accent-a transition-all group">
                    <Wallet className="w-4 h-4 text-primary group-hover:text-accent-a" />
                    <span className="font-mono text-xs font-bold">PAYPAL</span>
                </button>
            </div>

            <button className="w-full p-4 border border-primary/20 rounded bg-black flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
                <span className="font-sans font-bold text-white">Apple Pay</span>
            </button>
        </div>
    );
}

export function CheckoutForm() {
    return (
        <GlassPanel className="p-6 flex flex-col gap-8 max-w-lg w-full">
            <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                <h2 className="font-headline text-2xl font-bold">CHECKOUT</h2>
                <div className="font-mono text-xs text-accent-b">SECURE_CONNECTION_ESTABLISHED</div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs text-primary/60">SHIPPING VECTOR</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input className="col-span-1 bg-white/5 border border-primary/20 rounded p-3 text-sm font-mono focus:border-accent-a outline-none" placeholder="FIRST_NAME" />
                    <input className="col-span-1 bg-white/5 border border-primary/20 rounded p-3 text-sm font-mono focus:border-accent-a outline-none" placeholder="LAST_NAME" />
                    <input className="col-span-2 bg-white/5 border border-primary/20 rounded p-3 text-sm font-mono focus:border-accent-a outline-none" placeholder="ADDRESS_LINE_1" />
                    <input className="col-span-2 bg-white/5 border border-primary/20 rounded p-3 text-sm font-mono focus:border-accent-a outline-none" placeholder="CITY / ZIP / COUNTRY" />
                </div>
            </div>

            <PaymentMethods />

            <div className="border-t border-primary/10 pt-4 flex flex-col gap-4">
                <div className="flex justify-between font-mono text-sm">
                    <span>TOTAL</span>
                    <span className="font-bold">$125.00</span>
                </div>
                <Button className="w-full" onClick={() => alert("Processing Payment Stub...")}>
                    CONFIRM ORDER
                </Button>
            </div>
        </GlassPanel>
    );
}
