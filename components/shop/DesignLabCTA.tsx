"use client";

import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { motion } from "framer-motion";
import { Check, Pen } from "lucide-react";
import { useState } from "react";

interface DesignLabCTAProps {
    productName: string;
}

export function DesignLabCTA({ productName }: DesignLabCTAProps) {
    const [proposal, setProposal] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!proposal.trim()) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <section className="py-16 md:py-24 px-8 md:px-12">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    <GlassPanel className="p-8 md:p-12 holographic-glow space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-primary/20">
                            <Pen className="w-5 h-5 text-accent-b" />
                            <div>
                                <h3 className="font-headline text-2xl font-bold uppercase tracking-wide">
                                    Design Prompt
                                </h3>
                                <p className="font-mono text-[10px] text-primary/50 tracking-widest">
                                    CUSTOM PROPOSAL INTERFACE
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="font-mono text-sm text-primary/60 leading-relaxed">
                            Have a custom vision for the <span className="text-accent-b">{productName}</span>?
                            Prompt your design modifications below — colourways, patterns, material preferences,
                            or performance requirements.
                        </p>

                        {/* Textarea */}
                        <textarea
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            placeholder="Prompting..."
                            rows={5}
                            className="w-full bg-white/5 border border-primary/20 rounded-lg p-4 font-mono text-sm text-primary placeholder:text-primary/30 resize-none focus:outline-none focus:border-accent-b/60 transition-colors caret-accent-b"
                        />

                        {/* Submit */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!proposal.trim() || submitted}
                            className="w-full md:w-auto bg-accent-b/10 border border-accent-b/40 text-accent-b hover:bg-accent-b/20 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-2">
                                {submitted ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span className="font-headline font-bold">PROPOSAL SUBMITTED</span>
                                    </>
                                ) : (
                                    <span className="font-headline font-bold">SUBMIT PROPOSAL</span>
                                )}
                            </div>
                        </Button>
                    </GlassPanel>
                </motion.div>
            </div>
        </section>
    );
}
