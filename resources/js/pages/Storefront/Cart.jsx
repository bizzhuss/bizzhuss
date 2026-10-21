import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight, 
    Store, 
    ShoppingBag, 
    ShieldCheck, 
    Tag, 
    Truck, 
    CheckCircle2,
    RotateCcw
} from 'lucide-react';

export default function Cart() {
    const { cart, updateQuantity, removeItem, clearCart, subtotal, totalItems, showNotification } = useApp();
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponSuccess, setCouponSuccess] = useState('');
    const [couponError, setCouponError] = useState('');

    // Group items by vendor
    const itemsByVendor = cart.reduce((groups, item) => {
        const vName = item.vendorName || 'Verified Marketplace Supplier';
        if (!groups[vName]) {
            groups[vName] = [];
        }
        groups[vName].push(item);
        return groups;
    }, {});

    const shippingFee = subtotal > 1500 || subtotal === 0 ? 0 : 45.00;
    const discountAmount = (subtotal * appliedDiscount) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        setCouponError('');
        setCouponSuccess('');

        const code = couponCode.trim().toUpperCase();
        if (code === 'BIZZ10' || code === 'DARAZ10') {
            setAppliedDiscount(10);
            setCouponSuccess('Promo code BIZZ10 applied! 10% platform discount saved.');
            showNotification('Promo code applied: 10% discount!', 'success');
        } else if (code === 'BIZZ20' || code === 'FREESHIP') {
            setAppliedDiscount(15);
            setCouponSuccess('Promo code BIZZ20 applied! 15% VIP discount saved.');
            showNotification('VIP Promo code applied: 15% discount!', 'success');
        } else {
            setCouponError('Invalid coupon code. Try BIZZ10 or BIZZ20 for promo discount.');
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Shopping Cart | Bizzhuss Marketplace" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Multi-vendor unified checkout with automated sub-order fulfillment.
                </p>
            </div>

            {cart.length === 0 ? (
                /* Empty Cart State */
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-12 text-center max-w-xl mx-auto my-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Your shopping cart is currently empty</h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Explore our catalog of certified IIoT hardware, precision tooling, and workspace gear from verified manufacturers.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-transform hover:scale-102"
                        >
                            <span>Explore Marketplace Catalog</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                /* Cart Items Grouped by Vendor + Order Summary Box */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Cart Items by Vendor */}
                    <div className="lg:col-span-8 space-y-6">
                        {Object.entries(itemsByVendor).map(([vendorName, vendorItems]) => (
                            <div
                                key={vendorName}
                                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
                            >
                                {/* Vendor Group Header */}
                                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-brand-500" />
                                        <span className="text-xs font-bold text-slate-900">
                                            Vendor Package: {vendorName}
                                        </span>
                                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                            Verified Seller
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {vendorItems.length} {vendorItems.length === 1 ? 'item' : 'items'}
                                    </span>
                                </div>

                                {/* Items List */}
                                <div className="divide-y divide-slate-100">
                                    {vendorItems.map((item) => (
                                        <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    <img
                                                        src={item.image || '/placeholder-product.svg'}
                                                        alt={item.title}
                                                        onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <Link 
                                                        href={`/product/${item.id}`}
                                                        className="text-xs font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                                        SKU: {item.sku || 'SKU-001'}
                                                    </div>
                                                    <div className="text-sm font-black text-slate-900 mt-1">
                                                        {formatCurrency(item.price)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity & Remove Buttons */}
                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="text-xs font-bold text-slate-800 min-w-[70px] text-right">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center justify-between text-xs pt-2">
                            <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                                ← Continue Shopping Catalog
                            </Link>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                            >
                                Clear Shopping Cart
                            </button>
                        </div>
                    </div>

                    {/* Right: Order Summary Box */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5 sticky top-36">
                        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                            Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                        </h2>

                        {/* Price Breakdown */}
                        <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex items-center justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Estimated Freight / Shipping</span>
                                <span className="font-semibold text-slate-900">
                                    {shippingFee === 0 ? (
                                        <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                                    ) : (
                                        formatCurrency(shippingFee)
                                    )}
                                </span>
                            </div>

                            {appliedDiscount > 0 && (
                                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                    <span>Promo Discount ({appliedDiscount}%)</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                                <span className="text-sm font-bold text-slate-900">Total Due</span>
                                <span className="text-xl font-black text-brand-600">
                                    {formatCurrency(finalTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Coupon Code Input */}
                        <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-brand-500" />
                                <span>Have a Voucher or Promo Code?</span>
                            </label>
                            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-brand-400">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Try code: BIZZ10"
                                    className="flex-1 px-3 py-2 text-xs uppercase font-mono outline-none text-slate-900"
                                />
                                <button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponSuccess && (
                                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {couponSuccess}
                                </p>
                            )}
                            {couponError && (
                                <p className="text-[11px] text-rose-600 font-semibold">
                                    {couponError}
                                </p>
                            )}
                        </form>

                        {/* Proceed to Checkout Button */}
                        <div className="pt-3">
                            <Link
                                href="/checkout"
                                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-md shadow-brand-500/20 transition-transform hover:scale-102 flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Trust Guarantees */}
                        <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                                <span>Guaranteed Safe & Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-brand-500 shrink-0" />
                                <span>Direct Multi-Vendor Split Fulfillment</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
