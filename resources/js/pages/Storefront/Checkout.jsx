import React, { useState, useEffect } from 'react';
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
    Package,
    Navigation,
    Loader2,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function Checkout({ finance_settings = {}, prefill = {} }) {
    const { auth } = usePage().props;
    const { cart, subtotal, totalItems, clearCart, showNotification } = useApp();

    const [formData, setFormData] = useState({
        name: prefill?.name || auth?.user?.name || '',
        email: prefill?.email || auth?.user?.email || '',
        phone: prefill?.phone || auth?.user?.phone || '',
        shipping_address: prefill?.shipping_address || '',
        city: prefill?.city || '',
        postal_code: prefill?.postal_code || '',
        country: prefill?.country || 'Pakistan',
        payment_method: 'cod', // 'cod', 'card', 'wire'
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationDetected, setLocationDetected] = useState(false);

    // City Rules & Shipping Tariffs
    const cityRules = finance_settings?.city_shipping_rules && finance_settings.city_shipping_rules.length > 0 
        ? finance_settings.city_shipping_rules 
        : [
            { city: 'Karachi', charge: 150, sla: '1-2 Business Days' },
            { city: 'Lahore', charge: 250, sla: '2-3 Business Days' },
            { city: 'Islamabad', charge: 250, sla: '2-3 Business Days' },
            { city: 'Rawalpindi', charge: 250, sla: '2-3 Business Days' },
            { city: 'Faisalabad', charge: 300, sla: '3-4 Business Days' },
            { city: 'Multan', charge: 300, sla: '3-4 Business Days' },
            { city: 'Peshawar', charge: 300, sla: '3-4 Business Days' },
            { city: 'Quetta', charge: 350, sla: '4-5 Business Days' },
        ];
    const defaultShippingCharge = Number(finance_settings?.default_shipping_charge ?? 250);
    const taxRate = Number(finance_settings?.default_tax_rate ?? 8.0);

    // Client Geolocation Resolver (Free SSL endpoint ipwho.is with fallback to ipapi.co)
    const detectLocation = async (manual = false) => {
        if (isDetectingLocation) return;
        setIsDetectingLocation(true);
        try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.success && data.city) {
                setFormData(prev => ({
                    ...prev,
                    city: (!prev.city || manual) && data.city ? data.city : prev.city,
                    postal_code: (!prev.postal_code || manual) && data.postal ? data.postal : prev.postal_code,
                    country: (!prev.country || manual) && data.country ? data.country : (prev.country || 'Pakistan'),
                }));
                setLocationDetected(true);
                if (manual) {
                    showNotification(`Auto-detected: ${data.city}, ${data.country || 'Pakistan'}`, 'success');
                }
                return;
            }

            // Fallback
            const resFallback = await fetch('https://ipapi.co/json/');
            const fallbackData = await resFallback.json();
            if (fallbackData && fallbackData.city) {
                setFormData(prev => ({
                    ...prev,
                    city: (!prev.city || manual) && fallbackData.city ? fallbackData.city : prev.city,
                    postal_code: (!prev.postal_code || manual) && fallbackData.postal ? fallbackData.postal : prev.postal_code,
                    country: (!prev.country || manual) && fallbackData.country_name ? fallbackData.country_name : (prev.country || 'Pakistan'),
                }));
                setLocationDetected(true);
                if (manual) {
                    showNotification(`Auto-detected: ${fallbackData.city}, ${fallbackData.country_name || 'Pakistan'}`, 'success');
                }
            }
        } catch (err) {
            console.warn('Auto-location detection skipped:', err);
            if (manual) {
                showNotification('Could not detect location automatically. Please enter your city manually.', 'error');
            }
        } finally {
            setIsDetectingLocation(false);
        }
    };

    // Auto-detect on component mount if city is blank
    useEffect(() => {
        if (!formData.city) {
            detectLocation(false);
        }
    }, []);

    const checkoutItems = cart;
    const currentSubtotal = subtotal;

    // Match City Tariff Rule
    const cleanCity = (formData.city || '').trim().toLowerCase();
    const matchedRule = cleanCity 
        ? cityRules.find(r => r.city && r.city.trim().toLowerCase() === cleanCity)
        : null;

    const shippingFee = currentSubtotal > 0
        ? (matchedRule ? Number(matchedRule.charge) : defaultShippingCharge)
        : 0;
    const shippingSla = matchedRule ? matchedRule.sla : '2-4 Business Days';
    const taxAmount = roundValue((currentSubtotal * taxRate) / 100);
    const grandTotal = currentSubtotal + shippingFee + taxAmount;

    function roundValue(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    const popularCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            shipping_address: formData.shipping_address,
            city: formData.city,
            postal_code: formData.postal_code,
            country: formData.country,
            payment_method: formData.payment_method,
            notes: formData.notes,
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
                    Unified multi-vendor checkout with automated carrier sub-orders and city-wise dispatch routing.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                {/* Left 8 Cols: Delivery & Payment Details */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Section 1: Delivery Address */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-brand-500" />
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                    1. Delivery & Consignee Information
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => detectLocation(true)}
                                disabled={isDetectingLocation}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold border border-brand-200 transition-colors cursor-pointer"
                                title="Auto-detect City and Country based on IP"
                            >
                                {isDetectingLocation ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Detecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Navigation className="w-3.5 h-3.5 text-brand-600" />
                                        <span>📍 Auto-Detect Location</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Full Consignee Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="e.g. Haseeb Khan"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Business Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="e.g. haseeb@bizzhuss.com"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Mobile / Dispatch Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="+92 300 1234567"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-semibold text-slate-700">Destination City *</label>
                                    {matchedRule && (
                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Tiered Zone Active
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    required
                                    list="pakistan-cities"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="Select or enter City (e.g. Karachi, Lahore)"
                                />
                                <datalist id="pakistan-cities">
                                    {cityRules.map((rule, idx) => (
                                        <option key={idx} value={rule.city}>
                                            {rule.city} — {formatCurrency(rule.charge)} ({rule.sla})
                                        </option>
                                    ))}
                                    <option value="Rawalpindi" />
                                    <option value="Faisalabad" />
                                    <option value="Multan" />
                                    <option value="Peshawar" />
                                    <option value="Quetta" />
                                    <option value="Gujranwala" />
                                    <option value="Sialkot" />
                                    <option value="Hyderabad" />
                                </datalist>

                                {/* Quick-Select City Chips */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
                                    {popularCities.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, city: c })}
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                                                formData.city?.toLowerCase() === c.toLowerCase()
                                                    ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold text-slate-700 mb-1">Street Address / Facility Dock *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.shipping_address}
                                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="House / Office #, Street, Sector, Landmark"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="e.g. 74200"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                    placeholder="Pakistan"
                                />
                            </div>
                        </div>

                        {/* City Tariff Rule Indicator */}
                        {formData.city && (
                            <div className={`mt-3 flex items-center justify-between p-3 rounded-2xl border text-xs ${
                                matchedRule 
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                                    : 'bg-blue-50/80 border-blue-200 text-blue-900'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Truck className={`w-4 h-4 shrink-0 ${matchedRule ? 'text-emerald-600' : 'text-blue-600'}`} />
                                    <div>
                                        <div className="font-bold">
                                            {matchedRule ? (
                                                <span>City-Wise Tariff: {matchedRule.city}</span>
                                            ) : (
                                                <span>Standard Domestic Delivery: {formData.city}</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] opacity-80">
                                            Estimated Carrier Delivery SLA: <span className="font-semibold">{shippingSla}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black">{formatCurrency(shippingFee)}</div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                                        {matchedRule ? 'Tiered Rate' : 'Base Tariff'}
                                    </div>
                                </div>
                            </div>
                        )}
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
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-700">Delivery Tariff</span>
                                <span className="text-[10px] text-slate-400">
                                    {formData.city ? `${formData.city} (${shippingSla})` : 'Nationwide Standard'}
                                </span>
                            </div>
                            <span className="font-semibold text-slate-900">
                                {formatCurrency(shippingFee)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Platform Tax ({taxRate}%)</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(taxAmount)}</span>
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
