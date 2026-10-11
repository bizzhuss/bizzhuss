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
    Store, 
    DollarSign, 
    TrendingUp, 
    Search, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    ShieldAlert, 
    Trash2, 
    Edit3, 
    Eye, 
    BarChart3, 
    Package, 
    Clock, 
    Percent, 
    X,
    ExternalLink,
    Filter,
    ShieldCheck,
    AlertCircle,
    Star
} from 'lucide-react';

export default function Vendors({ vendors = [], metrics = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    
    // Growth & Insights Modal State
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [customCommission, setCustomCommission] = useState('');
    const [savingCommission, setSavingCommission] = useState(false);

    // Delete Confirmation Modal
    const [vendorToDelete, setVendorToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/vendors', {
            search: searchQuery || undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
        }, { preserveState: true });
    };

    const handleTabChange = (status) => {
        setActiveTab(status);
        router.get('/admin/vendors', {
            status: status !== 'all' ? status : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleUpdateStatus = (vendorId, newStatus) => {
        router.post(`/admin/vendors/${vendorId}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedVendor && selectedVendor.id === vendorId) {
                    setSelectedVendor(prev => ({ ...prev, status: newStatus }));
                }
            }
        });
    };

    const handleSaveCommission = (e) => {
        e.preventDefault();
        if (!selectedVendor || !customCommission) return;

        setSavingCommission(true);
        router.post(`/admin/vendors/${selectedVendor.id}/commission`, {
            commission_rate: customCommission,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingCommission(false);
                setSelectedVendor(prev => ({ ...prev, commission_rate: parseFloat(customCommission) }));
            },
            onError: () => setSavingCommission(false),
        });
    };

    const handleDeleteVendor = () => {
        if (!vendorToDelete) return;
        router.delete(`/admin/vendors/${vendorToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setVendorToDelete(null),
        });
    };

    const openInsights = (vendor) => {
        setSelectedVendor(vendor);
        setCustomCommission(vendor.commission_rate.toString());
        setIsInsightModalOpen(true);
    };

    return (
        <MainLayout>
            <Head title="Vendor Control & Growth Analytics - Admin Suite | Bizzhuss" />

            <AdminHeader 
                title="Vendor Oversight & Merchant Governance"
                subtitle="Verify merchant applications, monitor multi-vendor GMV, manage gatekeeper rules, and configure custom commission rates."
            />

            {/* KPI Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Registered Vendors"
                    value={metrics.total_vendors || 0}
                    subtitle={`${metrics.active_vendors || 0} active, ${metrics.pending_vendors || 0} pending`}
                    icon={Store}
                    color="brand"
                />
                <StatCard
                    title="Platform Verified GMV"
                    value={formatCurrency(metrics.total_sales || 0)}
                    subtitle="Gross merchandise transactions"
                    icon={DollarSign}
                    trend={16.2}
                    color="emerald"
                />
                <StatCard
                    title="Retained Commission"
                    value={formatCurrency(metrics.total_commission || 0)}
                    subtitle="Platform fee earnings"
                    icon={TrendingUp}
                    trend={12.8}
                    color="purple"
                />
                <StatCard
                    title="Gatekeeper Compliance"
                    value={`${metrics.pending_vendors || 0} Pending`}
                    subtitle={`${metrics.suspended_vendors || 0} stores suspended`}
                    icon={ShieldAlert}
                    color={metrics.pending_vendors > 0 ? 'amber' : 'brand'}
                />
            </div>

            {/* Filter & Search Bar */}
            <Card className="mb-6">
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
                        {[
                            { id: 'all', label: 'All Vendors', count: metrics.total_vendors },
                            { id: 'active', label: 'Active / Verified', count: metrics.active_vendors },
                            { id: 'pending', label: 'Pending Review', count: metrics.pending_vendors },
                            { id: 'suspended', label: 'Suspended', count: metrics.suspended_vendors },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        activeTab === tab.id ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by shop name, slug, or owner email..."
                                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Filter
                        </Button>
                    </form>
                </div>
            </Card>

            {/* Vendor Listing Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">Merchant Shop</th>
                                <th className="px-5 py-3.5">Owner / Contact</th>
                                <th className="px-4 py-3.5 text-center">Products</th>
                                <th className="px-4 py-3.5 text-right">Total GMV</th>
                                <th className="px-4 py-3.5 text-right">Commission Fee</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5 text-center">Registered</th>
                                <th className="px-5 py-3.5 text-right">Gatekeeper Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                        <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-semibold text-slate-600">No vendors found matching your filter criteria</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Try resetting your search query or status filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Merchant Shop */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                                                    {vendor.logo ? (
                                                        <img src={vendor.logo} alt={vendor.shop_name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        vendor.shop_name.slice(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block text-xs">
                                                        {vendor.shop_name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        {vendor.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Owner Email */}
                                        <td className="px-5 py-4">
                                            {vendor.owner ? (
                                                <div>
                                                    <p className="font-semibold text-slate-800">{vendor.owner.name}</p>
                                                    <p className="text-[11px] text-slate-400">{vendor.owner.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>

                                        {/* Total Products */}
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                                <Package className="w-3 h-3 text-slate-500" />
                                                {vendor.metrics.products_count}
                                            </span>
                                        </td>

                                        {/* Total Sales */}
                                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                                            {formatCurrency(vendor.metrics.total_sales)}
                                        </td>

                                        {/* Platform Commission */}
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-bold text-emerald-700">
                                                {formatCurrency(vendor.metrics.commission_earned)}
                                            </span>
                                            <span className="block text-[10px] text-slate-400">
                                                Rate: {vendor.commission_rate}%
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={vendor.status} />
                                            {vendor.status !== 'active' && (
                                                <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                                                    Storefront Locked
                                                </span>
                                            )}
                                        </td>

                                        {/* Registration Date */}
                                        <td className="px-4 py-4 text-center text-slate-500 text-[11px] whitespace-nowrap">
                                            {formatDate(vendor.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Growth & Insights Modal Trigger */}
                                                <button
                                                    onClick={() => openInsights(vendor)}
                                                    className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 border border-brand-200 transition-colors cursor-pointer"
                                                    title="View Growth & Insights"
                                                >
                                                    <BarChart3 className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Approve Action */}
                                                {vendor.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(vendor.id, 'active')}
                                                        className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                                        title="Approve / Activate Vendor"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>{vendor.status === 'suspended' ? 'Reinstate' : 'Approve'}</span>
                                                    </button>
                                                )}

                                                {/* Suspend Action */}
                                                {vendor.status === 'active' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(vendor.id, 'suspended')}
                                                        className="px-2 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                                                        title="Suspend Vendor Store"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        <span>Suspend</span>
                                                    </button>
                                                )}

                                                {/* Delete Action */}
                                                <button
                                                    onClick={() => setVendorToDelete(vendor)}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                                    title="Delete Vendor"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Vendor Growth & Insights Modal */}
            {isInsightModalOpen && selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                    {selectedVendor.shop_name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {selectedVendor.shop_name}
                                        </h2>
                                        <StatusBadge status={selectedVendor.status} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Owned by {selectedVendor.owner?.name} ({selectedVendor.owner?.email})
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsInsightModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                                <span className="text-lg font-black text-slate-900 mt-1 block">
                                    {formatCurrency(selectedVendor.metrics.total_sales)}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Commission</span>
                                <span className="text-lg font-black text-emerald-600 mt-1 block">
                                    {formatCurrency(selectedVendor.metrics.commission_earned)}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Return Rate</span>
                                <span className={`text-lg font-black mt-1 block ${selectedVendor.metrics.return_rate > 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {selectedVendor.metrics.return_rate}%
                                </span>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rating</span>
                                <div className="flex items-center justify-center gap-1 mt-1 text-amber-500 font-bold text-lg">
                                    <Star className="w-4 h-4 fill-amber-400" />
                                    <span>{selectedVendor.metrics.customer_rating}</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom Commission Override Form */}
                        <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-200/70 mb-6">
                            <form onSubmit={handleSaveCommission} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                                        <Percent className="w-4 h-4 text-brand-600" />
                                        <span>Custom Commission Override</span>
                                    </h4>
                                    <p className="text-[11px] text-brand-700/80 mt-0.5">
                                        Set a specific transaction commission fee % for this merchant.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={customCommission}
                                        onChange={(e) => setCustomCommission(e.target.value)}
                                        className="w-24 px-3 py-1.5 text-xs font-bold bg-white border border-brand-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-400"
                                    />
                                    <span className="text-xs font-bold text-slate-700">%</span>
                                    <Button type="submit" variant="primary" size="sm" disabled={savingCommission}>
                                        {savingCommission ? 'Saving...' : 'Apply Rate'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Monthly Revenue Trend Visual */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                                6-Month Revenue Trajectory
                            </h4>
                            <div className="grid grid-cols-6 gap-2 text-center">
                                {selectedVendor.growth.monthly_revenue.map((m) => (
                                    <div key={m.month} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-end h-24">
                                        <div 
                                            className="bg-brand-500 rounded-md w-full transition-all"
                                            style={{ height: `${Math.min(100, Math.max(15, (m.revenue / 2000) * 80))}%` }}
                                        />
                                        <span className="text-[10px] font-bold text-slate-900 mt-2 truncate">
                                            ${m.revenue}
                                        </span>
                                        <span className="text-[9px] text-slate-400 truncate">
                                            {m.month.split(' ')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                                Top Catalog Products
                            </h4>
                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                                {selectedVendor.growth.top_products.length === 0 ? (
                                    <p className="p-4 text-xs text-slate-400 text-center">No products uploaded yet.</p>
                                ) : (
                                    selectedVendor.growth.top_products.map((p) => (
                                        <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                                            <div>
                                                <span className="font-bold text-slate-900 block">{p.title}</span>
                                                <span className="text-[11px] text-slate-400">Inventory: {p.stock_quantity} units</span>
                                            </div>
                                            <span className="font-bold text-slate-800">{formatCurrency(p.price)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Withdrawal / Payout History */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                                Disbursement & Payout Records
                            </h4>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                                {selectedVendor.growth.payouts.length === 0 ? (
                                    <p className="p-4 text-xs text-slate-400 text-center">No disbursement payout requests recorded.</p>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {selectedVendor.growth.payouts.map((po) => (
                                            <div key={po.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">
                                                        {formatCurrency(po.amount)} via {po.payment_method.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        Ref: {po.transaction_reference || 'Pending Approval'} • {formatDate(po.created_at)}
                                                    </span>
                                                </div>
                                                <StatusBadge status={po.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Vendor Confirmation Modal */}
            {vendorToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Confirm Vendor Deletion
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to delete <strong className="text-slate-800">{vendorToDelete.shop_name}</strong>? All catalog products and vendor portal associations will be removed from the marketplace.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setVendorToDelete(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteVendor}>
                                Permanently Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
