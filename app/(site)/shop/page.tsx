"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

function ProductSkeleton() {
    return (
        <div className="h-[500px] animate-pulse">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-primary/10 bg-white/5">
                <div className="relative aspect-[4/5] w-full bg-white/5" />
                <div className="absolute bottom-0 w-full p-6">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-16 bg-white/10 rounded" />
                            <div className="h-5 w-32 bg-white/10 rounded" />
                        </div>
                        <div className="h-5 w-16 bg-white/10 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    const { products, isLoading, error, refetch } = useProducts();

    return (
        <div className="min-h-screen pt-32 pb-40 container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between border-b border-primary/10 pb-4">
                <div>
                    <h1 className="font-headline text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/50">ARMORY_GRID</h1>
                    <p className="font-mono text-xs text-accent-b mt-2">
                        AVAILABLE PROTOTYPES: {isLoading ? "..." : products.length}
                    </p>
                </div>

                <div className="flex gap-4">
                    <GlassPanel className="px-4 py-2 text-[10px] font-mono text-primary/60">FILTER: [ALL]</GlassPanel>
                </div>
            </div>

            {/* Error State */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8"
                    >
                        <GlassPanel className="p-6 border-red-500/30 bg-red-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <div>
                                        <p className="font-mono text-sm text-red-400">CONNECTION ERROR</p>
                                        <p className="font-mono text-xs text-primary/50 mt-1">{error}</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={refetch}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-primary/20 rounded-full font-mono text-xs text-primary/60 hover:text-accent-a hover:border-accent-a/40 transition-all duration-300"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    RETRY
                                </motion.button>
                            </div>
                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="h-[500px]"
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <p className="font-mono text-sm text-primary/40">NO PRODUCTS AVAILABLE</p>
                </motion.div>
            )}
        </div>
    );
}
