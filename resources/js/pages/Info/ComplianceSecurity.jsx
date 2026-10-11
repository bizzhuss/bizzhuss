import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    ShieldCheck,
    Lock,
    Key,
    Server,
    FileCheck,
    AlertCircle,
    CheckCircle2,
    Building2,
    Eye,
    Mail,
    ArrowRight
} from 'lucide-react';

const SECURITY_PILLARS = [
    {
        title: 'PCI-DSS Level 1 Payment Vaults',
        desc: 'All credit and debit card transactions are tokenized through Level 1 PCI-DSS certified gateway vaults. Raw CVV/card numbers never touch our core web application servers.',
        icon: Lock,
        tag: 'Payment Security',
    },
    {
        title: '256-Bit TLS & At-Rest Encryption',
        desc: 'End-to-end data transmission is protected by TLS 1.3 encryption with Perfect Forward Secrecy. Database snapshots and user tables are encrypted at rest using AES-256.',
        icon: Key,
        tag: 'Data Encryption',
    },
    {
        title: 'Rigorous Merchant AML & KYC Vetting',
        desc: 'Before any seller is activated to receive customer orders, our compliance team validates verified National Tax registration (NTN/GST), company bank checks, and director identification.',
        icon: FileCheck,
        tag: 'Merchant Verification',
    },
    {
        title: 'Anti-Counterfeit Trademark Screening',
        desc: 'Our machine learning inspection engine screens catalog listings against trademark brand databases, instantly flagging unauthorized brand claims and intellectual property violations.',
        icon: Eye,
        tag: 'Brand Protection',
    },
    {
        title: 'Immutable Escrow Ledger Audit Trail',
        desc: 'Customer funds remain locked in escrow until post-delivery buyer inspection. Payout reconciliations are cross-checked by automated ledger reconciliation jobs.',
        icon: ShieldCheck,
        tag: 'Financial Protection',
    },
    {
        title: 'Hardened Multi-Tenant Isolation',
        desc: 'Strict role-based access control (RBAC) and database tenant scoping ensure that merchant catalog data, order margins, and customer data remain strictly separated.',
        icon: Server,
        tag: 'Infrastructure',
    },
];

export default function ComplianceSecurity() {
    return (
        <HelpLayout
            title="Compliance, Trust & Platform Security"
            subtitle="How Bizzhuss protects customer funds, enforces merchant authenticity, and safeguards enterprise data integrity."
            categoryName="Platform Operations"
            currentKey="security"
            breadcrumbs={[{ label: 'Compliance & Security' }]}
        >
            {/* Hero Trust Badge Card */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certified Enterprise Marketplace Security</span>
                    </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">
                    Bank-Grade Security for Every Transaction.
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    We maintain stringent security, compliance, and regulatory governance to ensure that buyers, sellers, and enterprise procurement officers transact with total confidence.
                </p>
            </div>

            {/* 6 Security Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECURITY_PILLARS.map((pillar, idx) => {
                    const Icon = pillar.icon;
                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                    {pillar.tag}
                                </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">{pillar.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Merchant KYC Verification Process */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-xl mb-6">
                    <h3 className="text-base font-bold text-slate-900">4-Stage Merchant Onboarding Verification</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Sellers cannot publish products or accept orders until they pass every compliance stage.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-mono text-xs font-bold text-amber-600">STAGE 01</span>
                        <strong className="text-slate-900 block font-bold">Tax Verification</strong>
                        <p className="text-slate-600 text-[11px]">Validation of active tax status with national revenue authorities.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-mono text-xs font-bold text-amber-600">STAGE 02</span>
                        <strong className="text-slate-900 block font-bold">Corporate Banking</strong>
                        <p className="text-slate-600 text-[11px]">Penny-drop test and account verification matching the tax entity name.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-mono text-xs font-bold text-amber-600">STAGE 03</span>
                        <strong className="text-slate-900 block font-bold">Facility & Stock Audit</strong>
                        <p className="text-slate-600 text-[11px]">Proof of commercial warehouse existence and supply chain distribution authorization.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-mono text-xs font-bold text-amber-600">STAGE 04</span>
                        <strong className="text-slate-900 block font-bold">Continuous Monitoring</strong>
                        <p className="text-slate-600 text-[11px]">Real-time return rate tracking, review auditing, and automatic suspension triggers.</p>
                    </div>
                </div>
            </div>

            {/* Responsible Disclosure & Bug Bounty */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">Security Researchers & Bug Bounty Program</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Report security vulnerabilities responsibly to our designated team at <span className="text-amber-400 font-mono">security@bizzhuss.com</span>.
                        </p>
                    </div>
                </div>
                <a
                    href="mailto:security@bizzhuss.com"
                    className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
                >
                    <span>Report Vulnerability</span>
                    <Mail className="w-3.5 h-3.5" />
                </a>
            </div>
        </HelpLayout>
    );
}
