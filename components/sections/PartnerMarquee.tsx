"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

// Partner data with TypeScript typing
interface Partner {
    id: number;
    name: string;
    src: string;
}

const partnersData: Partner[] = [
    { id: 1, name: "Tech Systems", src: "/logos/wasp-logo-black.svg" },
    { id: 2, name: "Biometric Lab", src: "/logos/wasp-logo-black.svg" },
    { id: 3, name: "Aero Dynamics", src: "/logos/wasp-logo-black.svg" },
    { id: 4, name: "Precision Eng", src: "/logos/wasp-logo-black.svg" },
    { id: 5, name: "Data Systems", src: "/logos/wasp-logo-black.svg" },
    { id: 6, name: "Materials Lab", src: "/logos/wasp-logo-black.svg" },
];

export function PartnerMarquee() {
    const [isHovered, setIsHovered] = useState(false);

    // Duplicate the array to create seamless infinite loop
    const duplicatedPartners = [...partnersData, ...partnersData];

    return (
        <section className="relative w-full py-12 overflow-hidden bg-background/90 backdrop-blur-sm">
            {/* Top "Lab Border" with Plasma Blue glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-accent-b opacity-10 shadow-[0_0_8px_rgba(204,255,0,0.3)]" />

            {/* Section Header */}
            <div className="container mx-auto px-4 mb-8">
                <h2 className="font-headline text-2xl font-bold tracking-widest text-center text-primary/60 uppercase">
                    Technical Alliances
                </h2>
            </div>

            {/* Infinite Marquee Container */}
            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.div
                    className="flex gap-16 items-center"
                    animate={{
                        x: [0, -1200], // Adjust based on content width
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: isHovered ? 40 : 20, // 50% slowdown on hover
                            ease: "linear",
                        },
                    }}
                >
                    {duplicatedPartners.map((partner, index) => (
                        <motion.div
                            key={`${partner.id}-${index}`}
                            className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity duration-300"
                            whileHover={{ opacity: 1 }}
                        >
                            <Image
                                src={partner.src}
                                alt={partner.name}
                                width={120}
                                height={40}
                                className="invert-0 dark:invert transition-all duration-300"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom "Lab Border" with Plasma Blue glow */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-accent-b opacity-10 shadow-[0_0_8px_rgba(204,255,0,0.3)]" />
        </section>
    );
}
