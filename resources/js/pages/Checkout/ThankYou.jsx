import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    CheckCircle2, 
    Printer, 
    ArrowRight, 
    ShoppingBag, 
    Truck, 
    Copy, 
    Check, 
    Store, 
    MapPin, 
    CreditCard, 
    Banknote, 
    Building2, 
    ShieldCheck, 
    FileText, 
    Phone, 
    Mail,
    Package
} from 'lucide-react';

export default function ThankYou({ order = {}, finance_settings = {} }) {
    const [copied, setCopied] = useState(false);

    const orderNumber = order?.order_number || `BIZ-ORD-${order?.id || '0000'}`;
    const items = Array.isArray(order?.items) && order.items.length > 0 
        ? order.items 
        : (order?.order_items || []);

    const shipping = order?.shipping_address || {};
    const customerName = order?.customer_name || shipping?.name || order?.customer?.name || 'Valued Customer';
    const customerEmail = order?.customer_email || shipping?.email || order?.customer?.email || 'customer@example.com';
    const customerPhone = order?.customer_phone || shipping?.phone || '';
    const streetAddress = shipping?.address || 'Standard Delivery Destination';
    const destinationCity = order?.city || shipping?.city || 'Karachi';
    const destinationCountry = order?.country || shipping?.country || 'Pakistan';
    const postalCode = shipping?.postal_code || '';
    
    const subtotal = Number(order?.subtotal) || (items.reduce((acc, i) => acc + (Number(i.price || i.unit_price || 0) * Number(i.quantity || 1)), 0));
    const shippingFee = Number(order?.shipping_amount ?? shipping?.shipping_fee ?? 250);
    const taxAmount = Number(order?.tax_amount ?? shipping?.tax_amount ?? (subtotal * 0.08));
    const totalAmount = Number(order?.total_amount) || (subtotal + shippingFee + taxAmount);
    const paymentMethod = order?.payment_method || 'cod';
    const paymentStatus = order?.payment_status || (paymentMethod === 'cod' ? 'pending' : 'paid');
    const shippingSla = shipping?.shipping_sla || '2-3 Business Days';

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(orderNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <StorefrontLayout>
            <Head title={`Order Confirmed #${orderNumber} | Bizzhuss Marketplace`} />

            {/* SCREEN VIEW ONLY (Hidden when printing) */}
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 print:hidden">
                {/* 1. Celebratory Success Hero */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 sm:p-10 mb-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-600"></div>

                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce-subtle">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <span className="text-[11px] font-black tracking-widest uppercase px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-block mb-3">
                        Order Received & Confirmed
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Thank You For Your Order!
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                        Your multi-vendor order has been secured and dispatched to automated vendor settlement channels. A confirmation receipt has been logged for <span className="font-bold text-slate-800">{customerEmail}</span>.
                    </p>

                    {/* Order Tracking Reference Pill */}
                    <div className="inline-flex items-center gap-2 mt-6 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
                        <span className="text-xs text-slate-500 font-medium">Tracking Number:</span>
                        <span className="font-mono font-extrabold text-sm text-slate-900">{orderNumber}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors ml-1 cursor-pointer"
                            title="Copy Order Number"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print / Download Bill</span>
                        </button>

                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Continue Shopping</span>
                        </Link>

                        <Link
                            href={`/track-order?order_number=${encodeURIComponent(orderNumber)}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors"
                        >
                            <Truck className="w-4 h-4 text-slate-600" />
                            <span>Track Consignment</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Order Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                    {/* Left 8 Cols: Consignment Items & Delivery Info */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Section A: Multi-Vendor Ordered Items */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-brand-500" />
                                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                        Multi-Vendor Consignment Items ({items.length})
                                    </h2>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    Routing Active
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-900 truncate">
                                                {item.name || item.title || 'Product Item'}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    <Store className="w-3 h-3 text-brand-600" />
                                                    {item.shop_name || 'Bizzhuss Official Store'}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    Qty: <strong className="text-slate-700">{item.quantity}</strong>
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1">
                                                Rate: {formatCurrency(item.price || item.unit_price || 0)} per unit
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="font-extrabold text-sm text-slate-900 font-mono">
                                                {formatCurrency((item.price || item.unit_price || 0) * (item.quantity || 1))}
                                            </span>
                                            <span className="block text-[10px] text-emerald-600 font-bold uppercase mt-0.5">
                                                Verified Item
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section B: Delivery & Consignee Destination */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <MapPin className="w-5 h-5 text-brand-500" />
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                    Delivery & Consignee Destination
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consignee</span>
                                    <p className="text-sm font-bold text-slate-900">{customerName}</p>
                                    <p className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        {customerEmail}
                                    </p>
                                    {customerPhone && (
                                        <p className="text-slate-500 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            {customerPhone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Address</span>
                                    <p className="font-medium text-slate-800 leading-relaxed">
                                        {streetAddress}
                                    </p>
                                    <p className="font-bold text-brand-700">
                                        {destinationCity}{postalCode ? ` - ${postalCode}` : ''}, {destinationCountry}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-3.5 flex items-center justify-between text-xs mt-3">
                                <div className="flex items-center gap-2 text-brand-900">
                                    <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                                    <span>
                                        City Fulfillment SLA: <strong>{shippingSla}</strong>
                                    </span>
                                </div>
                                <span className="font-bold text-brand-700 uppercase text-[10px] tracking-wider">
                                    Carrier Routing
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right 4 Cols: Payment & Summary Breakdown */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Section C: Payment Overview */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">
                                Settlement Overview
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Method</span>
                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                        {paymentMethod === 'cod' ? (
                                            <>
                                                <Banknote className="w-4 h-4 text-emerald-600" />
                                                <span>Cash on Delivery</span>
                                            </>
                                        ) : paymentMethod === 'card' ? (
                                            <>
                                                <CreditCard className="w-4 h-4 text-brand-600" />
                                                <span>Credit / Debit Card</span>
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="w-4 h-4 text-brand-700" />
                                                <span>Direct Wire Transfer</span>
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                                        paymentStatus === 'paid' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {paymentStatus === 'paid' ? 'Paid & Verified' : 'Pending Collection'}
                                    </span>
                                </div>

                                {paymentMethod === 'cod' && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                                        💡 <strong>Tip for COD:</strong> Please keep exact cash ({formatCurrency(totalAmount)}) ready for the delivery courier.
                                    </div>
                                )}
                            </div>

                            {/* Section D: Financial Ledger Summary */}
                            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span>Items Subtotal</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>City Freight ({destinationCity})</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(shippingFee)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sales Tax ({finance_settings.default_tax_rate ?? 8}%)</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-black text-brand-600">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section E: Buyer Assurance */}
                        <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 space-y-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <span>Bizzhuss Buyer Guarantee</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Every consignment is backed by verified merchant escrow settlement, automated dispute mediation, and 7-day return privileges.
                            </p>
                            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                                Support Hotline: {finance_settings.support_phone || '+92 300 1234567'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINT-ONLY COMMERICAL TAX INVOICE & CONSIGNMENT BILL */}
            <div className="hidden print:block bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans">
                {/* 1. Official Corporate Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                            Bizzhuss Marketplace Enterprise
                        </h1>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                            Official Commercial Tax Invoice & Consignment Bill
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            National Tax No (NTN): 7829401-4 • Multi-Vendor Digital Marketplace
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Headquarters: Executive Tower, Clifton Block 4, Karachi, Pakistan
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Order ID</div>
                        <div className="text-lg font-black font-mono text-slate-900">{orderNumber}</div>
                        <div className="text-xs text-slate-600 mt-1">
                            Date: {formatDate(order?.created_at || new Date().toISOString())}
                        </div>
                        <div className="text-xs font-semibold uppercase mt-0.5 text-slate-700">
                            Payment: <strong>{paymentMethod.toUpperCase()}</strong> ({paymentStatus.toUpperCase()})
                        </div>
                    </div>
                </div>

                {/* 2. Customer & Dispatcher Meta */}
                <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-6 text-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Billed & Consigned To:
                        </span>
                        <div className="text-sm font-bold text-slate-900">{customerName}</div>
                        <div className="text-slate-700 mt-0.5">{customerEmail}</div>
                        {customerPhone && <div className="text-slate-700">Tel: {customerPhone}</div>}
                        <div className="text-slate-700 mt-1 leading-relaxed">
                            {streetAddress}
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">
                            {destinationCity}{postalCode ? ` - ${postalCode}` : ''}, {destinationCountry}
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Fulfillment & Carrier Logistics:
                        </span>
                        <div className="text-slate-800">
                            Carrier Dispatch: <strong>Bizzhuss Priority Freight</strong>
                        </div>
                        <div className="text-slate-800 mt-0.5">
                            Destination City: <strong>{destinationCity}</strong>
                        </div>
                        <div className="text-slate-800 mt-0.5">
                            Fulfillment SLA: <strong>{shippingSla}</strong>
                        </div>
                        <div className="text-slate-800 mt-0.5">
                            Dispatched Sub-Orders: <strong>{items.length} Line Items</strong>
                        </div>
                    </div>
                </div>

                {/* 3. Itemized Products Table */}
                <div className="mb-6">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-900">
                                <th className="py-2.5 pr-2">#</th>
                                <th className="py-2.5 px-2">Item Description</th>
                                <th className="py-2.5 px-2">Assigned Merchant Shop</th>
                                <th className="py-2.5 px-2 text-center">Qty</th>
                                <th className="py-2.5 px-2 text-right">Unit Price</th>
                                <th className="py-2.5 pl-2 text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                            {items.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-3 pr-2 font-mono">{i + 1}</td>
                                    <td className="py-3 px-2 font-bold text-slate-900">
                                        {item.name || item.title || 'Product Item'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-600">
                                        {item.shop_name || 'Bizzhuss Official Store'}
                                    </td>
                                    <td className="py-3 px-2 text-center font-bold">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-2 text-right font-mono">
                                        {formatCurrency(item.price || item.unit_price || 0)}
                                    </td>
                                    <td className="py-3 pl-2 text-right font-mono font-bold text-slate-900">
                                        {formatCurrency((item.price || item.unit_price || 0) * (item.quantity || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Financial Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-72 space-y-2 text-xs border-t-2 border-slate-900 pt-3">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>City Delivery Tariff:</span>
                            <span className="font-mono font-semibold text-slate-900">{formatCurrency(shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Sales Tax ({finance_settings.default_tax_rate ?? 8}%):</span>
                            <span className="font-mono font-semibold text-slate-900">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-slate-900">
                            <span>Total Payable:</span>
                            <span className="font-mono text-base">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* 5. Official Signature & Company Stamp Area */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 items-end">
                    {/* CEO Signature Block */}
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Empty blank signing space for physical pen signature */}
                        <div className="h-14 w-full"></div>

                        {/* Physical Signature Line */}
                        <div className="w-56 h-[1.5px] bg-slate-500 mb-2"></div>

                        {/* Designation Details */}
                        <div className="text-xs font-black text-slate-900 tracking-tight uppercase">
                            Official CEO Signature
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                            Chief Executive Officer & Founder
                        </div>
                    </div>

                    {/* Official Company Stamp Area */}
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Physical Ink Stamp Placeholder Box */}
                        <div className="w-28 h-28 border-2 border-dashed border-slate-400 rounded-2xl flex flex-col items-center justify-center text-slate-400 select-none bg-slate-50/50 mb-2">
                            <span className="text-[9px] font-bold tracking-widest uppercase">Affix Official</span>
                            <span className="text-[11px] font-black tracking-wider uppercase text-slate-500">Stamp / Seal</span>
                        </div>

                        {/* Baseline Label */}
                        <div className="w-48 h-[1px] bg-slate-300 mb-1"></div>
                        <div className="text-[11px] font-extrabold text-slate-800 tracking-tight uppercase">
                            Official Company Stamp
                        </div>
                        <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                            Bizzhuss Corporate Seal
                        </div>
                    </div>
                </div>

                {/* 6. Footer Disclaimer */}
                <div className="text-center text-[10px] text-slate-400 mt-10 pt-4 border-t border-slate-200">
                    This is an enterprise computer-generated commercial tax invoice for Bizzhuss Multi-Vendor Marketplace. For inquiries, email support@bizzhuss.com or call +92 300 1234567.
                </div>
            </div>
        </StorefrontLayout>
    );
}
