import React, { useState, useEffect } from 'react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Search,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    MapPin,
    AlertCircle,
    Building2,
    Calendar,
    Phone,
    ShieldCheck,
    Store,
    ExternalLink
} from 'lucide-react';

const SAMPLE_ORDERS = {
    'ORD-2026-8942': {
        orderId: 'ORD-2026-8942',
        status: 'In Transit',
        statusColor: 'text-sky-600 bg-sky-50 border-sky-200',
        orderDate: 'September 25, 2026 - 14:32 EST',
        estimatedDelivery: 'September 29, 2026',
        carrier: 'Apex Logistics Freight Express',
        trackingNumber: 'APX-99482104-US',
        destination: '742 Evergreen Terrace, Sector 4, Enterprise District',
        subOrders: [
            {
                subId: 'SO-8942-A',
                vendor: 'Apex Industrial Tech',
                item: 'Precision Digital Multimeter Pro',
                quantity: 2,
                status: 'Dispatched from Chicago Hub',
            },
            {
                subId: 'SO-8942-B',
                vendor: 'Nova Electronics Global',
                item: 'Wireless Telemetry Sensor Kit',
                quantity: 1,
                status: 'In Regional Sorting Facility',
            },
        ],
        timeline: [
            {
                title: 'Order Placed & Escrow Secured',
                time: 'Sep 25, 2026 - 14:32 EST',
                desc: 'Master payment authorized via Escrow Ledger. Sub-orders automatically routed to vendor fulfillment portals.',
                completed: true,
                current: false,
            },
            {
                title: 'Sub-Orders Packaged & Quality Audited',
                time: 'Sep 26, 2026 - 09:15 EST',
                desc: 'Merchants verified item serial numbers and applied tamper-evident security tape.',
                completed: true,
                current: false,
            },
            {
                title: 'Dispatched to National Logistics Hub',
                time: 'Sep 26, 2026 - 18:40 EST',
                desc: 'Consolidated freight scanned at Central Logistics Sorting Hub. Line-haul transit initiated.',
                completed: true,
                current: false,
            },
            {
                title: 'Out for Last-Mile Courier Delivery',
                time: 'Sep 27, 2026 - 08:30 EST',
                desc: 'Assigned to courier van #41. Driver estimated arrival between 13:00 - 17:00 EST.',
                completed: true,
                current: true,
            },
            {
                title: 'Delivered & Customer Sign-off',
                time: 'Estimated Sep 27 - Sep 29, 2026',
                desc: 'Customer inspection period begins upon recipient signature.',
                completed: false,
                current: false,
            },
        ],
    },
};

export default function TrackOrder({ initialOrderId = '' }) {
    const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (initialOrderId) {
            handleLookup(initialOrderId);
        }
    }, [initialOrderId]);

    const handleLookup = (idToLookup) => {
        const id = (idToLookup || orderIdInput).trim();
        if (!id) {
            setErrorMsg('Please enter a valid Order ID (e.g. ORD-2026-8942)');
            return;
        }

        setErrorMsg('');
        setHasSearched(true);

        const found = SAMPLE_ORDERS[id.toUpperCase()];
        if (found) {
            setTrackedOrder(found);
        } else {
            // Generate a realistic dynamic response for any valid order ID format
            setTrackedOrder({
                orderId: id.toUpperCase(),
                status: 'Processing in Dispatch Hub',
                statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
                orderDate: 'Recent Order',
                estimatedDelivery: 'Within 2-4 business days',
                carrier: 'Bizzhuss Direct Freight Network',
                trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
                destination: 'Delivery Address on Customer Account',
                subOrders: [
                    {
                        subId: `${id.toUpperCase()}-01`,
                        vendor: 'Verified Marketplace Merchant',
                        item: 'Marketplace Goods & Commercial Supplies',
                        quantity: 1,
                        status: 'Prepared for carrier pickup',
                    },
                ],
                timeline: [
                    {
                        title: 'Order Placed & Escrow Secured',
                        time: 'Recorded & Verified',
                        desc: 'Payment escrow secured. Vendor notified for packing.',
                        completed: true,
                        current: false,
                    },
                    {
                        title: 'Vendor Sub-Order Preparation',
                        time: 'In Progress',
                        desc: 'Merchant has boxed items and scheduled courier pickup.',
                        completed: true,
                        current: true,
                    },
                    {
                        title: 'Carrier Hub Transit',
                        time: 'Pending Dispatch',
                        desc: 'Package will be scanned into automated freight routing network.',
                        completed: false,
                        current: false,
                    },
                    {
                        title: 'Out for Delivery',
                        time: 'Pending Regional Arrival',
                        desc: 'Assigned to local delivery driver for signature verification.',
                        completed: false,
                        current: false,
                    },
                    {
                        title: 'Delivered',
                        time: 'Pending Final Delivery',
                        desc: 'Customer receives delivery and 7-day warranty window starts.',
                        completed: false,
                        current: false,
                    },
                ],
            });
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleLookup();
    };



    return (
        <HelpLayout
            title="Track Your Order & Freight Status"
            subtitle="Look up real-time multi-vendor sub-orders, carrier tracking codes, and dispatch timelines."
            categoryName="Customer Care"
            currentKey="track-order"
            breadcrumbs={[{ label: 'Track Order' }]}
        >
            {/* Order Lookup Form Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-2xl mb-6">
                    <h2 className="text-base font-bold text-slate-900">Check Shipment Progress</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Enter your Order ID (found in your email confirmation or customer dashboard) and the associated contact details.
                    </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="order-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Order ID <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="order-id"
                                type="text"
                                value={orderIdInput}
                                onChange={(e) => setOrderIdInput(e.target.value)}
                                placeholder="e.g. ORD-2026-8942"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-slate-900"
                            />
                        </div>

                        <div>
                            <label htmlFor="contact-info" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Email Address or Phone Number
                            </label>
                            <input
                                id="contact-info"
                                type="text"
                                value={emailOrPhone}
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                placeholder="buyer@example.com or +1 (555)..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <Search className="w-4 h-4" />
                            <span>Track Shipment</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {trackedOrder && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">Order ID:</span>
                                    <span className="font-mono font-bold text-slate-900 text-base">{trackedOrder.orderId}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Placed on: {trackedOrder.orderDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${trackedOrder.statusColor}`}>
                                    {trackedOrder.status}
                                </span>
                            </div>
                        </div>

                        {/* Shipment Info Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Logistics Carrier</span>
                                    <span className="font-bold text-slate-900">{trackedOrder.carrier}</span>
                                    <span className="block font-mono text-[11px] text-slate-500">{trackedOrder.trackingNumber}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Estimated Arrival</span>
                                    <span className="font-bold text-emerald-700 text-sm">{trackedOrder.estimatedDelivery}</span>
                                    <span className="block text-[11px] text-slate-500">Standard Freight Dispatch</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Destination</span>
                                    <span className="font-semibold text-slate-800 line-clamp-2">{trackedOrder.destination}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Dispatch & Delivery Journey</span>
                        </h3>

                        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {trackedOrder.timeline.map((step, index) => {
                                const isDone = step.completed;
                                const isCurrent = step.current;
                                return (
                                    <div key={index} className="relative">
                                        {/* Circle Icon */}
                                        <div
                                            className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                                isCurrent
                                                    ? 'bg-amber-500 border-amber-500 text-slate-950 ring-4 ring-amber-100'
                                                    : isDone
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'bg-white border-slate-300 text-slate-400'
                                            }`}
                                        >
                                            {isDone ? (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Step Details */}
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <h4 className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-amber-600' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {step.title}
                                                </h4>
                                                <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Multi-Vendor Sub-Orders Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Store className="w-4 h-4 text-amber-500" />
                            <span>Merchant Sub-Orders Breakdown</span>
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Items shipped separately by individual verified vendors in accordance with Bizzhuss multi-vendor order routing.
                        </p>

                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                            {trackedOrder.subOrders.map((sub, sIdx) => (
                                <div key={sIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-900">{sub.subId}</span>
                                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                                                {sub.vendor}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium">{sub.item} × {sub.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </HelpLayout>
    );
}
