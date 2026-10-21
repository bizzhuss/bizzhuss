import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { getProductImage } from '@/lib/productImage';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'bizzhuss_cart_v2';

export function CartProvider({ children }) {
    let hookUser = null;
    try {
        const page = usePage();
        hookUser = page?.props?.auth?.user || null;
    } catch {}

    const getAuthUser = useCallback(() => {
        if (hookUser) return hookUser;
        try {
            if (typeof window !== 'undefined' && router?.page?.props?.auth?.user) {
                return router.page.props.auth.user;
            }
        } catch {}
        try {
            if (typeof window !== 'undefined') {
                const scriptEl = document.querySelector('script[data-page="app"][type="application/json"]');
                if (scriptEl?.textContent) {
                    const parsed = JSON.parse(scriptEl.textContent);
                    if (parsed?.props?.auth?.user) return parsed.props.auth.user;
                }
                const appEl = document.getElementById('app');
                if (appEl?.dataset?.page) {
                    const parsed = JSON.parse(appEl.dataset.page);
                    if (parsed?.props?.auth?.user) return parsed.props.auth.user;
                }
            }
        } catch {}
        return null;
    }, [hookUser]);

    const [cart, setCart] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load cart from localStorage:', e);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
    }, [cart]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === CART_STORAGE_KEY && e.newValue) {
                try {
                    setCart(JSON.parse(e.newValue));
                } catch (err) {
                    console.error('Error synchronizing cart across tabs:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Resolve safe product image
    const resolveProductImage = (product) => {
        return getProductImage(product);
    };

    /**
     * Add product to cart.
     * If product already exists in cart (matching id and variant), increment quantity.
     * Strictly requires authentication; guests are redirected to /login.
     */
    const addToCart = useCallback((product, quantity = 1, selectedVariant = null, openDrawer = false) => {
        const currentUser = getAuthUser();
        if (!currentUser) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            router.visit(`/login?intended=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return false;
        }

        const qty = Math.max(1, Number(quantity) || 1);
        const variantKey = selectedVariant ? (typeof selectedVariant === 'object' ? JSON.stringify(selectedVariant) : String(selectedVariant)) : null;

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => {
                const sameId = String(item.productId || item.id) === String(product.id);
                const sameVariant = (item.selectedVariant || null) === variantKey;
                return sameId && sameVariant;
            });

            if (existingIndex > -1) {
                // Item exists: update quantity
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + qty,
                };
                return updated;
            }

            // New item: append to cart
            const price = Number(product.price) || 0;
            const comparePrice = product.compare_price ? Number(product.compare_price) : null;
            const imageUrl = resolveProductImage(product);
            const vendorName = product.vendor?.shop_name || product.vendorName || product.vendor?.name || 'Verified Merchant';
            const vendorId = product.vendor_id || product.vendor?.id || 1;

            const newItem = {
                id: variantKey ? `${product.id}-${variantKey}` : product.id,
                productId: product.id,
                title: product.title,
                slug: product.slug || product.id,
                sku: product.sku || `SKU-${product.id}`,
                price: price,
                compare_price: comparePrice,
                image: imageUrl,
                vendorName: vendorName,
                vendorId: vendorId,
                vendor: product.vendor || { id: vendorId, shop_name: vendorName },
                selectedVariant: variantKey,
                variantLabel: selectedVariant ? (typeof selectedVariant === 'object' ? Object.values(selectedVariant).join(', ') : String(selectedVariant)) : null,
                quantity: qty,
            };

            return [...prevCart, newItem];
        });

        if (openDrawer) {
            setIsCartOpen(true);
        }
    }, []);

    /**
     * Remove item from cart by id (or productId + variant)
     */
    const removeFromCart = useCallback((productId, selectedVariant = null) => {
        const variantKey = selectedVariant ? (typeof selectedVariant === 'object' ? JSON.stringify(selectedVariant) : String(selectedVariant)) : null;

        setCart((prevCart) =>
            prevCart.filter((item) => {
                const matchId = String(item.id) === String(productId) || String(item.productId) === String(productId);
                if (variantKey) {
                    return !(matchId && (item.selectedVariant || null) === variantKey);
                }
                return !matchId;
            })
        );
    }, []);

    /**
     * Update quantity of an item in cart
     */
    const updateQuantity = useCallback((productId, newQuantity, selectedVariant = null) => {
        const qty = Number(newQuantity);
        if (qty <= 0) {
            removeFromCart(productId, selectedVariant);
            return;
        }

        const variantKey = selectedVariant ? (typeof selectedVariant === 'object' ? JSON.stringify(selectedVariant) : String(selectedVariant)) : null;

        setCart((prevCart) =>
            prevCart.map((item) => {
                const matchId = String(item.id) === String(productId) || String(item.productId) === String(productId);
                const matchVariant = variantKey ? (item.selectedVariant || null) === variantKey : true;

                if (matchId && matchVariant) {
                    return { ...item, quantity: qty };
                }
                return item;
            })
        );
    }, [removeFromCart]);

    /**
     * Clear all items in cart
     */
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Total quantity of all items in cart
    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }, [cart]);

    // Sum of (price * quantity)
    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    }, [cart]);

    const contextValue = useMemo(() => ({
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        // Aliases for full backwards compatibility
        addItem: addToCart,
        removeItem: removeFromCart,
        totalItems: cartCount,
        subtotal: cartSubtotal,
    }), [
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export default CartContext;
