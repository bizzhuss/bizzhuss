import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { getProductImage } from '@/lib/productImage';

export const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = 'bizzhuss_wishlist_v2';

export function WishlistProvider({ children }) {
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

    const [wishlist, setWishlist] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load wishlist from localStorage:', e);
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        } catch (e) {
            console.error('Failed to save wishlist to localStorage:', e);
        }
    }, [wishlist]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
                try {
                    setWishlist(JSON.parse(e.newValue));
                } catch (err) {
                    console.error('Error synchronizing wishlist across tabs:', err);
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
     * Check if a product is in the wishlist
     */
    const isInWishlist = useCallback((productId) => {
        if (!productId) return false;
        return wishlist.some((item) => String(item.id) === String(productId));
    }, [wishlist]);

    /**
     * Toggle wishlist item: add if not present, remove if present.
     * Strictly requires authentication; guests are redirected to /login.
     * Returns true if added, false if removed.
     */
    const toggleWishlist = useCallback((product) => {
        const currentUser = getAuthUser();
        if (!currentUser) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            router.visit(`/login?intended=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return false;
        }

        if (!product || !product.id) return false;

        const exists = wishlist.some((item) => String(item.id) === String(product.id));

        if (exists) {
            setWishlist((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
            return false;
        }

        const price = Number(product.price) || 0;
        const comparePrice = product.compare_price ? Number(product.compare_price) : null;
        const imageUrl = resolveProductImage(product);
        const vendorName = product.vendor?.shop_name || product.vendorName || product.vendor?.name || 'Verified Merchant';

        const newItem = {
            id: product.id,
            title: product.title,
            slug: product.slug || product.id,
            sku: product.sku || `SKU-${product.id}`,
            price: price,
            compare_price: comparePrice,
            image: imageUrl,
            rating: product.rating || 4.9,
            reviews_count: product.reviews_count || 48,
            stock_quantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : 50,
            vendorName: vendorName,
            vendor: product.vendor || { id: product.vendor_id || 1, shop_name: vendorName },
            description: product.description || 'Verified manufacturer component rated for industrial reliability.',
        };

        setWishlist((prev) => [...prev, newItem]);
        return true;
    }, [wishlist]);

    /**
     * Remove item from wishlist
     */
    const removeFromWishlist = useCallback((productId) => {
        setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    }, []);

    /**
     * Clear all wishlist items
     */
    const clearWishlist = useCallback(() => {
        setWishlist([]);
    }, []);

    // Total wishlist items count
    const wishlistCount = useMemo(() => {
        return wishlist.length;
    }, [wishlist]);

    const contextValue = useMemo(() => ({
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
    }), [
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
    ]);

    return (
        <WishlistContext.Provider value={contextValue}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}

export default WishlistContext;
