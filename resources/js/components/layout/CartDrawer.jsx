import React from 'react';
import { router } from '@inertiajs/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

function getItemImage(item) {
    if (item.image) return item.image;
    if (item.thumbnail) return item.thumbnail;
    if (item.product?.thumbnail) return item.product.thumbnail;
    if (Array.isArray(item.product?.images) && item.product.images.length > 0) return item.product.images[0];
    if (typeof item.product?.images === 'string') {
        try {
            const parsed = JSON.parse(item.product.images);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {}
    }
    return null;
}

export function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, subtotal, totalItems, showNotification } = useApp();

    if (!isCartOpen) return null;

    // Group items by vendor to demonstrate enterprise multi-vendor separation
    const vendorGroups = cart.reduce((acc, item) => {
        const vName = item.vendorName || 'Direct Vendor';
        if (!acc[vName]) acc[vName] = [];
        acc[vName].push(item);
        return acc;
    }, {});

    const estimatedTax = subtotal * 0.08;
    const shipping = subtotal > 15000 || subtotal === 0 ? 0 : 250.0;
    const grandTotal = subtotal + estimatedTax + shipping;

    const handleProceedToCheckout = () => {
        setIsCartOpen(false);
        router.visit('/checkout');
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity cursor-pointer"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Slide-over Container: Full-width on mobile (<md), max-w-md on desktop */}
            <div className="fixed inset-y-0 right-0 w-full md:max-w-md bg-white z-[60] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                Shopping Cart ({totalItems})
                            </h2>
                            <span className="text-[10px] text-slate-500 font-medium">Multi-Vendor Routing</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        aria-label="Close cart drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items List - Independently Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 py-3 sm:p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                Browse our multi-vendor storefront catalog and add certified equipment or products to your cart.
                            </p>
                        </div>
                    ) : (
                        Object.entries(vendorGroups).map(([vendorName, items]) => (
                            <div key={vendorName} className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                <div className="bg-slate-100/80 px-3.5 py-2 flex items-center justify-between border-b border-slate-200 text-xs font-semibold text-slate-700">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Store className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                        <span className="truncate">Vendor: {vendorName}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Sub-Order</span>
                                </div>
                                <div className="divide-y divide-slate-100 p-3 space-y-3">
                                    {items.map((item) => {
                                        const imageUrl = getItemImage(item);

                                        return (
                                            <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                                                {/* Product Image Thumbnail with fallback badge */}
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.title}
                                                        className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs bg-slate-50"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.nextElementSibling) {
                                                                e.currentTarget.nextElementSibling.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                <div 
                                                    className={`h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center text-xs font-bold text-slate-400 shrink-0 ${imageUrl ? 'hidden' : 'flex'}`}
                                                >
                                                    {item.sku ? item.sku.slice(0, 4) : 'PROD'}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                        {item.title}
                                                    </h4>
                                                    {item.selectedVariant && (
                                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                            {item.selectedVariant}
                                                        </p>
                                                    )}
                                                    <div className="flex items-baseline justify-between gap-2 mt-1">
                                                        <span className="text-xs sm:text-sm font-black text-brand-600">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium">
                                                            Total: <span className="font-bold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                                                        </span>
                                                    </div>

                                                    {/* Quantity Controls & Delete */}
                                                    <div className="flex items-center justify-between mt-2.5 pt-1">
                                                        <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition-all cursor-pointer"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="min-w-[32px] text-center text-xs font-bold text-slate-900 select-none">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition-all cursor-pointer"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                                                            aria-label="Remove item"
                                                            title="Remove from cart"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sticky Summary Footer with Safe Area Bottom Spacing */}
                {cart.length > 0 && (
                    <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/90 space-y-3.5 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Estimated Tax (8%)</span>
                                <span className="font-semibold text-slate-700">{formatCurrency(estimatedTax)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Fulfillment & Shipping</span>
                                <span>
                                    {shipping === 0 ? (
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                                            FREE (Over Rs. 15,000)
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-slate-700">{formatCurrency(shipping)}</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline text-sm sm:text-base font-black text-slate-900 pt-2.5 border-t border-slate-200">
                                <span>Total Amount</span>
                                <span className="text-brand-600 font-black">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-[0.99] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                            onClick={handleProceedToCheckout}
                            icon={ArrowRight}
                        >
                            Proceed to Multi-Vendor Checkout
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
