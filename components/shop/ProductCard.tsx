"use client";

import { Product } from "@/lib/services/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PerformanceRadar } from "./PerformanceRadar";


interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <Link href={`/product/${product.slug}`} className={cn("group relative block h-full", className)}>
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-primary/10 bg-white/5 backdrop-blur-md transition-all duration-300 group-hover:border-accent-a/50">

                {/* Scanline Effect */}
                <div className="absolute inset-0 z-10 translate-y-[-100%] bg-gradient-to-b from-transparent via-accent-a/10 to-transparent group-hover:animate-scanline pointer-events-none" />

                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/20">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t opacity-80" style={{ backgroundImage: 'linear-gradient(to top, var(--color-bg), color-mix(in srgb, var(--color-bg) 20%, transparent), transparent)' }} />

                    {/* Top Right Decoration */}
                    <div className="absolute top-2 right-2 z-20">
                        <Plus className="h-4 w-4 text-primary/40 transition-colors group-hover:text-accent-a" />
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 w-full p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-accent-b tracking-wider uppercase">
                                {product.category}
                            </span>
                            <h3 className="font-headline text-lg font-bold leading-tight uppercase tracking-wide group-hover:text-white transition-colors">
                                {product.name}
                            </h3>
                        </div>
                        <div className="font-headline text-lg font-bold text-accent-a">
                            ${product.price}
                        </div>
                    </div>
                </div>


                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/20 transition-colors group-hover:border-accent-a" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/20 transition-colors group-hover:border-accent-a" />

            </div>
        </Link>
    );
}
