"use client";

import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { SizeSelector } from "@/components/shop/SizeSelector";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Product } from "@/lib/services/api";
import { motion, useScroll, useTransform } from "framer-motion";

interface ProductHUDProps {
    product: Product;
    selectedSize: string | null;
    onSizeChange: (size: string) => void;
}

export function ProductHUD({ product, selectedSize, onSizeChange }: ProductHUDProps) {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [200, 400], [0, 1]);

    const hasSizes = product.availableSizes && product.availableSizes.length > 0;

    return (
        <motion.div
            style={{ opacity }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-2xl"
        >
            <GlassPanel className="p-4 flex flex-col sm:flex-row items-center gap-4 border border-primary/20 shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
                {/* Size Selection */}
                {hasSizes && (
                    <div className="flex-1 min-w-0">
                        <SizeSelector
                            sizes={product.availableSizes!}
                            selectedSize={selectedSize}
                            onSizeChange={onSizeChange}
                            compact
                        />
                    </div>
                )}

                {/* Price + Add to Cart */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-headline text-xl font-bold hidden sm:block">
                        ${product.price.toFixed(2)}
                    </span>
                    <AddToCartButton product={product} selectedSize={selectedSize} />
                </div>
            </GlassPanel>
        </motion.div>
    );
}
