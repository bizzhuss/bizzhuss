import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Network,
    GitBranch,
    ShoppingCart,
    Store,
    Truck,
    ShieldCheck,
    Cpu,
    Database,
    ArrowRight,
    CheckCircle2,
    Layers,
    Clock,
    Lock
} from 'lucide-react';

const WORKFLOW_STEPS = [
    {
        num: '01',
        title: 'Unified Customer Checkout',
        subtitle: 'Single Cart, Multiple Merchants',
        desc: 'The customer adds items from disparate merchants into one cart. The frontend calculates combined taxes and applies multi-vendor shipping algorithms before processing a single consolidated payment.',
        icon: ShoppingCart,
        badge: 'Customer Facing',
    },
    {
        num: '02',
        title: 'Decomposition Engine (OrderService)',
        subtitle: 'Atomic Database Sub-Order Splitting',
        desc: 'Inside Laravel, OrderService executes a DB transaction that creates the Master Order and decomposes it into individual vendor sub-orders with custom serial numbers, deducting inventory atomically.',
        icon: GitBranch,
        badge: 'Backend Core',
    },
    {
        num: '03',
        title: 'Isolated Vendor Queue & Notifications',
        subtitle: 'Protected Multi-Tenant Data Boundaries',
        desc: 'Merchants receive isolated event webhooks and dashboard alerts. Each vendor views only their own items, customer delivery address, and line-item packing manifests, preserving competitor privacy.',
        icon: Store,
        badge: 'Vendor Tier',
    },
    {
        num: '04',
        title: 'Split-Carrier Logistics Dispatch',
        subtitle: 'Independent Waybills & Line-Haul Routing',
        desc: 'Each vendor generates an individual carrier tracking code and hands over their parcel to the assigned regional freight partner. Sub-orders travel along independent freight routes.',
        icon: Truck,
        badge: 'Carrier Network',
    },
    {
        num: '05',
        title: 'Unified Customer Tracking & Escrow',
        subtitle: 'Consolidated Telemetry & Settlement',
        desc: 'The buyer monitors all sub-packages from a single tracking timeline. Upon confirmed delivery of each sub-order, the Escrow Ledger releases funds to the respective vendor wallet.',
        icon: ShieldCheck,
        badge: 'Settlement Ledger',
    },
];

const ARCHITECTURE_METRICS = [
    { label: 'Sub-Order Decomposition Latency', value: '< 45ms' },
    { label: 'Multi-Vendor Concurrency Lock', value: 'ACID Guaranteed' },
    { label: 'Carrier Integration Webhooks', value: 'Real-Time' },
    { label: 'Escrow Settlement Accuracy', value: '100% Audited' },
];

export default function OrderRouting() {
    return (
        <HelpLayout
            title="Distributed Order Routing Service"
            subtitle="Deep architectural overview of our multi-vendor sub-order splitting, inventory synchronization, and escrow fulfillment engine."
            categoryName="Platform Operations"
            currentKey="order-routing"
            breadcrumbs={[{ label: 'Order Routing Service' }]}
        >
            {/* Tech Overview Card */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Core Multi-Tenant Routing Engine</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white">
                        How Bizzhuss Deconstructs & Fulfills Complex Multi-Vendor Orders.
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        In a traditional e-commerce architecture, multi-seller baskets cause split billing, disjointed inventory tracking, and payment confusion. Bizzhuss solves this with an automated micro-service router built directly into our Laravel 11 core.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
                    {ARCHITECTURE_METRICS.map((m, idx) => (
                        <div key={idx} className="text-center">
                            <span className="font-mono text-base md:text-lg font-black text-amber-400 block">{m.value}</span>
                            <span className="text-[11px] text-slate-400 mt-1 block">{m.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step-by-Step Architectural Pipeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                <div>
                    <h3 className="text-base font-bold text-slate-900">5-Stage Order Execution Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        From click of checkout to warehouse dispatch and escrow clearance.
                    </p>
                </div>

                <div className="space-y-4">
                    {WORKFLOW_STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.num}
                                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start gap-5"
                            >
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-mono font-black text-base shadow-sm">
                                        {step.num}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center md:hidden">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 w-fit">
                                            {step.badge}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-amber-600 block">{step.subtitle}</span>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Concurrency & Safety Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Data Isolation & Security Principles</h3>
                <p className="text-xs text-slate-500 mb-6">
                    How Bizzhuss enforces strict enterprise-grade boundaries between vendor tenants:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Lock className="w-4 h-4 text-amber-500" />
                            <span>Pessimistic Row Locking</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            During high-velocity flash sales, product stock counters are locked with DB pessimistic row locks to prevent overselling.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Database className="w-4 h-4 text-emerald-500" />
                            <span>Tenant Data Scoping</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Every database query inside the vendor portal is strictly scoped to the vendor ID via Eloquent global scopes and Gate policies.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Layers className="w-4 h-4 text-sky-500" />
                            <span>Automated Escrow Ledger</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Platform commissions and vendor wallet balances are maintained in an immutable double-entry ledger table.
                        </p>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
