import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { 
    Landmark, 
    DollarSign, 
    TrendingUp, 
    Receipt, 
    ShieldCheck, 
    Store, 
    Printer, 
    Download, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Percent, 
    Truck, 
    FileText, 
    Check, 
    Copy, 
    Plus, 
    Trash2, 
    Settings, 
    AlertCircle, 
    Calendar,
    Wallet,
    Scale,
    X,
    Eye
} from 'lucide-react';

export default function FinanceIndex({
    metrics = {},
    ledger = [],
    total_ledger_count = 0,
    vendor_settlements = [],
    finance_settings = {},
    filters = {},
    recent_payouts = []
}) {
    const [activeTab, setActiveTab] = useState('ledger');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [ledgerType, setLedgerType] = useState(filters.type || 'all');
    const [copiedId, setCopiedId] = useState(null);

    // Settlement Payout Modal
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutForm, setPayoutForm] = useState({
        vendor_id: '',
        vendor_name: '',
        amount: '',
        payment_method: 'Bank Transfer (IBFT)',
        transaction_reference: '',
        notes: ''
    });
    const [submittingPayout, setSubmittingPayout] = useState(false);

    // Regional Shipping & Tax Form State
    const [settingsForm, setSettingsForm] = useState({
        default_tax_rate: finance_settings.default_tax_rate ?? 5.0,
        platform_commission_rate: finance_settings.platform_commission_rate ?? 10.0,
        currency: finance_settings.currency ?? 'PKR',
        auto_payout_threshold: finance_settings.auto_payout_threshold ?? 5000,
        shipping_rules: Array.isArray(finance_settings.shipping_rules) ? [...finance_settings.shipping_rules] : [
            { region: 'Sindh', base_fee: 250, free_shipping_threshold: 5000, estimated_days: '2-3 Business Days' },
            { region: 'Punjab', base_fee: 300, free_shipping_threshold: 5000, estimated_days: '3-4 Business Days' },
            { region: 'Islamabad & Rawalpindi', base_fee: 280, free_shipping_threshold: 5000, estimated_days: '2-3 Business Days' },
            { region: 'Khyber Pakhtunkhwa', base_fee: 350, free_shipping_threshold: 6000, estimated_days: '4-5 Business Days' },
            { region: 'Balochistan', base_fee: 450, free_shipping_threshold: 8000, estimated_days: '5-7 Business Days' },
            { region: 'Gilgit-Baltistan & AJK', base_fee: 450, free_shipping_threshold: 8000, estimated_days: '5-7 Business Days' },
        ]
    });
    const [savingSettings, setSavingSettings] = useState(false);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/finance', {
            search: searchQuery || undefined,
            type: ledgerType !== 'all' ? ledgerType : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleTypeChange = (type) => {
        setLedgerType(type);
        router.get('/admin/finance', {
            type: type !== 'all' ? type : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const copyToClipboard = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openPayoutModal = (vendor = null) => {
        if (vendor) {
            setPayoutForm({
                vendor_id: vendor.id,
                vendor_name: vendor.shop_name,
                amount: vendor.payable_balance > 0 ? vendor.payable_balance : '',
                payment_method: 'Bank Transfer (IBFT)',
                transaction_reference: '',
                notes: `Disbursement to ${vendor.shop_name}`
            });
        } else {
            setPayoutForm({
                vendor_id: vendor_settlements[0]?.id || '',
                vendor_name: vendor_settlements[0]?.shop_name || '',
                amount: '',
                payment_method: 'Bank Transfer (IBFT)',
                transaction_reference: '',
                notes: ''
            });
        }
        setIsPayoutModalOpen(true);
    };

    const handleSubmitPayout = (e) => {
        e.preventDefault();
        if (!payoutForm.vendor_id || !payoutForm.amount) return;
        setSubmittingPayout(true);
        router.post('/admin/finance/payouts', payoutForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPayoutModalOpen(false);
                setSubmittingPayout(false);
            },
            onError: () => setSubmittingPayout(false)
        });
    };

    const handleShippingRuleChange = (index, field, value) => {
        const updated = [...settingsForm.shipping_rules];
        updated[index] = { ...updated[index], [field]: value };
        setSettingsForm({ ...settingsForm, shipping_rules: updated });
    };

    const handleAddShippingRule = () => {
        setSettingsForm({
            ...settingsForm,
            shipping_rules: [
                ...settingsForm.shipping_rules,
                { region: 'New Region / Zone', base_fee: 300, free_shipping_threshold: 5000, estimated_days: '3-5 Business Days' }
            ]
        });
    };

    const handleRemoveShippingRule = (index) => {
        const updated = settingsForm.shipping_rules.filter((_, idx) => idx !== index);
        setSettingsForm({ ...settingsForm, shipping_rules: updated });
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSavingSettings(true);
        router.post('/admin/finance/settings', settingsForm, {
            preserveScroll: true,
            onSuccess: () => setSavingSettings(false),
            onError: () => setSavingSettings(false)
        });
    };

    const handlePrintStatement = () => {
        window.print();
    };

    // Helper for ledger type badges
    const renderLedgerTypeBadge = (type) => {
        switch (type) {
            case 'customer_payment':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        Customer Payment
                    </span>
                );
            case 'platform_commission':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Percent className="w-3 h-3 text-purple-600" />
                        Platform Fee
                    </span>
                );
            case 'vendor_split':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        <Scale className="w-3 h-3 text-sky-600" />
                        Vendor Split
                    </span>
                );
            case 'vendor_payout':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <ArrowUpRight className="w-3 h-3 text-amber-600" />
                        Payout Disbursed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Entry
                    </span>
                );
        }
    };

    return (
        <MainLayout>
            <Head title="Accounts & Financial Intelligence | Bizzhuss" />

            {/* Print Only Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, header, aside, .no-print {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                }
            `}} />

            <div className="no-print">
                <AdminHeader 
                    title="Accounts & Financial Intelligence"
                    subtitle="Real-time multi-vendor ledger, automated split order disbursements, tax escrow float, and dynamic regional tariffs."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={handlePrintStatement}
                                className="inline-flex items-center gap-1.5 text-xs shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Statement</span>
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => openPayoutModal()}
                                className="inline-flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 shadow-xs"
                            >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>Record Settlement</span>
                            </Button>
                        </div>
                    }
                />

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Platform GMV"
                        value={formatCurrency(metrics.total_gmv || 0)}
                        subtitle={`${metrics.total_orders || 0} customer orders cleared`}
                        icon={TrendingUp}
                        color="brand"
                    />
                    <StatCard
                        title="Platform Commission"
                        value={formatCurrency(metrics.total_platform_commission || 0)}
                        subtitle="Earned marketplace revenue"
                        icon={DollarSign}
                        color="purple"
                    />
                    <StatCard
                        title="Vendor Net Earnings"
                        value={formatCurrency(metrics.total_vendor_earnings || 0)}
                        subtitle="Total merchant allocated shares"
                        icon={Store}
                        color="sky"
                    />
                    <StatCard
                        title="Settled Disbursements"
                        value={formatCurrency(metrics.total_payouts_settled || 0)}
                        subtitle="Paid out via bank wire & Raast"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Escrow Float Liability"
                        value={formatCurrency(metrics.escrow_float || 0)}
                        subtitle="Pending merchant disbursements"
                        icon={Landmark}
                        color="amber"
                    />
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'ledger', label: 'General Ledger Audit', icon: Receipt },
                            { id: 'settlements', label: 'Vendor Split Settlements', icon: Store },
                            { id: 'settings', label: 'Tax & Shipping Matrix', icon: Truck },
                            { id: 'statement', label: 'Print-Ready Financial Statement', icon: FileText },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? 'bg-brand-500 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB 1: General Ledger Audit */}
                {activeTab === 'ledger' && (
                    <div className="space-y-6">
                        {/* Filter Bar */}
                        <Card>
                            <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
                                    {[
                                        { id: 'all', label: 'All Transactions' },
                                        { id: 'customer_payment', label: 'Customer Payments' },
                                        { id: 'platform_commission', label: 'Platform Fees' },
                                        { id: 'vendor_split', label: 'Vendor Splits' },
                                        { id: 'vendor_payout', label: 'Payout Disbursements' },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => handleTypeChange(t.id)}
                                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                                                ledgerType === t.id
                                                    ? 'bg-white text-slate-900 shadow-xs'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search ledger reference or entity..."
                                            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => { setSearchQuery(''); router.get('/admin/finance', { type: ledgerType !== 'all' ? ledgerType : undefined }); }}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Button type="submit" variant="secondary" size="sm">
                                        Filter
                                    </Button>
                                </form>
                            </div>
                        </Card>

                        {/* Ledger Table */}
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-5 py-3.5">Audit ID / Ref</th>
                                            <th className="px-4 py-3.5">Date & Time</th>
                                            <th className="px-4 py-3.5">Category</th>
                                            <th className="px-4 py-3.5">Counterparty</th>
                                            <th className="px-4 py-3.5 text-right">Inflow (Credit)</th>
                                            <th className="px-4 py-3.5 text-right">Outflow (Debit)</th>
                                            <th className="px-4 py-3.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {ledger.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                                                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                                    <p className="font-semibold text-slate-600">No ledger transactions found</p>
                                                    <p className="text-[11px] text-slate-400 mt-1">Transactions will populate automatically as orders and payouts process.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            ledger.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-5 py-3.5 font-mono text-[11px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-800">{entry.id}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(entry.id, entry.id)}
                                                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                                                title="Copy Audit ID"
                                                            >
                                                                {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-sans block">{entry.reference}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                                                        {entry.date}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        {renderLedgerTypeBadge(entry.type)}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="font-semibold text-slate-800 block truncate max-w-xs">{entry.entity_name}</span>
                                                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">{entry.description}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                        {entry.credit > 0 ? `+${formatCurrency(entry.credit)}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                                        {entry.debit > 0 ? `-${formatCurrency(entry.debit)}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            entry.status === 'cleared'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${entry.status === 'cleared' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                            {entry.status === 'cleared' ? 'Cleared' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB 2: Vendor Split Settlements */}
                {activeTab === 'settlements' && (
                    <div className="space-y-6">
                        <Card className="overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Merchant Split Ledger & Escrow Balances</h3>
                                    <p className="text-xs text-slate-500">Automated calculation of gross GMV, retained commission, disbursed payouts, and current liabilities.</p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openPayoutModal()}
                                    className="inline-flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 shrink-0 self-start sm:self-auto"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Settlement Disbursement</span>
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-5 py-3.5">Vendor Shop</th>
                                            <th className="px-4 py-3.5 text-center">Commission Rate</th>
                                            <th className="px-4 py-3.5 text-right">Gross GMV</th>
                                            <th className="px-4 py-3.5 text-right">Commission Retained</th>
                                            <th className="px-4 py-3.5 text-right">Net Share</th>
                                            <th className="px-4 py-3.5 text-right">Disbursed Payouts</th>
                                            <th className="px-4 py-3.5 text-right">Payable Balance</th>
                                            <th className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {vendor_settlements.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-5 py-10 text-center text-slate-400">
                                                    No merchant vendor stores registered yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            vendor_settlements.map((v) => (
                                                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                                {v.shop_name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-900 block">{v.shop_name}</span>
                                                                <span className="text-[10px] text-slate-400">{v.order_items_count} order line-items</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center font-bold text-purple-700">
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px]">
                                                            {v.commission_rate}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                                                        {formatCurrency(v.gross_sales)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-semibold text-purple-600">
                                                        {formatCurrency(v.commission_deducted)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-sky-700">
                                                        {formatCurrency(v.net_earnings)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                                                        {formatCurrency(v.total_settled)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right font-bold text-amber-600">
                                                        <span className={`px-2 py-1 rounded-lg ${v.payable_balance > 0 ? 'bg-amber-50 border border-amber-200 font-black' : 'text-slate-400'}`}>
                                                            {formatCurrency(v.payable_balance)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => openPayoutModal(v)}
                                                            className="inline-flex items-center gap-1 text-xs"
                                                        >
                                                            <Wallet className="w-3.5 h-3.5 text-brand-600" />
                                                            <span>Disburse</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB 3: Tax & Dynamic Regional Shipping Rules */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* Global Base Parameters */}
                        <Card>
                            <div className="p-5 border-b border-slate-100">
                                <h3 className="font-bold text-base text-slate-900">Global Financial Rates & Currency Configuration</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Define core baseline VAT/Sales tax percentages and platform marketplace commissions.</p>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Standard Sales Tax Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={settingsForm.default_tax_rate}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, default_tax_rate: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 block">Applied to standard taxable invoices.</span>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Platform Base Commission (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={settingsForm.platform_commission_rate}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, platform_commission_rate: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold text-purple-700"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 block">Default fee deducted on vendor order splits.</span>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Settlement Threshold (PKR)</label>
                                    <input
                                        type="number"
                                        step="100"
                                        min="0"
                                        value={settingsForm.auto_payout_threshold}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, auto_payout_threshold: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Minimum balance for merchant payout request.</span>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Platform Currency Code</label>
                                    <input
                                        type="text"
                                        value={settingsForm.currency}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-mono font-bold"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Standard ISO 4217 Currency (PKR / Rs.).</span>
                                </div>
                            </div>
                        </Card>

                        {/* Region-Based Shipping Matrix */}
                        <Card>
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Regional Delivery & Shipping Tariff Matrix</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Customize provincial freight costs, free-shipping thresholds, and fulfillment SLAs.</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddShippingRule}
                                    className="inline-flex items-center gap-1.5 text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Region Rule</span>
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-5 py-3">Province / Territory</th>
                                            <th className="px-4 py-3">Base Shipping (PKR)</th>
                                            <th className="px-4 py-3">Free Shipping Threshold (PKR)</th>
                                            <th className="px-4 py-3">Estimated SLA</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {settingsForm.shipping_rules.map((rule, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                <td className="px-5 py-2.5">
                                                    <input
                                                        type="text"
                                                        value={rule.region}
                                                        onChange={(e) => handleShippingRuleChange(idx, 'region', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        step="10"
                                                        value={rule.base_fee}
                                                        onChange={(e) => handleShippingRuleChange(idx, 'base_fee', parseFloat(e.target.value) || 0)}
                                                        className="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-brand-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        step="100"
                                                        value={rule.free_shipping_threshold}
                                                        onChange={(e) => handleShippingRuleChange(idx, 'free_shipping_threshold', parseFloat(e.target.value) || 0)}
                                                        className="w-40 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-brand-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="text"
                                                        value={rule.estimated_days}
                                                        onChange={(e) => handleShippingRuleChange(idx, 'estimated_days', e.target.value)}
                                                        className="w-48 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 outline-none focus:border-brand-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveShippingRule(idx)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete region rule"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={savingSettings}
                                    className="bg-brand-600 hover:bg-brand-700 text-xs shadow-xs"
                                >
                                    {savingSettings ? 'Saving Matrix...' : 'Save Financial & Shipping Configuration'}
                                </Button>
                            </div>
                        </Card>
                    </form>
                )}

                {/* TAB 4: Print-Ready Financial Statement Document Preview */}
                {activeTab === 'statement' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-brand-50/80 p-4 rounded-2xl border border-brand-100">
                            <div>
                                <h4 className="font-bold text-sm text-brand-900">Official Platform Financial Statement</h4>
                                <p className="text-xs text-brand-700 mt-0.5">High-resolution print-ready document formatted with audit balances, revenue recognition, and verification seal.</p>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handlePrintStatement}
                                className="inline-flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print / Export PDF</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINTABLE OFFICIAL FINANCIAL STATEMENT (Rendered on tab 4 or when print triggered) */}
            <div className={`${activeTab === 'statement' ? 'block' : 'hidden'} print:block bg-white border border-slate-200 print:border-none rounded-3xl p-8 sm:p-12 shadow-sm my-4 print:my-0 print:p-0 max-w-4xl mx-auto text-slate-900`}>
                {/* Header & Letterhead */}
                <div className="flex items-start justify-between pb-8 border-b-2 border-slate-900">
                    <div>
                        <div className="flex items-center gap-3">
                            <ApplicationLogo asLink={false} className="w-10 h-10 rounded-xl" />
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Bizzhuss Platform</h1>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Multi-Vendor E-Commerce Treasury & General Ledger</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 max-w-md leading-relaxed">
                            Official financial ledger summary, vendor split settlement audit, and fiscal treasury statement generated under enterprise multi-vendor governance.
                        </p>
                    </div>

                    <div className="text-right text-xs">
                        <div className="inline-block px-3 py-1 bg-slate-100 font-mono font-bold text-slate-800 rounded-lg mb-2">
                            AUDIT STATEMENT
                        </div>
                        <p className="font-mono text-slate-600">STMT-{new Date().getFullYear()}-{(new Date().getMonth()+1).toString().padStart(2, '0')}-9841</p>
                        <p className="text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-slate-500">Currency: PKR (Rs.)</p>
                    </div>
                </div>

                {/* Financial Summary Executive Breakdown */}
                <div className="my-8">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 mb-4 pb-1 border-b border-slate-200">
                        1. Executive Treasury Summary
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gross Merchandise Value</span>
                            <span className="text-base font-black text-slate-900">{formatCurrency(metrics.total_gmv || 0)}</span>
                        </div>
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                            <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Platform Commission Retained</span>
                            <span className="text-base font-black text-purple-700">{formatCurrency(metrics.total_platform_commission || 0)}</span>
                        </div>
                        <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                            <span className="text-[10px] font-bold text-sky-600 uppercase block mb-1">Vendor Net Earnings</span>
                            <span className="text-base font-black text-sky-800">{formatCurrency(metrics.total_vendor_earnings || 0)}</span>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Outstanding Escrow Float</span>
                            <span className="text-base font-black text-amber-700">{formatCurrency(metrics.escrow_float || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Vendor Settlement Allocation Matrix */}
                <div className="my-8">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 mb-4 pb-1 border-b border-slate-200">
                        2. Certified Merchant Split Allocation
                    </h3>
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                <th className="p-2.5">Merchant Shop</th>
                                <th className="p-2.5 text-center">Comm. Rate</th>
                                <th className="p-2.5 text-right">Gross GMV</th>
                                <th className="p-2.5 text-right">Commission Fee</th>
                                <th className="p-2.5 text-right">Net Share</th>
                                <th className="p-2.5 text-right">Settled Payouts</th>
                                <th className="p-2.5 text-right">Payable Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vendor_settlements.map((v) => (
                                <tr key={v.id}>
                                    <td className="p-2.5 font-bold text-slate-900">{v.shop_name}</td>
                                    <td className="p-2.5 text-center">{v.commission_rate}%</td>
                                    <td className="p-2.5 text-right font-medium">{formatCurrency(v.gross_sales)}</td>
                                    <td className="p-2.5 text-right font-semibold text-purple-700">{formatCurrency(v.commission_deducted)}</td>
                                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(v.net_earnings)}</td>
                                    <td className="p-2.5 text-right text-emerald-700">{formatCurrency(v.total_settled)}</td>
                                    <td className="p-2.5 text-right font-black text-amber-800">{formatCurrency(v.payable_balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Audit Sign-off Box */}
                <div className="mt-12 pt-8 border-t-2 border-slate-200 flex items-end justify-between text-xs">
                    <div className="flex flex-col items-start justify-end">
                        <div className="h-14 w-full"></div>
                        <div className="w-48 h-[1.5px] bg-slate-400 mb-2"></div>
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">
                            Platform Financial Comptroller
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                            Bizzhuss Treasury Division
                        </div>
                    </div>

                    <div className="text-center p-3 border-2 border-dashed border-slate-300 rounded-2xl w-48 mb-1">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                        <span className="text-[10px] font-black uppercase text-emerald-700 block">Verified Audit Seal</span>
                        <span className="text-[9px] text-slate-400 block font-mono">HASH: 9F84B-2026-BZ</span>
                    </div>

                    <div className="flex flex-col items-end justify-end text-right">
                        {/* Empty blank signing space for physical pen signature */}
                        <div className="h-14 w-full"></div>

                        {/* Physical Signature Line */}
                        <div className="w-60 h-[1.5px] bg-slate-400 mb-2"></div>

                        {/* Designation Details */}
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">
                            Official CEO Signature
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                            Chief Executive Officer & Founder
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout Settlement Modal */}
            {isPayoutModalOpen && (
                <Modal
                    isOpen={isPayoutModalOpen}
                    onClose={() => setIsPayoutModalOpen(false)}
                    title="Record Vendor Settlement Disbursement"
                    description="Execute a split payment transfer from platform escrow to an authorized vendor merchant."
                    maxWidth="max-w-md"
                >
                    <form onSubmit={handleSubmitPayout} className="space-y-4 text-xs">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Select Merchant Store</label>
                            <select
                                value={payoutForm.vendor_id}
                                onChange={(e) => {
                                    const v = vendor_settlements.find(item => item.id === e.target.value);
                                    setPayoutForm({
                                        ...payoutForm,
                                        vendor_id: e.target.value,
                                        vendor_name: v ? v.shop_name : '',
                                        amount: v?.payable_balance > 0 ? v.payable_balance : payoutForm.amount
                                    });
                                }}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-semibold"
                                required
                            >
                                <option value="">Select a vendor...</option>
                                {vendor_settlements.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.shop_name} (Payable: {formatCurrency(v.payable_balance)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Disbursement Amount (PKR)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={payoutForm.amount}
                                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                                placeholder="Enter settlement amount in PKR"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bold text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Disbursement Rail / Payment Method</label>
                            <select
                                value={payoutForm.payment_method}
                                onChange={(e) => setPayoutForm({ ...payoutForm, payment_method: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                                required
                            >
                                <option value="Bank Transfer (IBFT)">Bank Transfer (IBFT / 1Link)</option>
                                <option value="Raast Instant Payment">Raast Instant Payment (State Bank of Pakistan)</option>
                                <option value="JazzCash Merchant Wallet">JazzCash Merchant Wallet</option>
                                <option value="EasyPaisa Business">EasyPaisa Business Wallet</option>
                                <option value="Direct Escrow Clearing">Direct Escrow Clearing</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Bank Reference / Transaction ID</label>
                            <input
                                type="text"
                                value={payoutForm.transaction_reference}
                                onChange={(e) => setPayoutForm({ ...payoutForm, transaction_reference: e.target.value })}
                                placeholder="e.g. FT2629849202 (optional, auto-generated if blank)"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Settlement Memo / Notes</label>
                            <input
                                type="text"
                                value={payoutForm.notes}
                                onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                                placeholder="e.g. Bi-weekly multi-vendor cycle disbursement"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsPayoutModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={submittingPayout}
                                className="bg-brand-600 hover:bg-brand-700"
                            >
                                {submittingPayout ? 'Processing...' : 'Confirm & Disburse Funds'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </MainLayout>
    );
}
