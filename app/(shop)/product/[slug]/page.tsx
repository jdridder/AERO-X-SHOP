"use client";

// import { ProductViewer } from "@/components/3d/ProductViewer";
import { SizeGuideSection } from "@/components/sections/SizeGuideSection";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { PerformanceRadar } from "@/components/shop/PerformanceRadar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useProduct } from "@/lib/hooks/useProducts";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

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

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { product, isLoading, error, refetch } = useProduct(slug);

    if (isLoading) {
        return <ProductLoadingSkeleton />;
    }

    if (error || !product) {
        return <ProductErrorState error={error || "Product not found"} onRetry={refetch} />;
    }

    return (
        <div className="relative min-h-[400vh]">
            {/* <ProductViewer />

            {/* Overlay Content - Fixed for now, or scrolling with the page */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-accent-b font-mono text-xs mb-2">PROTOTYPE: {product.slug.toUpperCase()}</h3>
                        <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase">{product.name}</h1>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-right hidden md:block"
                    >
                        <div className="text-4xl font-headline font-bold">${product.price.toFixed(2)}</div>
                        <div className="text-xs text-primary/60 font-mono">AVAILABLE NOW</div>
                    </motion.div>
                </div>

                {/* Bottom Action Area */}
                <div className="flex justify-between items-end pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassPanel className="hidden md:block w-72 p-6 space-y-4 holographic-glow">
                            <h4 className="font-bold border-b border-primary/20 pb-2 uppercase tracking-widest text-[10px] text-accent-b">
                                AERO-X Intelligence
                            </h4>
                            <div className="py-2 flex justify-center">
                                <PerformanceRadar stats={product.tech_stats} size={240} />
                            </div>
                        </GlassPanel>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <AddToCartButton product={product} />
                    </motion.div>
                </div>

            </div>

            {/* Scroll Indicators / Storytelling text appearing as we scroll */}
            <div className="absolute top-[100vh] w-full flex justify-center pointer-events-none">
                <GlassPanel className="backdrop-blur-md bg-black/40 p-4">
                    <h2 className="text-2xl font-headline">LAYER 1: THERMAL REGULATION</h2>
                </GlassPanel>
            </div>

            {/* Section 2: Holographic Size Guide */}
            <div className="absolute top-[100vh] w-full">
                <SizeGuideSection modelPath="/models/male-tee-model.glb" />
            </div>

            <div className="absolute top-[300vh] w-full flex justify-center pointer-events-none">
                <GlassPanel className="backdrop-blur-md bg-black/40 p-4">
                    <h2 className="text-2xl font-headline">LAYER 2: STORY</h2>
                </GlassPanel>
            </div>

            {/* <div className="rte">
                <p data-mce-fragment="1">
                    Erlebe die perfekte Kombination aus Stil und Funktionalität mit den Wasp Aerodynamics Arm Sleeves und ihren herausragenden Designs.
                    Diese Sleeves vereinen sportliche Höchstleistung mit einem auffälligen Look und bieten dir alles,
                    was du für Training und Wettkampf benötigst.</p>
                <p data-mce-fragment="1"><strong data-mce-fragment="1">Hauptmerkmale</strong></p>
                <ul data-mce-fragment="1">
                <li data-mce-fragment="1"><strong data-mce-fragment="1">
                    Hautähnliche Passform</strong>: Der Arm Sleeve passt sich dank hochwertiger, elastischer Materialien perfekt an die Haut an und minimiert Reibung.</li>
                <li data-mce-fragment="1"><strong data-mce-fragment="1">Einzigartige Designs</strong>: Die Designs unserer Arm Sleeves verleihen deinem Sport-Outfit einen frischen, dynamischen Look.</li>
                <li data-mce-fragment="1"><strong data-mce-fragment="1">Premium-Lycra</strong>: Hergestellt aus hochwertigem, atmungsaktivem Lycra, bietet der Sleeve nicht nur eine hervorragende Passform, sondern auch eine leichte Kompression.</li>
                <li data-mce-fragment="1"><strong data-mce-fragment="1">Wärmend &amp; UV-Schutz</strong>: Der Sleeve schützt deine Arme vor Kälte oder UV-Strahlen, damit du bei jedem Wetter bestens ausgerüstet bist.</li>
                <li data-mce-fragment="1"><strong data-mce-fragment="1">Feine Verarbeitung</strong>: Präzise verarbeitete Designelemente tragen zum hochwertigen Erscheinungsbild und zur Langlebigkeit des Sleeves bei.</li>
                <li data-mce-fragment="1"><strong data-mce-fragment="1">Von Athleten inspiriert</strong>: Entwickelt von und für Athleten, die sowohl Stil als auch Leistung schätzen – ideal für Trainingseinheiten und Wettkämpfe.</li>
                </ul>
                <p data-mce-fragment="1">Mit den Wasp Aerodynamics Arm Sleeves siehst du nicht nur großartig aus, sondern profitierst auch von herausragender Funktionalität, die dich in jeder Situation unterstützt.</p>
                <p data-mce-fragment="1"><strong data-mce-fragment="1">Größe</strong></p>
                <p data-mce-fragment="1">Das Model ist 195 cm groß, wiegt 86 kg und trägt Größe M mit einem Bizepsumfang von 28 cm. Die Arm Sleeves fallen etwas größer aus. Wähle eine Nummer kleiner.</p>
            </div> */}

        </div>
    );
}
