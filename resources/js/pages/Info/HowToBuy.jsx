import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Search,
    ShoppingCart,
    CreditCard,
    Truck,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Store,
    HelpCircle,
    PackageCheck,
    BadgeCheck,
    Sparkles,
    Lock
} from 'lucide-react';

const STEPS = [
    {
        step: '01',
        title: 'Search & Discover Verified Products',
        desc: 'Explore thousands of curated products from audited manufacturers, direct distributors, and verified sellers across electronics, industrial tools, smart gadgets, and executive office supplies.',
        icon: Search,
        highlights: [
            'Filter by verified merchant status, price range, and category',
            'Compare technical specifications, warranties, and bulk tiers',
            'Read authentic customer ratings and verified purchase reviews',
        ],
    },
    {
        step: '02',
        title: 'Add to Cart & Review Sub-Orders',
        desc: 'Bundle items from different sellers into one cart. Our distributed multi-vendor cart engine automatically groups items by merchant so you can preview separate shipping estimates and vendor discounts.',
        icon: ShoppingCart,
        highlights: [
            'Instant sub-order grouping per merchant warehouse',
            'Apply promotional vendor vouchers & bulk coupon codes',
            'Transparent freight and shipping cost breakdown',
        ],
    },
    {
        step: '03',
        title: 'Seamless & Secure Escrow Checkout',
        desc: 'Complete your purchase using our bank-grade encrypted checkout. Funds remain securely protected in our Escrow Ledger until your parcel is delivered and inspected.',
        icon: CreditCard,
        highlights: [
            'Pay via Visa, Mastercard, Cash on Delivery (COD), or Bank Wire',
            'Full 256-bit TLS encryption with zero stored CVV credentials',
            'Instant tax invoice receipt generated for enterprise and personal records',
        ],
    },
    {
        step: '04',
        title: 'Nationwide Dispatch & Real-Time Tracking',
        desc: 'Merchants dispatch items via our integrated logistics network. Follow every step from packaging and regional transit to out-for-delivery courier status with live SMS and email updates.',
        icon: Truck,
        highlights: [
            'Individual courier tracking numbers for each merchant sub-order',
            'Automated SMS notifications at each delivery milestone',
            '7-day inspection window begins upon package delivery',
        ],
    },
];

const GUARANTEES = [
    {
        icon: ShieldCheck,
        title: '100% Authentic Guarantee',
        desc: 'We mandate proof of authorized distribution from all onboarded merchants, guaranteeing genuine merchandise.',
    },
    {
        icon: Lock,
        title: 'Escrow Payment Protection',
        desc: 'Your payment is released to the seller only after the carrier confirms delivery and your inspection window passes.',
    },
    {
        icon: PackageCheck,
        title: '7-Day Return & Replacement',
        desc: 'Received a damaged, defective, or incorrect item? Submit a return request in 2 clicks for an instant refund.',
    },
];

export default function HowToBuy() {
    return (
        <HelpLayout
            title="How to Buy on Bizzhuss"
            subtitle="Your step-by-step visual guide to seamless shopping, multi-vendor carts, escrow protection, and fast delivery."
            categoryName="Customer Care"
            currentKey="how-to-buy"
            breadcrumbs={[{ label: 'How to Buy Guide' }]}
        >
            {/* 4 Steps Section */}
            <div className="space-y-6">
                {STEPS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.step}
                            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
                        >
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                {/* Number Badge & Icon */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl shadow-md">
                                        {item.step}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center md:hidden">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                        <div className="hidden md:flex w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 items-center justify-center">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
                                        {item.desc}
                                    </p>

                                    {/* Highlights */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
                                        {item.highlights.map((highlight, hIdx) => (
                                            <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Buyer Guarantees Grid */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="max-w-xl mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">The Bizzhuss Pledge</span>
                    <h3 className="text-xl font-extrabold text-white mt-1">Shop With Complete Confidence</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Our platform safeguards every rupee or dollar spent with multi-tier operational compliance.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {GUARANTEES.map((g, idx) => {
                        const Icon = g.icon;
                        return (
                            <div key={idx} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60">
                                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-sm text-white">{g.title}</h4>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{g.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Buyer Best Practices Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-amber-500" />
                    <span>Helpful Buyer Tips</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-slate-900 block font-semibold">Look for the "Verified Merchant" Badge</strong>
                        <p>Sellers with our blue verification badge have passed physical warehouse audits and legal tax verification.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-slate-900 block font-semibold">Inspect Package Before Signing</strong>
                        <p>Ensure tamper-evident security tape is intact when receiving your parcel from the courier representative.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-slate-900 block font-semibold">Combine Merchant Items to Save Freight</strong>
                        <p>Ordering multiple products from the same vendor allows automated combined logistics packing.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-slate-900 block font-semibold">Keep Your Digital Invoice</strong>
                        <p>Your PDF invoice generated in Customer Dashboard acts as valid manufacturer warranty proof.</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-amber-500 rounded-2xl text-slate-950 shadow-md">
                <div>
                    <h3 className="font-extrabold text-base">Ready to discover exceptional products?</h3>
                    <p className="text-xs text-slate-900/80 mt-0.5">
                        Browse top categories, compare verified vendor offers, and enjoy fast nationwide delivery.
                    </p>
                </div>
                <Link
                    href="/shop"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                    <span>Browse Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </HelpLayout>
    );
}
