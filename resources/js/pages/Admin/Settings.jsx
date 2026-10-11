import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    Settings, 
    ToggleLeft, 
    ToggleRight, 
    DollarSign, 
    Layers, 
    CreditCard, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Plus, 
    Edit, 
    Trash2, 
    X, 
    Save, 
    ExternalLink, 
    Tag, 
    FolderPlus, 
    HelpCircle,
    Paperclip,
    Percent,
    Shield
} from 'lucide-react';

export default function PlatformSettings({ 
    settings = {}, 
    categories = [], 
    rootCategories = [], 
    payouts = [], 
    payoutMetrics = {} 
}) {
    const [activeSection, setActiveSection] = useState('general'); // 'general', 'categories', 'payouts'

    // General Settings Form
    const [generalForm, setGeneralForm] = useState({
        maintenance_mode: settings.maintenance_mode || false,
        platform_currency: settings.platform_currency || 'PKR',
        default_commission_rate: settings.default_commission_rate || 10,
        platform_name: settings.platform_name || 'Bizzhuss Multi-Vendor Marketplace',
        support_email: settings.support_email || 'support@bizzhuss.com',
        support_phone: settings.support_phone || '+1 (800) 555-BIZZ',
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        icon: 'Package',
        banner: '',
        commission_rate: '',
        parent_id: '',
    });
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Payout Approval / Rejection Modal State
    const [payoutToApprove, setPayoutToApprove] = useState(null);
    const [approveForm, setApproveForm] = useState({
        transaction_reference: '',
        receipt_url: '',
        notes: '',
    });

    const [payoutToReject, setPayoutToReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Handlers
    const handleSaveGeneralSettings = (e) => {
        e.preventDefault();
        setSavingSettings(true);
        router.post('/admin/settings/general', generalForm, {
            onSuccess: () => setSavingSettings(false),
            onError: () => setSavingSettings(false),
        });
    };

    const handleOpenCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryForm({
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon || 'Package',
                banner: cat.banner || '',
                commission_rate: cat.commission_rate || '',
                parent_id: cat.parent_id || '',
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                name: '',
                slug: '',
                icon: 'Package',
                banner: '',
                commission_rate: '',
                parent_id: '',
            });
        }
        setIsCategoryModalOpen(true);
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            router.put(`/admin/settings/categories/${editingCategory.id}`, categoryForm, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                },
            });
        } else {
            router.post('/admin/settings/categories', categoryForm, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                },
            });
        }
    };

    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        router.delete(`/admin/settings/categories/${categoryToDelete.id}`, {
            onSuccess: () => setCategoryToDelete(null),
        });
    };

    const handleApprovePayout = (e) => {
        e.preventDefault();
        if (!payoutToApprove) return;

        router.post(`/admin/settings/payouts/${payoutToApprove.id}/approve`, approveForm, {
            onSuccess: () => {
                setPayoutToApprove(null);
                setApproveForm({ transaction_reference: '', receipt_url: '', notes: '' });
            },
        });
    };

    const handleRejectPayout = (e) => {
        e.preventDefault();
        if (!payoutToReject) return;

        router.post(`/admin/settings/payouts/${payoutToReject.id}/reject`, {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setPayoutToReject(null);
                setRejectReason('');
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Global Platform Controls & Settings - Admin Suite | Bizzhuss" />

            <AdminHeader 
                title="Global Marketplace Controls & Governance"
                subtitle="Configure enterprise parameters, maintain catalog taxons, and audit vendor payout liquidity requests."
            />

            {/* Section Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-xl mb-8 text-xs font-bold">
                <button
                    onClick={() => setActiveSection('general')}
                    className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSection === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Marketplace Controls</span>
                </button>
                <button
                    onClick={() => setActiveSection('categories')}
                    className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSection === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Category Hierarchy</span>
                </button>
                <button
                    onClick={() => setActiveSection('payouts')}
                    className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSection === 'payouts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payout Requests</span>
                    {payoutMetrics.pending_payouts > 0 && (
                        <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                            {payoutMetrics.pending_payouts}
                        </span>
                    )}
                </button>
            </div>

            {/* 1. GENERAL MARKETPLACE CONTROLS */}
            {activeSection === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <Card>
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-900">
                                    Global Platform Parameters & Policy Switches
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSaveGeneralSettings} className="space-y-6 text-xs">
                                    {/* Maintenance Mode Switch */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                        <div>
                                            <span className="font-bold text-slate-900 text-sm block">
                                                Global Maintenance Mode
                                            </span>
                                            <p className="text-slate-500 text-[11px] mt-0.5">
                                                When active, customers will see an operational maintenance banner during storefront browsing.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setGeneralForm({
                                                ...generalForm,
                                                maintenance_mode: !generalForm.maintenance_mode
                                            })}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                                generalForm.maintenance_mode 
                                                    ? 'bg-rose-500 text-white' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}
                                        >
                                            {generalForm.maintenance_mode ? (
                                                <>
                                                    <ToggleRight className="w-4 h-4" />
                                                    <span>Active (Locked)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="w-4 h-4" />
                                                    <span>Live (Online)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Platform Currency & Default Commission */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Default Platform Currency
                                            </label>
                                            <select
                                                value={generalForm.platform_currency}
                                                onChange={(e) => setGeneralForm({ ...generalForm, platform_currency: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold outline-none cursor-pointer"
                                            >
                                                <option value="PKR">PKR (Rs.) - Pakistani Rupee (Default)</option>
                                                <option value="USD">USD ($) - United States Dollar</option>
                                                <option value="EUR">EUR (€) - Eurozone</option>
                                                <option value="GBP">GBP (£) - British Pound</option>
                                                <option value="CAD">CAD ($) - Canadian Dollar</option>
                                                <option value="AUD">AUD ($) - Australian Dollar</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Default Platform Commission Fee (%)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={generalForm.default_commission_rate}
                                                    onChange={(e) => setGeneralForm({ ...generalForm, default_commission_rate: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold outline-none"
                                                />
                                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                                    %
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                Applies to newly registered vendors without custom overrides.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Platform Brand Name */}
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Platform Brand Identity Title
                                        </label>
                                        <input
                                            type="text"
                                            value={generalForm.platform_name}
                                            onChange={(e) => setGeneralForm({ ...generalForm, platform_name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-none"
                                        />
                                    </div>

                                    {/* Support Email & Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Governance & Support Email
                                            </label>
                                            <input
                                                type="email"
                                                value={generalForm.support_email}
                                                onChange={(e) => setGeneralForm({ ...generalForm, support_email: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Operational Dispatch Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={generalForm.support_phone}
                                                onChange={(e) => setGeneralForm({ ...generalForm, support_phone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                                        <Button type="submit" variant="primary" icon={Save} disabled={savingSettings}>
                                            {savingSettings ? 'Saving...' : 'Apply Global Configuration'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operational Governance Sidebar */}
                    <div className="lg:col-span-4 space-y-5">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-brand-600" />
                                    <span>Gatekeeper Engine Status</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="font-bold text-slate-800 block">Vendor Verification Enforcer</span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Non-active vendors are blocked from storefront publishing and order checkout.
                                    </p>
                                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Enforced & Active
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="font-bold text-slate-800 block">Automated Sub-Order Splitter</span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Customer checkouts automatically split ledger earnings per vendor commission schedule.
                                    </p>
                                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Operational
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* 2. CATEGORY MANAGEMENT */}
            {activeSection === 'categories' && (
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                E-Commerce Category & Department Hierarchy
                            </h3>
                            <p className="text-xs text-slate-500">
                                Configure root departments and subcategories with custom commission brackets.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            icon={FolderPlus}
                            onClick={() => handleOpenCategoryModal()}
                        >
                            Add Category
                        </Button>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                        <th className="px-5 py-3.5">Category Name</th>
                                        <th className="px-4 py-3.5">Hierarchy Tier</th>
                                        <th className="px-4 py-3.5">Banner Image</th>
                                        <th className="px-4 py-3.5 text-center">Products</th>
                                        <th className="px-4 py-3.5 text-center">Custom Fee</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/80">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">{cat.name}</span>
                                                        <span className="text-[11px] text-slate-400 font-mono">{cat.slug}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {cat.parent ? (
                                                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                        Subcategory of: <strong>{cat.parent.name}</strong>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                                        Root Department
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {cat.banner ? (
                                                    <div className="w-16 h-8 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                                        <img src={cat.banner} alt={cat.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">No Banner</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center font-bold text-slate-800">
                                                {cat.products_count || 0}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {cat.commission_rate ? (
                                                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                                        {cat.commission_rate}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">Standard (10%)</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenCategoryModal(cat)}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 border border-slate-200"
                                                        title="Edit Category"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCategoryToDelete(cat)}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* 3. VENDOR PAYOUT REQUESTS QUEUE */}
            {activeSection === 'payouts' && (
                <div>
                    {/* Payout Metric Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Payout Requests"
                            value={payoutMetrics.total_payouts || 0}
                            icon={CreditCard}
                            color="brand"
                        />
                        <StatCard
                            title="Pending Approvals"
                            value={payoutMetrics.pending_payouts || 0}
                            subtitle="Awaiting administrative review"
                            icon={AlertTriangle}
                            color={payoutMetrics.pending_payouts > 0 ? 'amber' : 'slate'}
                        />
                        <StatCard
                            title="Pending Volume"
                            value={formatCurrency(payoutMetrics.pending_amount || 0)}
                            subtitle="Total requested balance"
                            icon={DollarSign}
                            color="amber"
                        />
                        <StatCard
                            title="Settled & Disbursed"
                            value={formatCurrency(payoutMetrics.approved_amount || 0)}
                            subtitle="Approved wire/ACH settlements"
                            icon={CheckCircle2}
                            color="emerald"
                        />
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                        <th className="px-5 py-3.5">Vendor Merchant</th>
                                        <th className="px-4 py-3.5">Requested Amount</th>
                                        <th className="px-4 py-3.5">Payment Method</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Reference / Receipt</th>
                                        <th className="px-4 py-3.5">Date Submitted</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {payouts.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                                                No withdrawal disbursement requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        payouts.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-slate-50/80">
                                                <td className="px-5 py-4 font-bold text-slate-900">
                                                    {payout.vendor?.shop_name || 'Merchant'}
                                                </td>

                                                <td className="px-4 py-4 font-bold text-emerald-700 text-sm">
                                                    {formatCurrency(payout.amount)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="capitalize font-semibold text-slate-700">
                                                        {payout.payment_method.replace('_', ' ')}
                                                    </span>
                                                    {payout.notes && (
                                                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                                                            {payout.notes}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <StatusBadge status={payout.status} />
                                                </td>

                                                <td className="px-4 py-4">
                                                    {payout.transaction_reference && (
                                                        <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 block">
                                                            {payout.transaction_reference}
                                                        </code>
                                                    )}
                                                    {payout.receipt_url && (
                                                        <a 
                                                            href={payout.receipt_url} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-brand-600 hover:underline text-[10px] flex items-center gap-1 mt-0.5"
                                                        >
                                                            <Paperclip className="w-3 h-3" />
                                                            <span>View Receipt</span>
                                                        </a>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-slate-500 text-[11px]">
                                                    {formatDate(payout.created_at)}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    {payout.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setPayoutToApprove(payout);
                                                                    setApproveForm({
                                                                        transaction_reference: 'WIRE-' + Math.floor(100000 + Math.random() * 900000),
                                                                        receipt_url: '',
                                                                        notes: '',
                                                                    });
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setPayoutToReject(payout);
                                                                    setRejectReason('');
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px] italic">Settled</span>
                                                    )}
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

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="space-y-4 mt-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Parent Category (Leave empty if Root)</label>
                                <select
                                    value={categoryForm.parent_id}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                >
                                    <option value="">No Parent (Root Department)</option>
                                    {rootCategories.filter(rc => rc.id !== editingCategory?.id).map((rc) => (
                                        <option key={rc.id} value={rc.id}>{rc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
                                <input
                                    type="text"
                                    value={categoryForm.banner}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, banner: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Custom Commission Fee (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={categoryForm.commission_rate}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, commission_rate: e.target.value })}
                                    placeholder="e.g. 8.5"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    {editingCategory ? 'Update Category' : 'Save Category'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve Payout Modal */}
            {payoutToApprove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            Approve Disbursement Payout
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Disbursing <strong className="text-emerald-600 font-bold">{formatCurrency(payoutToApprove.amount)}</strong> to <strong>{payoutToApprove.vendor?.shop_name}</strong>.
                        </p>

                        <form onSubmit={handleApprovePayout} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Bank / Wire Transaction Reference *</label>
                                <input
                                    type="text"
                                    required
                                    value={approveForm.transaction_reference}
                                    onChange={(e) => setApproveForm({ ...approveForm, transaction_reference: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Receipt URL or Attachment Ref</label>
                                <input
                                    type="text"
                                    value={approveForm.receipt_url}
                                    onChange={(e) => setApproveForm({ ...approveForm, receipt_url: e.target.value })}
                                    placeholder="https://banking.portal/receipt/..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setPayoutToApprove(null)}>Cancel</Button>
                                <Button type="submit" variant="primary">Confirm Disbursement</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Payout Modal */}
            {payoutToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Payout Request</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Rejecting disbursement of <strong className="text-rose-600 font-bold">{formatCurrency(payoutToReject.amount)}</strong>.
                        </p>

                        <form onSubmit={handleRejectPayout} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g. Bank wire verification failure, KYC audit pending..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setPayoutToReject(null)}>Cancel</Button>
                                <Button type="submit" variant="danger">Reject Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Confirmation */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to remove <strong className="text-slate-800">{categoryToDelete.name}</strong>?
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>Cancel</Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteCategory}>Delete Category</Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
