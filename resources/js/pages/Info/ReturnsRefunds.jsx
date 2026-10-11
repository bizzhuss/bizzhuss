import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    RotateCcw,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    PackageCheck,
    Truck,
    ShieldAlert,
    ArrowRight,
    FileCheck,
    Wallet
} from 'lucide-react';

const RETURN_STEPS = [
    {
        num: '1',
        title: 'Submit Return Request',
        desc: 'Log in to your Customer Dashboard, select the order, and choose the item and reason for return. Upload clear photos if the item is damaged or defective.',
        icon: FileCheck,
    },
    {
        num: '2',
        title: 'Vendor Review & Approval',
        desc: 'The merchant receives your claim and must respond within 24 business hours. If approved, an automated prepaid return waybill is generated.',
        icon: PackageCheck,
    },
    {
        num: '3',
        title: 'Courier Pickup / Drop-off',
        desc: 'Our logistics courier collects the parcel from your address, or you can drop it off at any authorized regional logistics partner hub.',
        icon: Truck,
    },
    {
        num: '4',
        title: 'Rapid Quality Inspection',
        desc: 'Upon receipt at the vendor fulfillment facility, items are inspected for original tags, serial verification, and condition within 24 hours.',
        icon: Clock,
    },
    {
        num: '5',
        title: 'Instant Refund Disbursement',
        desc: 'Once approved, your refund is disbursed immediately to your Bizzhuss Wallet balance or refunded back to your original payment method.',
        icon: Wallet,
    },
];

const ELIGIBLE_ITEMS = [
    'Damaged, dented, or broken goods received upon courier delivery',
    'Manufacturing defects or non-functional electronic components',
    'Incorrect items or items materially different from product specifications',
    'Unopened, brand-new merchandise with intact manufacturer seal and tags',
    'Missing components, cables, or accessories from factory box',
];

const INELIGIBLE_ITEMS = [
    'Items where return request is filed after the 7-day delivery window',
    'Personal hygiene, sanitary goods, or consumables with opened seal',
    'Customized or specially engraved enterprise machinery parts',
    'Products showing signs of customer misuse, physical drop, or liquid spill',
    'Items missing original serial numbers, UPC barcodes, or factory warranty seals',
];

const TIMEFRAMES = [
    {
        method: 'Bizzhuss Customer Wallet',
        timing: 'Instant (Under 5 minutes)',
        fee: '0% Free of charge',
        badge: 'Fastest & Recommended',
    },
    {
        method: 'Visa / MasterCard Debit & Credit Cards',
        timing: '3 to 5 business days',
        fee: '0% Free of charge',
        badge: 'Original Gateway',
    },
    {
        method: 'Direct Bank Wire / ACH Transfer',
        timing: '2 to 4 business days',
        fee: '0% Free of charge',
        badge: 'Corporate / B2B',
    },
    {
        method: 'Cash on Delivery (COD) Orders',
        timing: 'Instant to Wallet / Bank Wire 2-3 days',
        fee: '0% Free of charge',
        badge: 'Flexible',
    },
];

export default function ReturnsRefunds() {
    return (
        <HelpLayout
            title="Returns & Refunds Policy"
            subtitle="Transparent 7-day buyer protection guarantee, return eligibility guidelines, and instant escrow reimbursement."
            categoryName="Customer Care"
            currentKey="returns-refunds"
            breadcrumbs={[{ label: 'Returns & Refunds' }]}
        >
            {/* 7-Day Guarantee Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Hassle-Free 7-Day Guarantee</span>
                    </span>
                    <h2 className="text-xl md:text-2xl font-black">Not 100% Satisfied? Return It Easily.</h2>
                    <p className="text-xs md:text-sm text-emerald-100 max-w-xl leading-relaxed">
                        Every purchase on Bizzhuss includes a mandatory 7-calendar-day buyer inspection guarantee. If your order isn't right, we guarantee your money back.
                    </p>
                </div>
                <Link
                    href="/customer/dashboard"
                    className="shrink-0 px-5 py-3 rounded-xl bg-white text-emerald-900 text-xs font-extrabold hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                    <span>Manage My Orders</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Step-by-Step Return Process */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-8">
                    <h3 className="text-base font-bold text-slate-900">How The Return Process Works</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Our automated return workflow ensures fast turnaround times with courier door-to-door reverse pickup.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                    {RETURN_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 font-black text-xs flex items-center justify-center">
                                            {step.num}
                                        </div>
                                        <Icon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{step.title}</h4>
                                    <p className="text-[11px] text-slate-600 mt-1 leading-normal">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Eligible vs Ineligible Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eligible */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">Eligible for 100% Refund</h4>
                            <span className="text-[11px] text-slate-500">Qualifies under 7-day buyer protection</span>
                        </div>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                        {ELIGIBLE_ITEMS.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ineligible */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">Ineligible Conditions</h4>
                            <span className="text-[11px] text-slate-500">Exceptions to standard return policy</span>
                        </div>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                        {INELIGIBLE_ITEMS.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <span className="leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Refund Settlement Timeframes Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Refund Settlement Timeframes
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Time required for reimbursement to reflect in your chosen account after merchant inspection approval.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <th className="pb-3">Payment Method</th>
                                <th className="pb-3">Settlement Speed</th>
                                <th className="pb-3">Platform Processing Fee</th>
                                <th className="pb-3 text-right">Badge</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {TIMEFRAMES.map((tf, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-3.5 font-bold text-slate-900">{tf.method}</td>
                                    <td className="py-3.5 text-slate-600 font-medium">{tf.timing}</td>
                                    <td className="py-3.5 text-emerald-600 font-bold">{tf.fee}</td>
                                    <td className="py-3.5 text-right">
                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                            {tf.badge}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ Question Card */}
            <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900">Have a dispute with a merchant?</h4>
                    <p className="text-xs text-slate-600">
                        If a vendor denies your valid return claim, Bizzhuss Support will intervene and mediate within 24 hours.
                    </p>
                </div>
                <Link
                    href="/contact"
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors inline-flex items-center gap-1.5"
                >
                    <span>Escalate to Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </HelpLayout>
    );
}
