import React, { createContext, useContext, useState } from 'react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';
import { useNotification } from '@/hooks/useNotification';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const cartState = useCart();
    const wishlistState = useWishlist();
    const notificationState = useNotification();
    const [previewRole, setPreviewRole] = useState('customer');

    return (
        <AppContext.Provider
            value={{
                ...cartState,
                ...wishlistState,
                ...notificationState,
                previewRole,
                setPreviewRole,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    return context || {};
}

export default AppContext;
