"use client";

import { StorytellingBlock } from "@/lib/services/api";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { motion } from "framer-motion";
import Image from "next/image";

interface DynamicStorytellingProps {
    block: StorytellingBlock;
    index: number;
}

export function DynamicStorytelling({ block, index }: DynamicStorytellingProps) {
    const reversed = block.layoutDirection === "reversed";

    const imageEl = (
        <motion.div
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-primary/10"
        >
            <Image
                src={block.image}
                alt={block.title}
                fill
                className="object-cover"
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: reversed
                        ? "linear-gradient(to left, var(--color-bg), transparent 60%)"
                        : "linear-gradient(to right, var(--color-bg), transparent 60%)",
                }}
            />
        </motion.div>
    );

    const textEl = (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center"
        >
            <GlassPanel className="p-8 space-y-4 holographic-glow">
                <span className="font-mono text-[10px] text-accent-a tracking-widest">
                    CHAPTER {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-wide">
                    {block.title}
                </h3>
                <p className="font-mono text-sm text-primary/70 leading-relaxed">
                    {block.text}
                </p>
            </GlassPanel>
        </motion.div>
    );

    return (
        <section className="py-16 md:py-24 px-8 md:px-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {reversed ? (
                    <>
                        {textEl}
                        {imageEl}
                    </>
                ) : (
                    <>
                        {imageEl}
                        {textEl}
                    </>
                )}
            </div>
        </section>
    );
}
