"use client";

import { ProductImage } from "@/lib/services/api";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface ProductImageDeckProps {
    images: ProductImage[];
    productName: string;
}

export function ProductImageDeck({ images, productName }: ProductImageDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-primary/10 bg-white/5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[activeIndex].src}
                            alt={images[activeIndex].alt || productName}
                            fill
                            className="object-cover"
                            priority={activeIndex === 0}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Image counter */}
                <div className="absolute bottom-4 left-4 z-10">
                    <span className="font-mono text-[10px] text-white/60 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    </span>
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                                index === activeIndex
                                    ? "border-accent-b shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                                    : "border-primary/10 opacity-60 hover:opacity-100 hover:border-primary/30"
                            )}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt || `${productName} ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
