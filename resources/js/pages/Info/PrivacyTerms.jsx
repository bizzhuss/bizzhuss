import React, { useState } from 'react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    FileText,
    Shield,
    Cookie,
    CheckCircle2,
    Calendar,
    Printer,
    Download,
    Lock
} from 'lucide-react';

export default function PrivacyTerms({ initialTab = 'terms' }) {
    const [activeTab, setActiveTab] = useState(initialTab || 'terms');

    const handlePrint = () => {
        window.print();
    };

    return (
        <HelpLayout
            title="Terms of Service & Privacy Policy"
            subtitle="Legal frameworks governing user accounts, merchant marketplace terms, data privacy, and cookie policies."
            categoryName="Platform Operations"
            currentKey="terms"
            breadcrumbs={[{ label: 'Privacy & Terms' }]}
        >
            {/* Top Bar with Tabs and Print */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('terms')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                            activeTab === 'terms'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Terms of Service</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('privacy')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                            activeTab === 'privacy'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Privacy Policy</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('cookies')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                            activeTab === 'cookies'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Cookie className="w-3.5 h-3.5" />
                        <span>Cookie Policy</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated Sep 2026</span>
                    </span>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            {/* Document Content Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm space-y-6 text-slate-700 text-xs md:text-sm leading-relaxed">
                {activeTab === 'terms' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">Legal Agreement</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Bizzhuss Marketplace Terms of Service</h2>
                            <p className="text-xs text-slate-500 mt-1">Effective Date: September 1, 2026</p>
                        </div>

                        <section className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">1. Acceptance of Terms & Platform Role</h3>
                            <p>
                                By accessing or utilizing the Bizzhuss multi-vendor marketplace, web applications, or customer/vendor portals (collectively, the "Platform"), you agree to be bound by these Terms of Service. Bizzhuss acts as an intermediary platform facilitating commercial transactions between independent third-party vendors ("Sellers") and buyers ("Customers").
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">2. User & Merchant Account Responsibilities</h3>
                            <p>
                                All users must provide authentic, verifiable registration information. Vendors warrant that they hold valid national tax identification (NTN/GST), authorized manufacturer licenses, and legitimate ownership of all uploaded product catalogs. Sharing access credentials with unauthorized third parties is strictly prohibited.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">3. Order Routing, Split Contracts & Escrow Protection</h3>
                            <p>
                                When an order contains items from multiple merchants, the Platform decomposes the transaction into discrete purchase agreements between the buyer and each respective seller. Payments made by the buyer are secured in the Bizzhuss Escrow Ledger and disbursed to the merchant only after delivery confirmation and expiration of the mandatory 7-day inspection window.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">4. Returns, Cancellations & Dispute Resolution</h3>
                            <p>
                                Customers may cancel orders prior to warehouse dispatch. If goods delivered are damaged, counterfeit, or materially discrepant from listings, customers are entitled to a full refund under our 7-Day Buyer Protection Guarantee. Bizzhuss reserves the right to arbitrate disputes and issue binding refund verdicts.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">5. Limitation of Liability</h3>
                            <p>
                                Bizzhuss is not liable for indirect, incidental, or consequential damages resulting from third-party merchant manufacturing defects, carrier transit delays caused by force majeure, or unauthorized cyber intrusions beyond standard commercial security protocols.
                            </p>
                        </section>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">Privacy & Data Governance</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Bizzhuss Global Privacy Policy</h2>
                            <p className="text-xs text-slate-500 mt-1">Compliance: GDPR, CCPA, and National Cyber Regulations</p>
                        </div>

                        <section className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">1. Information We Collect</h3>
                            <p>
                                We collect information necessary to process orders and ensure marketplace integrity, including:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li>Identity Data: Name, email address, phone number, and physical shipping address.</li>
                                <li>Merchant Verification Data: National Tax ID (NTN/GST), company registration certificates, bank routing information.</li>
                                <li>Telemetry & Device Data: IP address, browser type, device identifiers, and session timestamps.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">2. How We Utilize Customer & Merchant Data</h3>
                            <p>
                                Your data is utilized exclusively for order routing, carrier logistics dispatch, fraud prevention, escrow ledger reconciliation, and platform security auditing. We never sell or lease customer contact lists to external advertisers or data brokers.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">3. Data Security & Encryption Standards</h3>
                            <p>
                                All sensitive data in transit is encrypted using 256-bit TLS (Transport Layer Security). Merchant bank credentials and customer payment tokens are secured in isolated PCI-DSS compliant vaults with AES-256 field-level database encryption.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">4. Your Data Rights & Deletion</h3>
                            <p>
                                You retain the right to request a copy of all personal records stored by Bizzhuss, or request account anonymization and data deletion by contacting <span className="font-bold text-amber-600">privacy@bizzhuss.com</span>.
                            </p>
                        </section>
                    </div>
                )}

                {activeTab === 'cookies' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">Telemetry & Cookies</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Cookie & Local Storage Policy</h2>
                            <p className="text-xs text-slate-500 mt-1">Transparency on tracking and browser storage technologies</p>
                        </div>

                        <section className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">1. What Are Cookies & Local Storage</h3>
                            <p>
                                Cookies and HTML5 LocalStorage are small data files placed on your browser when visiting websites. They enable the platform to remember your cart items, keep you authenticated across page refreshes, and store your preferred UI settings.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">2. Cookie Categories We Deploy</h3>
                            <div className="space-y-2">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                    <strong className="text-slate-900 block font-bold text-xs">Essential & Session Cookies (Strictly Necessary)</strong>
                                    <span className="text-[11px] text-slate-500">Enables CSRF protection tokens, user session authentication, and shopping cart persistence. Cannot be disabled.</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                    <strong className="text-slate-900 block font-bold text-xs">Affiliate & Referral Cookies (45-Day Duration)</strong>
                                    <span className="text-[11px] text-slate-500">Records referral tracking codes to credit partner commissions upon verified order delivery.</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                    <strong className="text-slate-900 block font-bold text-xs">Performance & Analytics Telemetry</strong>
                                    <span className="text-[11px] text-slate-500">Aggregated, anonymized performance metrics regarding catalog response times and checkout load latencies.</span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </HelpLayout>
    );
}
