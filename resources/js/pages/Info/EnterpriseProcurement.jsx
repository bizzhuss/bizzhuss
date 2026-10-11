import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Building2,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    FileSpreadsheet,
    Users,
    TrendingDown,
    Send,
    Truck,
    Clock,
    Briefcase
} from 'lucide-react';

const B2B_ADVANTAGES = [
    {
        title: 'Volume-Tiered Wholesale Discounts',
        desc: 'Direct manufacturer pricing tiers with up to 35% discount on bulk industrial, electronics, and office orders.',
        icon: TrendingDown,
    },
    {
        title: 'Net 30 & Net 60 Credit Lines',
        desc: 'Approved corporate accounts receive flexible credit terms with automated billing cycles and statement reconciliation.',
        icon: CreditCard,
    },
    {
        title: 'Unified Tax-Compliant Invoicing',
        desc: 'Single consolidated VAT/GST/NTN invoices across multiple vendors for seamless accounting and corporate tax audits.',
        icon: FileSpreadsheet,
    },
    {
        title: 'Dedicated Enterprise Account Manager',
        desc: 'Direct point-of-contact for custom RFQs, specialized logistics, contract negotiation, and SLA oversight.',
        icon: Users,
    },
];

export default function EnterpriseProcurement() {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        company_name: '',
        business_email: '',
        phone: '',
        tax_id: '',
        monthly_volume: 'Rs. 1,000,000 - 5,000,000',
        categories: 'Enterprise Hardware, Heavy Tooling',
        notes: '',
    });

    const [submittedLocal, setSubmittedLocal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/business/enterprise', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSubmittedLocal(true);
            },
            onError: () => {
                setSubmittedLocal(true);
            }
        });
    };

    return (
        <HelpLayout
            title="Enterprise & Corporate Procurement"
            subtitle="Custom bulk wholesale purchasing, volume tiered discounts, and flexible corporate credit terms for large organizations."
            categoryName="Bizzhuss Business"
            currentKey="enterprise"
            breadcrumbs={[{ label: 'Enterprise Procurement' }]}
        >
            {/* Executive Hero Banner */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Bizzhuss Corporate Procurement Division</span>
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white">
                        Streamline Corporate Sourcing at Enterprise Scale.
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        From factories and commercial facilities to multi-office technology upgrades, access hundreds of verified manufacturers on a single consolidated corporate invoice.
                    </p>
                </div>
            </div>

            {/* B2B Advantages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {B2B_ADVANTAGES.map((adv, idx) => {
                    const Icon = adv.icon;
                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">{adv.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{adv.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* B2B Interactive Quote Request Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">Request Enterprise RFQ or Credit Line</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Submit your company requirements below. Our commercial procurement team will analyze your needs and return a wholesale quotation within 4 business hours.
                    </p>
                </div>

                {submittedLocal || recentlySuccessful ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-emerald-900">Corporate RFQ Submitted!</h4>
                        <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                            A dedicated Enterprise Account Director has been assigned to your file. We will contact your business email with volume tier pricing and credit terms shortly.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSubmittedLocal(false)}
                            className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
                        >
                            Submit another procurement request
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Company / Organization Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="Acme Global Corporation"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {errors.company_name && <p className="text-rose-500 text-[11px] mt-1">{errors.company_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Official Business Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.business_email}
                                    onChange={(e) => setData('business_email', e.target.value)}
                                    placeholder="procurement@acmeglobal.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {errors.business_email && <p className="text-rose-500 text-[11px] mt-1">{errors.business_email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Corporate Contact Phone <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {errors.phone && <p className="text-rose-500 text-[11px] mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tax ID / NTN / Registration
                                </label>
                                <input
                                    type="text"
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                    placeholder="e.g. 12-3456789"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Estimated Monthly Volume <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.monthly_volume}
                                    onChange={(e) => setData('monthly_volume', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="Rs. 500,000 - 1,000,000">Rs. 500,000 – Rs. 1,000,000 / month</option>
                                    <option value="Rs. 1,000,000 - 5,000,000">Rs. 1,000,000 – Rs. 5,000,000 / month</option>
                                    <option value="Rs. 5,000,000 - 25,000,000">Rs. 5,000,000 – Rs. 25,000,000 / month</option>
                                    <option value="Rs. 25,000,000+">Rs. 25,000,000+ / month (Enterprise)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Target Product Categories & Specifications
                            </label>
                            <input
                                type="text"
                                value={data.categories}
                                onChange={(e) => setData('categories', e.target.value)}
                                placeholder="e.g. Industrial Automation, Server Racks, Executive Ergonomic Furniture"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Procurement Scope & PO Requirements <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Please detail target delivery locations, desired payment terms (Net 30/60), and any required safety/spec compliance certifications..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            {errors.notes && <p className="text-rose-500 text-[11px] mt-1">{errors.notes}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-slate-400">
                                Inquiries protected under mutual B2B NDA.
                            </span>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{processing ? 'Submitting RFQ...' : 'Submit Enterprise RFQ'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </HelpLayout>
    );
}
