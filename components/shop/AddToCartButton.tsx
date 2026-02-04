"use client";

import { useCart } from "@/lib/store/useCart";
import { Button } from "@/components/ui/Button";
import { Product } from "@/lib/services/api";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product }: { product: Product }) {
    const addItem = useCart((state) => state.addItem);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addItem(product);
        setIsAdded(true);

        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <Button
            size="lg"
            onClick={handleAddToCart}
            className={cn(
                "w-full md:w-auto mt-4 md:mt-0 pointer-events-auto transition-all duration-300 min-w-[240px]",
                isAdded && "bg-accent-b text-black hover:bg-accent-b hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"
            )}
        >
            <div className="flex items-center gap-2">
                {isAdded ? (
                    <>
                        <Check className="w-5 h-5" />
                        <span className="font-headline font-bold">ADDED TO SYSTEMS</span>
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" />
                        <span className="font-headline font-bold">ADD TO CART — ${product.price.toFixed(2)}</span>
                    </>
                )}
            </div>
        </Button>
    );
}
