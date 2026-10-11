import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    PackageCheck,
    Truck,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ShieldCheck,
    FileText,
    ArrowRight,
    LayoutDashboard,
    Tag,
    Wallet,
    HelpCircle,
    Store
} from 'lucide-react';

const SLAS = [
    {
        title: 'Order Acknowledgment & Acceptance',
        window: 'Within 12 Hours',
        desc: 'Vendors must confirm stock availability and acknowledge incoming sub-orders within 12 hours of payment notification.',
        urgency: 'Strict Requirement',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
        title: 'Parcel Dispatch & Courier Handover',
        window: 'Within 24 Hours',
        desc: 'Pack, generate carrier waybill, and hand over the consignment to the assigned logistics carrier within 24 business hours.',
        urgency: 'Core Metric',
        color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
        title: 'Return Request Resolution',
        window: 'Within 48 Hours',
        desc: 'Inspect returned items and approve or resolve customer dispute claims within 48 hours of warehouse delivery.',
        urgency: 'Escrow Milestone',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
        title: 'Customer Inquiry Response',
        window: 'Within 4 Hours',
        desc: 'Respond to pre-purchase product questions or order-related buyer messages via the portal messaging inbox.',
        urgency: 'Rating Factor',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
];

const PACKAGING_RULES = [
    {
        rule: 'Secure Double-Walled Cartons',
        desc: 'All heavy tools, electronics, and multi-component hardware must be packed in durable double-walled corrugated boxes.',
    },
    {
        rule: 'Tamper-Evident Security Seal Tape',
        desc: 'Seal all box flaps with branded or serialized tamper-proof tape to prevent pilferage during multi-hub line-haul transit.',
    },
    {
        rule: 'Enclosed Sub-Order Packing Slip',
        desc: 'Always print and slip the customer invoice/order manifest inside the box or enclosed in an adhesive document pouch.',
    },
    {
        rule: 'Standard Barcode Label Orientation',
        desc: 'Ensure the carrier shipping waybill is applied completely flat on the largest package surface without creases over barcodes.',
    },
];

const PORTAL_MODULES = [
    {
        name: 'Product Catalog & Inventory',
        desc: 'Create, edit, duplicate, and manage multi-variant SKUs, pricing, and live inventory thresholds.',
        link: '/vendor/products',
        icon: PackageCheck,
    },
    {
        name: 'Order Fulfillment & Invoicing',
        desc: 'Track pending sub-orders, update tracking status, and download tax-compliant PDF commercial invoices.',
        link: '/vendor/orders',
        icon: Truck,
    },
    {
        name: 'Coupons & Flash Discounts',
        desc: 'Launch percentage or fixed discount promotional vouchers to boost storefront conversion.',
        link: '/vendor/coupons',
        icon: Tag,
    },
    {
        name: 'Financial Wallet & Payouts',
        desc: 'Monitor net revenue, platform commission deductions, pending escrow balance, and request bank payouts.',
        link: '/vendor/wallet',
        icon: Wallet,
    },
];

export default function VendorCenter() {
    return (
        <HelpLayout
            title="Vendor Operational Center & Standards"
            subtitle="Essential merchant handbook, fulfillment SLAs, packaging compliance, and portal navigation procedures."
            categoryName="Bizzhuss Business"
            currentKey="vendor-center"
            breadcrumbs={[{ label: 'Vendor Center' }]}
        >
            {/* Quick Access to Vendor Portal */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Merchant Portal</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white">Access Your Live Vendor Dashboard</h2>
                    <p className="text-xs text-slate-400 max-w-lg">
                        Manage your catalog, process orders, request payouts, and monitor customer reviews directly from your merchant central portal.
                    </p>
                </div>
                <Link
                    href="/vendor"
                    className="shrink-0 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                    <span>Open Vendor Portal</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Fulfillment SLAs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">Mandatory Merchant Fulfillment SLAs</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Maintaining these service level agreements protects your seller tier and unlocks preferred placement on catalog pages.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SLAS.map((sla, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sla.color}`}>
                                    {sla.urgency}
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {sla.window}
                                </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 pt-1">{sla.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{sla.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Packaging & Labeling Standards */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">Packaging & Labeling Compliance</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        All consignments must meet courier freight standards to prevent in-transit transit damage and ensure rapid sorting.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    {PACKAGING_RULES.map((p, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-1.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <strong className="font-bold text-slate-900">{p.rule}</strong>
                            </div>
                            <p className="text-slate-500 pl-6 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Portal Architecture Modules */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Merchant Central Capabilities</h3>
                <p className="text-xs text-slate-500 mb-6">
                    Key features available inside your merchant control portal:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PORTAL_MODULES.map((mod, idx) => {
                        const Icon = mod.icon;
                        return (
                            <Link
                                key={idx}
                                href={mod.link}
                                className="group p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all flex items-start gap-3.5 bg-slate-50/30"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                                        <span>{mod.name}</span>
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{mod.desc}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </HelpLayout>
    );
}
