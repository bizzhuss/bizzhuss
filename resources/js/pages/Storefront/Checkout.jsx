import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
    ShieldCheck, 
    CreditCard, 
    Banknote, 
    Building2, 
    Truck, 
    Lock, 
    Check, 
    ArrowRight,
    MapPin,
    Package
} from 'lucide-react';

export default function Checkout() {
    const { auth } = usePage().props;
    const { cart, subtotal, totalItems, clearCart, showNotification } = useApp();

    const [formData, setFormData] = useState({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: auth?.user?.phone || '',
        shipping_address: '',
        city: '',
        postal_code: '',
        country: 'United States',
        payment_method: 'cod', // 'cod', 'card', 'wire'
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkoutItems = cart;
    const currentSubtotal = subtotal;
    const shippingFee = currentSubtotal > 1500 ? 0 : (currentSubtotal > 0 ? 45.00 : 0);
    const grandTotal = currentSubtotal + shippingFee;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            shipping_address: `${formData.shipping_address}, ${formData.city} ${formData.postal_code}, ${formData.country}`,
            payment_method: formData.payment_method,
            items: checkoutItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
            })),
        };

        router.post('/checkout', payload, {
            onSuccess: () => {
                clearCart();
                setIsSubmitting(false);
                showNotification('Order placed successfully! Automated vendor sub-orders routed.', 'success');
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const firstError = Object.values(errors)[0] || 'Failed to place order. Please review your details.';
                showNotification(firstError, 'error');
            },
        });
    };

    if (cart.length === 0) {
        return (
            <StorefrontLayout>
                <Head title="Checkout | Bizzhuss Marketplace" />
                <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                        <Package className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Your Cart is Currently Empty</h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please add products to your cart before proceeding to checkout.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-colors"
                        >
                            <span>Browse Product Catalog</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout>
            <Head title="Secure Checkout | Bizzhuss Marketplace" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Checkout</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Unified multi-vendor checkout with automated carrier sub-orders.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                {/* Left 8 Cols: Delivery & Payment Details */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Section 1: Delivery Address */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <MapPin className="w-5 h-5 text-brand-500" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                1. Delivery & Consignee Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Full Consignee Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Business Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Mobile / Dispatch Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">City / Region *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold text-slate-700 mb-1">Street Address / Facility Dock *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.shipping_address}
                                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Payment Method */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Lock className="w-5 h-5 text-brand-500" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                2. Select Payment Method
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {/* Option 1: Cash on Delivery / Pay on Delivery */}
                            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                                formData.payment_method === 'cod'
                                    ? 'bg-brand-50/60 border-brand-500 ring-1 ring-brand-500'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={formData.payment_method === 'cod'}
                                    onChange={() => setFormData({ ...formData, payment_method: 'cod' })}
                                    className="mt-1 text-brand-500 focus:ring-brand-400"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-emerald-600" />
                                        <span className="font-bold text-xs text-slate-900">
                                            Cash on Delivery (COD) / Pay upon Receiving
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                            Recommended
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Pay in cash or mobile transfer when packages arrive from carrier dispatch.
                                    </p>
                                </div>
                            </label>

                            {/* Option 2: Credit / Debit Card */}
                            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                                formData.payment_method === 'card'
                                    ? 'bg-brand-50/60 border-brand-500 ring-1 ring-brand-500'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="card"
                                    checked={formData.payment_method === 'card'}
                                    onChange={() => setFormData({ ...formData, payment_method: 'card' })}
                                    className="mt-1 text-brand-500 focus:ring-brand-400"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-brand-600" />
                                        <span className="font-bold text-xs text-slate-900">
                                            Credit / Debit Card (Visa, Mastercard, UnionPay)
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Encrypted 256-bit SSL transaction gateway processed with Instant Confirmation.
                                    </p>
                                </div>
                            </label>

                            {/* Option 3: Commercial Wire Transfer */}
                            <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                                formData.payment_method === 'wire'
                                    ? 'bg-brand-50/60 border-brand-500 ring-1 ring-brand-500'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="wire"
                                    checked={formData.payment_method === 'wire'}
                                    onChange={() => setFormData({ ...formData, payment_method: 'wire' })}
                                    className="mt-1 text-brand-500 focus:ring-brand-400"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-brand-700" />
                                        <span className="font-bold text-xs text-slate-900">
                                            Corporate ACH / Direct Bank Wire Transfer
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Ideal for corporate bulk orders. Wire reference generated on submission.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right 4 Cols: Order Items Review & Final Total */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5 sticky top-36">
                    <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <span>Review Items ({checkoutItems.length})</span>
                        <Link href="/cart" className="text-xs font-semibold text-brand-600 hover:underline">
                            Edit Cart
                        </Link>
                    </h2>

                    {/* Items Mini List */}
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                        {checkoutItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                                    <p className="text-[11px] text-slate-400">
                                        Qty: {item.quantity} • {formatCurrency(item.price)}
                                    </p>
                                </div>
                                <span className="font-bold text-slate-900 text-xs shrink-0">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(currentSubtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Freight / Dispatch SLA</span>
                            <span className="font-semibold text-slate-900">
                                {shippingFee === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : formatCurrency(shippingFee)}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <span className="text-sm font-bold text-slate-900">Total Payable</span>
                            <span className="text-2xl font-black text-brand-600">
                                {formatCurrency(grandTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Place Order CTA Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl bg-accent-orange hover:brightness-105 text-white font-black text-sm shadow-lg shadow-accent-orange/20 transition-transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span>Processing Multi-Vendor Routing...</span>
                            ) : (
                                <>
                                    <span>Place Order Now</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                        By placing your order, you authorize Bizzhuss to route sub-orders to verified marketplace merchants according to standard platform SLA terms.
                    </div>
                </div>
            </form>
        </StorefrontLayout>
    );
}
