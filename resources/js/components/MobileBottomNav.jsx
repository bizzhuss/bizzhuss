import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useApp } from '@/context/AppContext';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
    const { auth, url = '' } = usePage().props;
    const { totalItems, cartCount, wishlistCount, setIsCartOpen } = useApp();

    const itemCount = totalItems ?? cartCount ?? 0;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : url;

    // Determine account link based on role
    const getAccountHref = () => {
        if (!auth?.user) return '/login';
        switch (auth.user.role) {
            case 'super_admin':
                return '/admin';
            case 'vendor':
                return '/vendor';
            case 'marketing_manager':
                return '/marketing/dashboard';
            case 'employee':
                return '/employee';
            case 'customer':
            default:
                return '/customer/dashboard';
        }
    };

    const isHomeActive = currentUrl === '/' || currentUrl === '';
    const isShopActive = currentUrl.startsWith('/shop');
    const isWishlistActive = currentUrl.startsWith('/wishlist');
    const isAccountActive = currentUrl.startsWith('/customer') || 
                            currentUrl.startsWith('/admin') || 
                            currentUrl.startsWith('/vendor') || 
                            currentUrl.startsWith('/employee') || 
                            currentUrl.startsWith('/marketing') ||
                            currentUrl.startsWith('/login') ||
                            currentUrl.startsWith('/register');

    const handleCartClick = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
            router.visit(`/login?intended=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please sign in to access your shopping cart.')}`);
            return;
        }
        setIsCartOpen(true);
    };

    const handleWishlistClick = (e) => {
        if (!auth?.user) {
            e.preventDefault();
            router.visit(`/login?intended=${encodeURIComponent('/wishlist')}&message=${encodeURIComponent('Please sign in to view your wishlist.')}`);
        }
    };

    return (
        <aside 
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
        >
            {/* Home */}
            <Link
                href="/"
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
                    isHomeActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                <div className="relative">
                    <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
                    {isHomeActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">Home</span>
            </Link>

            {/* Shop / Categories */}
            <Link
                href="/shop"
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
                    isShopActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                <div className="relative">
                    <LayoutGrid className={`w-5 h-5 transition-transform ${isShopActive ? 'scale-110' : ''}`} />
                    {isShopActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">Shop</span>
            </Link>

            {/* Cart Drawer Trigger */}
            <button
                type="button"
                onClick={handleCartClick}
                className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-500 hover:text-slate-900 cursor-pointer active:scale-95 transition-all"
            >
                <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {auth?.user && itemCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center ring-2 ring-white shadow-xs">
                            {itemCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">Cart</span>
            </button>

            {/* Wishlist */}
            <Link
                href={auth?.user ? "/wishlist" : "/login"}
                onClick={handleWishlistClick}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
                    isWishlistActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                <div className="relative">
                    <Heart className={`w-5 h-5 transition-transform ${isWishlistActive ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                    {auth?.user && wishlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black px-1 rounded-full min-w-4 text-center ring-2 ring-white shadow-xs">
                            {wishlistCount}
                        </span>
                    )}
                    {isWishlistActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">Wishlist</span>
            </Link>

            {/* Account / Login */}
            <Link
                href={getAccountHref()}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
                    isAccountActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
                <div className="relative">
                    <User className={`w-5 h-5 transition-transform ${isAccountActive ? 'scale-110' : ''}`} />
                    {isAccountActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                    {auth?.user ? (auth.user.name ? auth.user.name.split(' ')[0] : 'Account') : 'Sign In'}
                </span>
            </Link>
        </aside>
    );
}

export default MobileBottomNav;
