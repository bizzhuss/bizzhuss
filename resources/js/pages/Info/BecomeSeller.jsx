import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Store,
    Sparkles,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    PackageCheck,
    Truck,
    ArrowRight,
    Users,
    BarChart3,
    Clock,
    FileText,
    HelpCircle
} from 'lucide-react';

const STATS = [
    { label: 'Annual Merchandise Volume', value: 'Rs. 4.5B+' },
    { label: 'Active Retail & B2B Buyers', value: '2.5M+' },
    { label: 'Verified Active Merchants', value: '4,200+' },
    { label: 'On-Time Logistics Delivery', value: '98.4%' },
];

const BENEFITS = [
    {
        title: 'Zero Listing or Onboarding Fees',
        desc: 'List unlimited SKUs without paying upfront listing fees, catalog charges, or monthly account maintenance costs.',
        icon: DollarSign,
    },
    {
        title: 'Discounted Integrated Freight',
        desc: 'Leverage our pre-negotiated tier-1 carrier rates. Print pre-addressed waybills directly from your vendor portal.',
        icon: Truck,
    },
    {
        title: 'Fast Automated Payouts',
        desc: 'Bi-weekly automated disbursements straight to your company bank account via Bank Transfer with low Rs. 5,000 threshold.',
        icon: TrendingUp,
    },
    {
        title: 'Powerful Merchant Command Suite',
        desc: 'Manage inventory, generate promotional coupons, track live revenue, and fulfill sub-orders seamlessly.',
        icon: BarChart3,
    },
    {
        title: 'Enterprise B2B Purchase Orders',
        desc: 'Unlock wholesale bulk order requests from vetted corporate procurement teams and government entities.',
        icon: PackageCheck,
    },
    {
        title: 'Fraud & Chargeback Escrow Protection',
        desc: 'Our AI fraud shield and payment escrow protect your merchandise from fraudulent chargebacks and payment disputes.',
        icon: ShieldCheck,
    },
];

const ONBOARDING_STEPS = [
    {
        step: '1',
        title: 'Create Merchant Account',
        desc: 'Register in under 2 minutes. Provide your shop name, contact email, and phone number.',
    },
    {
        step: '2',
        title: 'Verify Business & Bank Info',
        desc: 'Upload your National Tax ID (NTN) or business registration and link your bank account for settlements.',
    },
    {
        step: '3',
        title: 'Upload Products & Set Stock',
        desc: 'Add items via our intuitive form or bulk CSV importer. Set custom prices, SKUs, and specifications.',
    },
    {
        step: '4',
        title: 'Receive Orders & Get Paid',
        desc: 'Box and dispatch incoming sub-orders. Funds are deposited automatically to your merchant wallet.',
    },
];

export default function BecomeSeller() {
    return (
        <HelpLayout
            title="Become a Seller on Bizzhuss"
            subtitle="Scale your brand across our premier multi-vendor marketplace with zero setup fees and access to millions of active buyers."
            categoryName="Bizzhuss Business"
            currentKey="become-seller"
            breadcrumbs={[{ label: 'Become a Seller' }]}
        >
            {/* 0% Intro Fee Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 md:p-8 text-slate-950 shadow-xl">
                <div className="max-w-2xl relative z-10 space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Exclusive New Merchant Promotion</span>
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-950 leading-tight">
                        0% Commission for Your First 60 Days.
                    </h2>
                    <p className="text-xs md:text-sm text-slate-900/90 leading-relaxed font-medium">
                        Join over 4,200 verified distributors and manufacturers. Keep 100% of your earnings during your first 60 days of onboarding on Bizzhuss.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                            href="/register?role=vendor"
                            className="px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-extrabold hover:bg-slate-900 transition-colors shadow-lg inline-flex items-center gap-2"
                        >
                            <span>Open Your Shop Today</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-5 py-3 rounded-xl bg-white/30 text-slate-950 text-xs font-bold hover:bg-white/40 transition-colors backdrop-blur-xs"
                        >
                            Existing Merchant Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Performance Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
                        <span className="text-xl md:text-2xl font-black text-slate-900 block">{stat.value}</span>
                        <span className="text-[11px] text-slate-500 font-medium mt-1 block">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Merchant Benefits Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Why Sell With Us</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">Built to Accelerate Merchant Growth</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        We handle infrastructure, secure payments, and logistics so you can focus on inventory and supply.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {BENEFITS.map((b, idx) => {
                        const Icon = b.icon;
                        return (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">{b.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* How It Works - Onboarding Journey */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">Start Selling in 4 Simple Steps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {ONBOARDING_STEPS.map((step) => (
                        <div key={step.step} className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 space-y-2 relative">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 font-black text-xs flex items-center justify-center">
                                {step.step}
                            </div>
                            <h4 className="font-bold text-xs text-slate-900">{step.title}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Required Documents Card */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-amber-400" />
                    <div>
                        <h4 className="text-base font-bold text-white">Required Onboarding Documentation</h4>
                        <p className="text-xs text-slate-400">Keep these handy when completing your merchant verification</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <strong className="text-white block font-semibold mb-1">1. Government Identity</strong>
                        <span>Valid National CNIC, Passport, or Corporate Director ID</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <strong className="text-white block font-semibold mb-1">2. Business Tax Registration</strong>
                        <span>NTN / GST certificate or legal trade license document</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <strong className="text-white block font-semibold mb-1">3. Corporate Bank Account</strong>
                        <span>Voided check or official bank account verification letter</span>
                    </div>
                </div>
            </div>

            {/* Action CTA */}
            <div className="p-6 rounded-2xl bg-amber-500 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                    <h3 className="font-extrabold text-base">Ready to multiply your commercial sales?</h3>
                    <p className="text-xs text-slate-900/80 mt-0.5">
                        Registration takes less than 3 minutes with zero credit card required.
                    </p>
                </div>
                <Link
                    href="/register?role=vendor"
                    className="shrink-0 px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-extrabold hover:bg-slate-900 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                    <span>Register as Vendor</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </HelpLayout>
    );
}
