import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/services/api';

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    isCheckoutOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    openCheckout: () => void;
    closeCheckout: () => void;
    toggleCheckout: () => void;
    addItem: (product: Product, selectedSize?: string) => void;
    removeItem: (productId: string, selectedSize?: string) => void;
    updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            isCheckoutOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
            closeCheckout: () => set({ isCheckoutOpen: false }),
            toggleCheckout: () => set((state) => ({ isCheckoutOpen: !state.isCheckoutOpen, isOpen: false })),
            addItem: (product, selectedSize) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(
                    (item) => item.id === product.id && item.selectedSize === selectedSize
                );

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id && item.selectedSize === selectedSize
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...currentItems, { ...product, quantity: 1, selectedSize }],
                        isOpen: true,
                    });
                }
            },
            removeItem: (productId, selectedSize) => {
                set({
                    items: get().items.filter(
                        (item) => !(item.id === productId && item.selectedSize === selectedSize)
                    ),
                });
            },
            updateQuantity: (productId, quantity, selectedSize) => {
                if (quantity <= 0) {
                    get().removeItem(productId, selectedSize);
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === productId && item.selectedSize === selectedSize
                                ? { ...item, quantity }
                                : item
                        ),
                    });
                }
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'aero-x-cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
        }
    )
);
