"use client";

import { SizeGuideSection } from "@/components/sections/SizeGuideSection";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { DesignLabCTA } from "@/components/shop/DesignLabCTA";
import { DynamicStorytelling } from "@/components/shop/DynamicStorytelling";
import { PerformanceRadar } from "@/components/shop/PerformanceRadar";
import { ProductHUD } from "@/components/shop/ProductHUD";
import { ProductImageDeck } from "@/components/shop/ProductImageDeck";
import { SizeSelector } from "@/components/shop/SizeSelector";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProduct } from "@/lib/hooks/useProducts";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ── Loading & Error States ──────────────────────────────────────

function ProductLoadingSkeleton() {
    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <Loader2 className="w-10 h-10 text-accent-a animate-spin" />
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                                boxShadow: [
                                    "0 0 10px rgba(77, 77, 255, 0.3)",
                                    "0 0 30px rgba(77, 77, 255, 0.5)",
                                    "0 0 10px rgba(77, 77, 255, 0.3)",
                                ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                    <span className="font-mono text-xs text-primary/50 tracking-widest">LOADING PROTOTYPE...</span>
                </motion.div>
            </div>
        </div>
    );
}

function ProductErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto p-8"
                >
                    <GlassPanel className="p-8 text-center border-red-500/30 bg-red-500/5">
                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="font-headline text-xl font-bold text-primary mb-2">PROTOTYPE NOT FOUND</h2>
                        <p className="font-mono text-xs text-primary/50 mb-6">{error}</p>
                        <motion.button
                            onClick={onRetry}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-accent-a/10 border border-accent-a/40 rounded-full font-mono text-xs text-accent-a hover:bg-accent-a/20 transition-all duration-300"
                        >
                            RETRY CONNECTION
                        </motion.button>
                    </GlassPanel>
                </motion.div>
            </div>
        </div>
    );
}

// ── Product Page Template ───────────────────────────────────────

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { product, isLoading, error, refetch } = useProduct(slug);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    if (isLoading) return <ProductLoadingSkeleton />;
    if (error || !product) return <ProductErrorState error={error || "Product not found"} onRetry={refetch} />;

    const images = product.images?.length
        ? product.images
        : [{ src: product.image_url, alt: product.name }];

    return (
        <div className="relative pb-28">

            {/* ── HERO SECTION ─────────────────────────────────── */}
            <section className="min-h-screen flex flex-col lg:flex-row gap-8 lg:gap-12 p-8 md:p-12 pt-24 md:pt-28">
                {/* Left: Image Gallery */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full lg:w-1/2"
                >
                    <ProductImageDeck images={images} productName={product.name} />
                </motion.div>

                {/* Right: Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="w-full lg:w-1/2 space-y-6 lg:pt-8"
                >
                    <div>
                        <span className="text-accent-b font-mono text-xs tracking-widest">
                            PROTOTYPE: {product.slug.toUpperCase()}
                        </span>
                        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold uppercase mt-2">
                            {product.name}
                        </h1>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-3xl md:text-4xl font-headline font-bold">
                            ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-primary/50 font-mono tracking-wider">
                            {product.category}
                        </span>
                    </div>

                    {/* Performance Radar */}
                    <GlassPanel className="holographic-glow p-6 space-y-4">
                        <h4 className="font-bold border-b border-primary/20 pb-2 uppercase tracking-widest text-[10px] text-accent-b">
                            AERO-X Intelligence
                        </h4>
                        <div className="py-2 flex justify-center">
                            <PerformanceRadar stats={product.tech_stats} size={240} />
                        </div>
                    </GlassPanel>

                    {/* Inline Size Selector */}
                    {product.availableSizes && product.availableSizes.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-mono text-xs tracking-widest text-accent-b uppercase">
                                Select Size
                            </h4>
                            <SizeSelector
                                sizes={product.availableSizes}
                                selectedSize={selectedSize}
                                onSizeChange={setSelectedSize}
                            />
                        </div>
                    )}

                    {/* Inline Add to Cart */}
                    <AddToCartButton product={product} selectedSize={selectedSize} />
                </motion.div>
            </section>

            {/* ── HOLOGRAPHIC SIZE GUIDE ───────────────────────── */}
            {product.threeModelPath && (
                <SizeGuideSection
                    modelPath={product.threeModelPath}
                    annotations={product.annotations}
                    measurements={product.measurements}
                    availableSizes={product.availableSizes}
                />
            )}

            {/* ── STORYTELLING SECTIONS ────────────────────────── */}
            {product.storytelling?.map((block, index) => (
                <DynamicStorytelling key={index} block={block} index={index} />
            ))}

            {/* ── DESIGN LAB CTA ──────────────────────────────── */}
            <DesignLabCTA productName={product.name} />

            {/* ── STICKY HUD (appears on scroll) ──────────────── */}
            <ProductHUD
                product={product}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
            />
        </div>
    );
}
