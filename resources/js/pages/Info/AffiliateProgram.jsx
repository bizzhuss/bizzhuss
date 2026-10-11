import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Share2,
    TrendingUp,
    Clock,
    DollarSign,
    Users,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    MousePointerClick,
    Award,
    HelpCircle
} from 'lucide-react';

const TIERS = [
    {
        name: 'Standard Creator & Publisher',
        rate: 'Up to 8%',
        desc: 'Perfect for content creators, review blogs, price comparison engines, and social media influencers.',
        perks: [
            '45-day attribution cookie window',
            'Full product catalog deep-linking tools',
            'Monthly automated ACH/Wire payouts',
            'Real-time traffic & conversion metrics',
        ],
        highlight: false,
    },
    {
        name: 'Premier Volume Partner',
        rate: 'Up to 12%',
        desc: 'Designed for enterprise media networks, top editorial publications, and high-converting commercial sites.',
        perks: [
            'Dedicated partner growth manager',
            'Exclusive coupon codes for your audience',
            'Bi-weekly priority payout disbursement',
            'Early access to major seasonal sales events',
        ],
        highlight: true,
    },
    {
        name: 'B2B Corporate Referral',
        rate: '3% Recurring',
        desc: 'For procurement consultants, IT consultants, and business advisors referring corporate bulk buyers.',
        perks: [
            'Recurring commissions on enterprise POs for 12 months',
            'High average order value (Rs. 500,000+)',
            'Dedicated B2B account onboarding specialist',
            'Consolidated quarterly revenue reports',
        ],
        highlight: false,
    },
];

const STEPS = [
    {
        step: '1',
        title: 'Sign Up & Get Approved',
        desc: 'Complete our free affiliate application. Most applications are reviewed and approved within 24 hours.',
        icon: Users,
    },
    {
        step: '2',
        title: 'Generate Deep Links',
        desc: 'Use our affiliate dashboard to generate trackable links, banners, or widgets for any product or category.',
        icon: MousePointerClick,
    },
    {
        step: '3',
        title: 'Share With Audience',
        desc: 'Embed links in reviews, blogs, YouTube descriptions, newsletters, or business advisory recommendations.',
        icon: Share2,
    },
    {
        step: '4',
        title: 'Earn Verified Commissions',
        desc: 'Collect revenue on every completed purchase within 45 days of customer click. Withdraw via bank wire.',
        icon: DollarSign,
    },
];

export default function AffiliateProgram() {
    return (
        <HelpLayout
            title="Bizzhuss Partner & Affiliate Program"
            subtitle="Monetize your audience and business connections with industry-leading commission tiers and 45-day tracking cookies."
            categoryName="Bizzhuss Business"
            currentKey="affiliate"
            breadcrumbs={[{ label: 'Affiliate Program' }]}
        >
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
                <div className="max-w-2xl relative z-10 space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        <span>High-Yield Marketplace Affiliate Network</span>
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white">
                        Earn Up to 12% on Every Referred Sale.
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        Partner with the fastest-growing multi-vendor enterprise marketplace. Access thousands of high-ticket SKUs, transparent real-time analytics, and guaranteed payouts.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                        <Link
                            href="/register"
                            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-md inline-flex items-center gap-2"
                        >
                            <span>Apply for Affiliate Program</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Commission Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIERS.map((tier, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                            tier.highlight
                                ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                                : 'bg-white border-slate-200 shadow-sm'
                        }`}
                    >
                        <div>
                            {tier.highlight && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="font-bold text-sm text-slate-900">{tier.name}</h3>
                            <div className="my-3 flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-black text-slate-900">{tier.rate}</span>
                                <span className="text-xs text-slate-500 font-medium">per verified sale</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">{tier.desc}</p>

                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                {tier.perks.map((perk, pIdx) => (
                                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{perk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6">
                            <Link
                                href="/register"
                                className={`w-full py-2.5 rounded-xl text-xs font-bold text-center block transition-colors ${
                                    tier.highlight
                                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                }`}
                            >
                                Join This Tier
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">How The Affiliate System Operates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.step} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 font-bold text-xs flex items-center justify-center">
                                    {s.step}
                                </div>
                                <h4 className="font-bold text-xs text-slate-900">{s.title}</h4>
                                <p className="text-[11px] text-slate-500 leading-normal">{s.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FAQ Box */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <h3 className="text-base font-bold text-white mb-4">Affiliate Program Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <strong className="text-white block font-semibold mb-1">What is the cookie attribution window?</strong>
                        <span>We provide a generous 45-day tracking cookie. If a visitor clicks your link and buys within 45 days, you receive commission.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <strong className="text-white block font-semibold mb-1">When are affiliate earnings paid out?</strong>
                        <span>Commissions are settled on the 15th of each month for all purchases cleared through the 7-day buyer return period.</span>
                    </div>
                </div>
            </div>
        </HelpLayout>
    );
}
