import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/services/api';

export interface CartItem extends Product {
    quantity: number;
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
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
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
            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        ),
                        isOpen: true, // Open cart when adding item
                    });
                } else {
                    set({ items: [...currentItems, { ...product, quantity: 1 }], isOpen: true });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === productId ? { ...item, quantity } : item
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
            // Only persist items, not UI state
            partialize: (state) => ({ items: state.items }),
        }
    )
);
