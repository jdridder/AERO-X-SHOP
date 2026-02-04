"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { useProducts } from "@/lib/hooks/useProducts";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function FeaturedSkeleton() {
    return (
        <div className="h-[400px] animate-pulse">
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

export function FeaturedSection() {
    const { products, isLoading, error } = useProducts();
    const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    } as const;

    return (
        <section className="py-32 container mx-auto px-4">
            <div className="flex flex-col gap-12">
                <div className="flex justify-between items-end border-b border-primary/20 pb-4">
                    <div>
                        <span className="font-mono text-xs text-accent-b tracking-widest">DEPLOYED_GEAR</span>
                        <h2 className="font-headline text-3xl md:text-5xl font-bold mt-2">FEATURED<br />PROTOTYPES</h2>
                    </div>
                    <Link href="/shop">
                        <Button variant="link" className="hidden md:flex">
                            VIEW ALL <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <FeaturedSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="font-mono text-sm text-primary/40">UNABLE TO LOAD FEATURED PROTOTYPES</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {featuredProducts.map((product) => (
                            <motion.div key={product.id} variants={item}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <Link href="/shop" className="md:hidden">
                    <Button className="w-full">
                        VIEW ALL GEAR <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
