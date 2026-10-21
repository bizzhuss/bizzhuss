import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import SEOHead from '@/components/SEOHead';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
    Heart, 
    ShoppingCart, 
    Trash2, 
    ArrowRight, 
    Store, 
    Star, 
    CheckCircle2, 
    AlertCircle, 
    Check, 
    PackageOpen,
    Eye
} from 'lucide-react';

export default function Wishlist() {
    const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
    const { addToCart } = useCart();
    const { showNotification } = useApp();
    const [addedIds, setAddedIds] = useState({});

    const handleAddToCart = (item) => {
        addToCart(item, 1);
        setAddedIds((prev) => ({ ...prev, [item.id]: true }));
        showNotification(`"${item.title}" added to your cart!`, 'success');

        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [item.id]: false }));
        }, 1800);
    };

    const handleRemove = (item) => {
        removeFromWishlist(item.id);
        showNotification(`"${item.title}" removed from your wishlist.`, 'info');
    };

    const handleAddAllToCart = () => {
        if (wishlist.length === 0) return;
        wishlist.forEach((item) => {
            addToCart(item, 1);
        });
        showNotification(`Added all ${wishlist.length} saved items to your cart!`, 'success');
    };

    return (
        <StorefrontLayout>
            <SEOHead title="My Wishlist" noindex={true} url="/wishlist" />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
                            <Heart className="w-5 h-5 fill-rose-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span>My Saved Wishlist</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                                    {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Items you have saved for future orders and procurement requests.
                            </p>
                        </div>
                    </div>
                </div>

                {wishlist.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAddAllToCart}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add All to Cart</span>
                        </button>
                        <button
                            type="button"
                            onClick={clearWishlist}
                            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {wishlist.length === 0 ? (
                /* Empty Wishlist State */
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-12 text-center max-w-xl mx-auto my-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                        <Heart className="w-10 h-10" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Your wishlist is currently empty</h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Explore our catalog of certified IIoT hardware, precision tooling, and workspace gear. Click the heart icon on any product to save it here!
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-102"
                        >
                            <span>Browse Shop Catalog</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                /* Wishlist Items Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {wishlist.map((item) => {
                        const isAdded = !!addedIds[item.id];
                        const discountPercent = item.compare_price && item.compare_price > item.price
                            ? Math.round(((item.compare_price - item.price) / item.compare_price) * 100)
                            : null;
                        const vendorName = item.vendor?.shop_name || item.vendorName || 'Verified Merchant';

                        return (
                            <div 
                                key={item.id}
                                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                    <Link href={`/product/${item.slug || item.id}`}>
                                        <img
                                            src={item.image || '/placeholder-product.svg'}
                                            alt={item.title}
                                            onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>

                                    {discountPercent && (
                                        <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                                            -{discountPercent}%
                                        </div>
                                    )}

                                    {/* Remove from wishlist button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item)}
                                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    {item.sku && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                                            {item.sku}
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                                            <Store className="w-3 h-3 text-amber-500 shrink-0" />
                                            <span className="truncate font-medium text-slate-700">
                                                Sold by: <strong>{vendorName}</strong>
                                            </span>
                                        </div>

                                        <Link
                                            href={`/product/${item.slug || item.id}`}
                                            className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug"
                                            title={item.title}
                                        >
                                            {item.title}
                                        </Link>

                                        {/* Stock & Rating */}
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                            <div className="flex items-center text-amber-400">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="ml-1 font-bold text-slate-800 text-[11px]">
                                                    {item.rating || '4.9'}
                                                </span>
                                            </div>
                                            <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                In Stock
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-black text-slate-900 leading-tight">
                                                {formatCurrency(item.price)}
                                            </div>
                                            {item.compare_price && item.compare_price > item.price && (
                                                <div className="text-[10px] text-slate-400 line-through">
                                                    {formatCurrency(item.compare_price)}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAddToCart(item)}
                                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                                isAdded 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                                            }`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Added</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    <span>Add to Cart</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </StorefrontLayout>
    );
}
