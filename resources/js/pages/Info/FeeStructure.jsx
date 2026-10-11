import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    CreditCard,
    DollarSign,
    Calculator,
    CheckCircle2,
    Clock,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Building2,
    Landmark,
    Percent
} from 'lucide-react';

const CATEGORY_FEES = [
    {
        category: 'Sensors & Industrial IoT',
        rate: 5.0,
        slug: 'industrial-iot',
        desc: 'Telemetry devices, temperature sensors, embedded controllers',
    },
    {
        category: 'Consumer & Enterprise Electronics',
        rate: 6.0,
        slug: 'enterprise-hardware',
        desc: 'Laptops, mobile devices, networking gear, surveillance',
    },
    {
        category: 'Executive Office & Furniture',
        rate: 7.0,
        slug: 'executive-office',
        desc: 'Ergonomic chairs, desks, acoustic booths, executive desks',
    },
    {
        category: 'Heavy Tooling & Industrial Machinery',
        rate: 8.0,
        slug: 'heavy-tooling',
        desc: 'CNC tooling, drills, hydraulic lifts, factory automation',
    },
    {
        category: 'Apparel, Safety & Workwear',
        rate: 10.0,
        slug: 'apparel-safety',
        desc: 'Hi-vis jackets, steel-toe boots, protective helmets, gloves',
    },
    {
        category: 'General Commercial Supplies',
        rate: 8.0,
        slug: 'general-commercial',
        desc: 'Packaging materials, cleaning chemicals, office consumables',
    },
];

const PAYOUT_METHODS = [
    {
        method: 'Direct Bank Wire (ACH / EFT)',
        speed: 'Every alternate Tuesday (Bi-weekly)',
        minThreshold: 'Rs. 5,000',
        fee: '0% Platform Surcharge',
        icon: Landmark,
    },
    {
        method: 'Express Wire Settlement',
        speed: 'Within 24 Hours upon request',
        minThreshold: 'Rs. 25,000',
        fee: 'Rs. 500 Flat Bank Wire Fee',
        icon: TrendingUp,
    },
    {
        method: 'Bizzhuss Commercial Wallet',
        speed: 'Instant upon Escrow Release',
        minThreshold: 'Rs. 0',
        fee: '0% Free (Re-invest in Catalog)',
        icon: CreditCard,
    },
];

export default function FeeStructure() {
    const [calcPrice, setCalcPrice] = useState(150);
    const [calcRate, setCalcRate] = useState(6.0);

    const price = parseFloat(calcPrice) || 0;
    const commissionAmount = (price * (calcRate / 100));
    const gatewayFee = (price * 0.025);
    const netEarnings = Math.max(0, price - commissionAmount - gatewayFee);

    return (
        <HelpLayout
            title="Fee Structure & Payout Settlement"
            subtitle="Transparent commission rates by category, automated settlement cycles, and interactive revenue calculator."
            categoryName="Bizzhuss Business"
            currentKey="fees-payouts"
            breadcrumbs={[{ label: 'Fee Structure & Payouts' }]}
        >
            {/* Zero Hidden Fees Pledge */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                        100% Transparent
                    </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">No Hidden Fees. No Surprises.</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    At Bizzhuss, we believe in fair, predictable pricing. You only pay a modest platform commission when you successfully complete a sale.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                            <strong className="text-white block font-bold">Rs. 0 Listing Fees</strong>
                            <span className="text-slate-400 text-[11px]">List unlimited products free</span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                            <strong className="text-white block font-bold">Rs. 0 Monthly Charges</strong>
                            <span className="text-slate-400 text-[11px]">No recurring subscription dues</span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                            <strong className="text-white block font-bold">2.5% Direct Gateway</strong>
                            <span className="text-slate-400 text-[11px]">Standard bank card processing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Commission Rate Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">Standard Platform Commission Schedule</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Applied solely to the item sales price upon successful customer delivery.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <th className="pb-3">Product Department / Category</th>
                                <th className="pb-3">Standard Commission</th>
                                <th className="pb-3">Promotional 60-Day Rate</th>
                                <th className="pb-3 text-right">Typical Items</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {CATEGORY_FEES.map((fee, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-3.5 font-bold text-slate-900">{fee.category}</td>
                                    <td className="py-3.5">
                                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                            {fee.rate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                            0.0% (First 60 Days)
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-slate-500 text-right text-[11px] max-w-xs truncate">
                                        {fee.desc}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Interactive Commission & Earnings Calculator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Interactive Merchant Earnings Calculator</h3>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                    Estimate your take-home payout per order based on item selling price and category commission.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Item Selling Price ($)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="100000"
                                    value={calcPrice}
                                    onChange={(e) => setCalcPrice(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Product Category / Commission Tier
                            </label>
                            <select
                                value={calcRate}
                                onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                            >
                                {CATEGORY_FEES.map((fee, idx) => (
                                    <option key={idx} value={fee.rate}>
                                        {fee.category} ({fee.rate.toFixed(1)}%)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Calculated Output Box */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>Item Retail Price:</span>
                            <span className="font-mono font-semibold">${price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>Platform Fee ({calcRate}%):</span>
                            <span className="font-mono font-semibold text-rose-600">-${commissionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>Payment Processing (2.5%):</span>
                            <span className="font-mono font-semibold text-rose-600">-${gatewayFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">Your Estimated Net Payout:</span>
                            <span className="font-mono text-lg font-black text-emerald-600">
                                ${netEarnings.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1 text-right">
                            *Excludes custom logistics adjustments or promotional merchant discounts.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payout Channels & Schedules */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Disbursement Cycles & Channels</h3>
                <p className="text-xs text-slate-500 mb-6">
                    Choose your preferred settlement method inside your Vendor Settings dashboard.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PAYOUT_METHODS.map((pm, idx) => {
                        const Icon = pm.icon;
                        return (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{pm.method}</h4>
                                <div className="text-[11px] text-slate-600 space-y-1">
                                    <p><strong className="text-slate-800">Frequency:</strong> {pm.speed}</p>
                                    <p><strong className="text-slate-800">Minimum:</strong> {pm.minThreshold}</p>
                                    <p className="text-emerald-700 font-semibold">{pm.fee}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </HelpLayout>
    );
}
