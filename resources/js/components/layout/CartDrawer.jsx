import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, subtotal, totalItems, showNotification } = useApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        name: 'David Miller',
        email: 'david.m@globalcorp.io',
        phone: '+1 (555) 776-8822',
        shipping_address: '400 Technology Way, Dock 7, Austin, TX 78701',
        payment_method: 'card',
    });

    if (!isCartOpen) return null;

    // Group items by vendor to demonstrate enterprise multi-vendor separation
    const vendorGroups = cart.reduce((acc, item) => {
        const vName = item.vendorName || 'Direct Vendor';
        if (!acc[vName]) acc[vName] = [];
        acc[vName].push(item);
        return acc;
    }, {});

    const estimatedTax = subtotal * 0.08;
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.0;
    const grandTotal = subtotal + estimatedTax + shipping;

    const handleCheckout = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/checkout', {
            ...customerForm,
            items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowCheckoutModal(false);
                clearCart();
                setIsCartOpen(false);
                showNotification('Multi-vendor order placed and split across vendors successfully!');
            },
            onError: (errors) => {
                setIsSubmitting(false);
                alert('Order error: ' + JSON.stringify(errors));
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-brand-600" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Multi-Vendor Cart ({totalItems})
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-800">Your cart is empty</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                    Browse our multi-vendor storefront catalog and add enterprise products to preview the checkout routing.
                                </p>
                            </div>
                        ) : (
                            Object.entries(vendorGroups).map(([vendorName, items]) => (
                                <div key={vendorName} className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-100/80 px-4 py-2 flex items-center justify-between border-b border-slate-200 text-xs font-semibold text-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <Store className="w-3.5 h-3.5 text-brand-600" />
                                            <span>Vendor: {vendorName}</span>
                                        </div>
                                        <span className="text-[11px] font-mono text-slate-500">Sub-Order Routing</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 p-3 space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-3">
                                                <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                                    {item.sku ? item.sku.slice(0, 4) : 'PROD'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-brand-600 font-bold mt-0.5">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex items-center border border-slate-200 rounded-md">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="px-2 py-0.5 text-slate-500 hover:text-slate-800 text-xs"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="px-2 text-xs font-semibold text-slate-800">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-2 py-0.5 text-slate-500 hover:text-slate-800 text-xs"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-slate-400 hover:text-rose-600 p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-slate-100 p-6 bg-slate-50/80 space-y-4">
                            <div className="space-y-1.5 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Tax (8%)</span>
                                    <span>{formatCurrency(estimatedTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Fulfillment & Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-emerald-600 font-semibold">FREE (Over Rs. 15,000)</span> : formatCurrency(shipping)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                                    <span>Total Amount</span>
                                    <span className="text-brand-700">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full py-2.5"
                                onClick={() => setShowCheckoutModal(true)}
                                icon={ArrowRight}
                            >
                                Proceed to Multi-Vendor Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Simulated Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-60 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/70" onClick={() => setShowCheckoutModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Complete Enterprise Checkout</h3>
                                    <p className="text-xs text-slate-500">Order will auto-split into {Object.keys(vendorGroups).length} vendor sub-orders with commission.</p>
                                </div>
                                <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase">Purchasing Entity / Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                                        value={customerForm.name}
                                        onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase">Corporate Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                                            value={customerForm.email}
                                            onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase">Phone Number</label>
                                        <input
                                            type="text"
                                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                                            value={customerForm.phone}
                                            onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase">Receiving Facility Address</label>
                                    <textarea
                                        rows={2}
                                        required
                                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                                        value={customerForm.shipping_address}
                                        onChange={e => setCustomerForm({ ...customerForm, shipping_address: e.target.value })}
                                    />
                                </div>

                                <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 space-y-1">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Automated Split Order Architecture</span>
                                    </div>
                                    <p>Upon placement, Bizzhuss will create a master order ({formatCurrency(grandTotal)}) and dispatch independent sub-orders to each participating vendor with automated commission deductions.</p>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" loading={isSubmitting}>
                                        Confirm & Place Multi-Vendor Order
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
