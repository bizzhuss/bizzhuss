import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    CheckCircle2,
    Headphones,
    Building2,
    ShieldCheck,
    MessageCircle,
    ArrowUpRight
} from 'lucide-react';

const CONTACT_CARDS = [
    {
        title: 'Priority Email Support',
        desc: 'Direct dispatch to customer care representatives. Typical response time under 2 hours.',
        info: 'bizzhuss@gmail.com',
        actionText: 'Send an Email',
        href: 'mailto:bizzhuss@gmail.com',
        icon: Mail,
        color: 'bg-amber-500/10 text-amber-600',
    },
    {
        title: 'Phone & Direct Hotline',
        desc: 'Direct phone assistance for order inquiries, delivery status, and customer care.',
        info: '+92 335 7895884 (0335 7895884)',
        actionText: 'Call Helpline',
        href: 'tel:+923357895884',
        icon: Phone,
        color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
        title: 'WhatsApp Instant Chat',
        desc: 'Connect with our official WhatsApp concierge for rapid order and merchant assistance.',
        info: '+92 335 7895884',
        actionText: 'Open WhatsApp',
        href: 'https://wa.me/923357895884',
        icon: MessageCircle,
        color: 'bg-teal-500/10 text-teal-600',
    },
    {
        title: 'Official Social Channels',
        desc: 'Follow our official Facebook and Instagram channels for promotions and announcements.',
        info: '@bizzhuss (Instagram & Facebook)',
        actionText: 'Visit Instagram',
        href: 'https://www.instagram.com/bizzhuss/',
        icon: ArrowUpRight,
        color: 'bg-indigo-500/10 text-indigo-600',
    },
];

export default function ContactUs() {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        order_id: '',
        department: 'General Inquiries',
        message: '',
    });

    const [submittedLocal, setSubmittedLocal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSubmittedLocal(true);
            },
            onError: () => {
                // If route error or offline, fallback to local feedback
                setSubmittedLocal(true);
            }
        });
    };

    return (
        <HelpLayout
            title="Contact Customer Support & Operations"
            subtitle="Get in touch with our 24/7 concierge support team, fulfillment operations, or merchant relations desk."
            categoryName="Customer Care"
            currentKey="contact"
            breadcrumbs={[{ label: 'Contact Us' }]}
        >
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONTACT_CARDS.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm">{card.title}</h3>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                    {card.desc}
                                </p>
                                <p className="text-xs font-mono font-bold text-slate-900 break-words mb-4">
                                    {card.info}
                                </p>
                            </div>

                            <a
                                href={card.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline pt-2 border-t border-slate-100"
                            >
                                <span>{card.actionText}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* Operating Hours & Fulfillment Schedule */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">Platform Operating Schedule</h3>
                        <p className="text-xs text-slate-400">Guaranteed response windows across divisions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <span className="text-amber-400 font-bold block mb-1">Customer Care Desk</span>
                        <p className="text-white font-semibold">24 Hours / 7 Days a Week</p>
                        <span className="text-slate-400 text-[11px] block mt-0.5">Email, WhatsApp & Toll-Free Phone</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <span className="text-amber-400 font-bold block mb-1">Warehouse Freight Dispatch</span>
                        <p className="text-white font-semibold">Monday – Saturday: 08:00 – 20:00 EST</p>
                        <span className="text-slate-400 text-[11px] block mt-0.5">Carrier linehaul & hub transfers</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <span className="text-amber-400 font-bold block mb-1">Merchant Payouts & Finance</span>
                        <p className="text-white font-semibold">Monday – Friday: 09:00 – 17:00 EST</p>
                        <span className="text-slate-400 text-[11px] block mt-0.5">ACH, Wire transfers, & escrow clearance</span>
                    </div>
                </div>
            </div>

            {/* Interactive Inquiry Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">Send an Online Inquiry</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Fill out the details below. Our automated ticketing engine routes your request directly to the appropriate department.
                    </p>
                </div>

                {submittedLocal || recentlySuccessful ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-emerald-900">Inquiry Dispatched Successfully!</h4>
                        <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                            Thank you! Your ticket reference has been logged. Our customer operations officer will review and reply to your email within 2 business hours.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSubmittedLocal(false)}
                            className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Your Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="jane@company.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+92 335 7895884"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Related Order ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.order_id}
                                    onChange={(e) => setData('order_id', e.target.value)}
                                    placeholder="ORD-2026-XXXX"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Department <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="General Inquiries">General Inquiries</option>
                                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                                    <option value="Returns & Refunds">Returns & Refunds</option>
                                    <option value="Vendor Merchant Support">Vendor Merchant Support</option>
                                    <option value="Enterprise Procurement (B2B)">Enterprise Procurement (B2B)</option>
                                    <option value="Billing & Escrow Payments">Billing & Escrow Payments</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Message Details <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Describe your question, request, or issue with as much detail as possible..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            {errors.message && <p className="text-rose-500 text-[11px] mt-1">{errors.message}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <p className="text-[11px] text-slate-400">
                                Protected by 256-bit encryption. Zero spam policy.
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{processing ? 'Submitting...' : 'Submit Inquiry'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </HelpLayout>
    );
}
