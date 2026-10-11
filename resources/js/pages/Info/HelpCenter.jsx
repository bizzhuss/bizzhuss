import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Search,
    ChevronDown,
    Package,
    Truck,
    RotateCcw,
    CreditCard,
    ShieldCheck,
    Store,
    HelpCircle,
    ArrowRight,
    Headphones,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';

const TOPIC_CATEGORIES = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'orders', name: 'Orders & Tracking', icon: Package },
    { id: 'shipping', name: 'Shipping & Freight', icon: Truck },
    { id: 'refunds', name: 'Returns & Refunds', icon: RotateCcw },
    { id: 'payments', name: 'Payments & Escrow', icon: CreditCard },
    { id: 'vendors', name: 'Vendor & Marketplace', icon: Store },
    { id: 'security', name: 'Account & Security', icon: ShieldCheck },
];

const FAQS = [
    {
        id: 1,
        category: 'orders',
        question: 'How does multi-vendor checkout work when I buy from different sellers?',
        answer: 'When you place an order containing items from multiple verified sellers, Bizzhuss automatically creates separate sub-orders for each merchant. Each merchant packs and ships their items directly from their warehouse. You receive individual tracking numbers for each package, but pay a single consolidated invoice at checkout.'
    },
    {
        id: 2,
        category: 'orders',
        question: 'Can I cancel an order after placing it?',
        answer: 'You can cancel an order within 1 hour of placement directly from your Customer Dashboard, as long as the seller has not yet printed shipping labels or dispatched the parcel. If the order has already been dispatched, you can initiate a hassle-free return once it arrives.'
    },
    {
        id: 3,
        category: 'shipping',
        question: 'How long does nationwide freight dispatch take?',
        answer: 'Standard dispatch typically takes 24 to 48 hours from the time the vendor confirms the order. Standard domestic delivery arrives within 3 to 5 business days. Express logistics delivery is available for eligible industrial hardware and consumer electronics in select metro hubs.'
    },
    {
        id: 4,
        category: 'shipping',
        question: 'How do I track my delivery in real time?',
        answer: 'Navigate to our Track Order page (/track-order) and enter your Order ID along with your registered email or phone number. You will see a live timeline tracking every stage: order confirmation, merchant dispatch, regional hub sorting, and out-for-delivery courier status.'
    },
    {
        id: 5,
        category: 'refunds',
        question: 'What is Bizzhuss’s 7-day buyer protection policy?',
        answer: 'Every customer purchase is protected under our 7-Day Buyer Protection Guarantee. If an item arrives damaged, defective, materially different from its product description, or fails to arrive, you can request a full refund or free replacement within 7 calendar days of delivery.'
    },
    {
        id: 6,
        category: 'refunds',
        question: 'When will I receive my refund?',
        answer: 'Refunds credited to your Bizzhuss Customer Wallet or Store Credit are processed immediately upon seller inspection approval. If you choose a refund to your original Credit/Debit card, your banking institution will reflect the credited amount within 3 to 5 business days.'
    },
    {
        id: 7,
        category: 'payments',
        question: 'Which payment options are supported?',
        answer: 'We support all major payment methods: Visa, MasterCard, Cash on Delivery (COD) for eligible items, direct Bank Wire / ACH transfer for corporate purchases, and Bizzhuss Wallet balance. All digital card payments are processed via PCI-DSS Level 1 compliant gateways.'
    },
    {
        id: 8,
        category: 'payments',
        question: 'How does payment escrow protect my purchase?',
        answer: 'When you pay online, your funds are safely held in the Bizzhuss Escrow Ledger. The merchant is not disbursed payout funds until the carrier marks your parcel as delivered and your 7-day inspection window has elapsed without dispute.'
    },
    {
        id: 9,
        category: 'vendors',
        question: 'How do I start selling my products on Bizzhuss?',
        answer: 'You can sign up in under 5 minutes by visiting /business/become-seller or registering with a Vendor account. We offer 0% platform commission for your first 60 days, automated sub-order fulfillment tools, and direct bi-weekly payout settlements.'
    },
    {
        id: 10,
        category: 'security',
        question: 'How does Bizzhuss verify merchants and protect against counterfeits?',
        answer: 'All sellers must pass strict verification, submitting verified national tax registration (NTN/GST), company bank statements, and product authenticity documentation. In addition, our automated compliance engine screens listings for trademark compliance.'
    },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFaq, setOpenFaq] = useState(1);

    const filteredFaqs = useMemo(() => {
        return FAQS.filter(faq => {
            const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
            const matchesSearch = searchQuery.trim() === '' ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const toggleFaq = (id) => {
        setOpenFaq(prev => prev === id ? null : id);
    };

    return (
        <HelpLayout
            title="Help Center & Customer Knowledge Base"
            subtitle="Search our curated guides, shipping FAQs, buyer guarantees, and vendor operation procedures."
            categoryName="Customer Care"
            currentKey="help"
            breadcrumbs={[{ label: 'Help Center & FAQ' }]}
        >
            {/* Search Bar Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <label htmlFor="faq-search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    How can we help you today?
                </label>
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        id="faq-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search answers e.g. multi-vendor shipping, return timeline, escrow payment, warranty..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Popular Search Tags */}
                <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Quick Searches:</span>
                    {['Track Order', '7-Day Return', 'Payment Escrow', 'Vendor Commission', 'Sub-orders'].map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 transition-colors text-[11px] font-medium"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Access Topic Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TOPIC_CATEGORIES.filter(c => c.id !== 'all').map((topic) => {
                    const Icon = topic.icon;
                    const isActive = selectedCategory === topic.id;
                    return (
                        <button
                            key={topic.id}
                            type="button"
                            onClick={() => {
                                setSelectedCategory(topic.id);
                                setSearchQuery('');
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                isActive
                                    ? 'bg-amber-500/10 border-amber-400 shadow-sm ring-1 ring-amber-400'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                                isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'
                            }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{topic.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                {FAQS.filter(f => f.category === topic.id).length} articles available
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                {TOPIC_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === cat.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Accordion FAQ List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                <div className="p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article' : 'articles'}
                        </p>
                    </div>
                    {selectedCategory !== 'all' && (
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className="text-xs text-amber-600 hover:underline font-semibold"
                        >
                            Show all FAQs
                        </button>
                    )}
                </div>

                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                        const isOpen = openFaq === faq.id;
                        return (
                            <div key={faq.id} className="transition-colors">
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <span className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180 text-amber-600' : ''
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed bg-amber-500/5">
                                        <p>{faq.answer}</p>
                                        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Verified Bizzhuss Policy
                                            </span>
                                            <span>•</span>
                                            <span>Updated September 2026</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center">
                        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-700 text-sm">No matching answers found</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Try rephrasing your search keywords or reach out directly to our live support team.
                        </p>
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="mt-3 text-xs font-semibold text-amber-600 hover:underline"
                        >
                            Reset search filter
                        </button>
                    </div>
                )}
            </div>

            {/* Direct Support Contact Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                        <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base">Still couldn't find what you need?</h3>
                        <p className="text-xs text-slate-900/80 mt-0.5">
                            Our dedicated customer support agents are ready to assist with orders, disputes, and account inquiries.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <Link
                        href="/contact"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors text-center inline-flex items-center justify-center gap-2"
                    >
                        <span>Contact Support</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </HelpLayout>
    );
}
