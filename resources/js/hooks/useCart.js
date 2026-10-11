import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const CART_STORAGE_KEY = 'bizzhuss_cart_v1';

export function useCart() {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }, [cart]);

    const addItem = (product, quantity = 1, openDrawer = true) => {
        let authUser = null;
        try {
            if (typeof window !== 'undefined' && router?.page?.props?.auth?.user) {
                authUser = router.page.props.auth.user;
            }
        } catch {}
        if (!authUser) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            router.visit(`/login?intended=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            const img = product.image || 
                        (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
                        product.thumbnail || 
                        null;

            return [
                ...prev,
                {
                    id: product.id,
                    title: product.title,
                    price: Number(product.price) || 0,
                    image: img,
                    sku: product.sku || `SKU-${product.id}`,
                    vendorName: product.vendor?.shop_name || product.vendorName || 'Verified Merchant',
                    vendorId: product.vendor_id || product.vendor?.id || 1,
                    quantity: quantity,
                },
            ];
        });
        if (openDrawer) {
            setIsCartOpen(true);
        }
    };

    const removeItem = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        cart,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
    };
}
