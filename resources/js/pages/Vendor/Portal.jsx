import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ProductFormModal } from '@/components/forms/ProductFormModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    Store, 
    DollarSign, 
    Package, 
    ArrowUpRight, 
    Plus, 
    Send, 
    Layers, 
    FileText, 
    CheckCircle2, 
    Clock, 
    Star,
    Sparkles,
    CreditCard
} from 'lucide-react';

export default function VendorPortal({ vendor, metrics = {}, products = [], subOrders = [], payouts = [], allVendors = [] }) {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('2500');
    const [payoutMethod, setPayoutMethod] = useState('bank_wire');
    const [submittingPayout, setSubmittingPayout] = useState(false);

    const handleVendorSwitch = (newVendorId) => {
        router.get('/vendor', { vendor_id: newVendorId });
    };

    const handleRequestPayout = (e) => {
        e.preventDefault();
        setSubmittingPayout(true);

        router.post(
            '/vendor/payouts',
            {
                vendor_id: vendor.id,
                amount: payoutAmount,
                payout_method: payoutMethod,
                account_details: 'Designated Commercial Bank Account',
            },
            {
                onSuccess: () => {
                    setSubmittingPayout(false);
                    setIsPayoutModalOpen(false);
                },
                onError: () => {
                    setSubmittingPayout(false);
                },
            }
        );
    };

    return (
        <MainLayout>
            <Head title={`Vendor Portal - ${vendor.shop_name} | Bizzhuss`} />

            {/* Shop Profile Banner & Vendor Switcher */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 mb-8 shadow-xs">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
                            {vendor.shop_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {vendor.shop_name}
                                </h1>
                                <StatusBadge status={vendor.status} />
                                <Badge variant="purple" className="text-xs">
                                    {metrics.commission_rate}% Platform Fee
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 max-w-xl">
                                {vendor.description || 'Specialized enterprise supplier catalog and fulfillment profile.'}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    {vendor.rating} Rating
                                </span>
                                <span>•</span>
                                <span>ID: <code className="font-mono text-slate-600">{vendor.slug}</code></span>
                                <span>•</span>
                                <span>Email: {vendor.contact_email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Vendor Quick Switcher */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        {allVendors.length > 1 && (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Switch Store:</span>
                                <select
                                    value={vendor.id}
                                    onChange={(e) => handleVendorSwitch(e.target.value)}
                                    className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                                >
                                    {allVendors.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.shop_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            icon={ArrowUpRight}
                            onClick={() => setIsPayoutModalOpen(true)}
                        >
                            Request Payout
                        </Button>

                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={() => setIsProductModalOpen(true)}
                        >
                            Add Product
                        </Button>
                    </div>
                </div>
            </div>

            {/* Financial Performance KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Withdrawable Balance"
                    value={formatCurrency(metrics.balance || 0)}
                    subtitle="Ready for disbursement"
                    icon={DollarSign}
                    color="amber"
                />
                <StatCard
                    title="Gross Sales"
                    value={formatCurrency(metrics.lifetime_sales || 0)}
                    subtitle="Direct fulfilled orders"
                    icon={Package}
                    color="brand"
                />
                <StatCard
                    title="Net Earned Ledger"
                    value={formatCurrency(metrics.net_earnings || 0)}
                    subtitle="After commission deduction"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Catalog Products"
                    value={`${metrics.total_products || 0} SKUs`}
                    subtitle={`${metrics.active_suborders || 0} active sub-orders`}
                    icon={Layers}
                    color="purple"
                />
            </div>

            {/* Product Catalog & Sub-Order Tracking Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Product Catalog (7 Columns) */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-brand-600" />
                                    <span>Product Catalog Management</span>
                                </CardTitle>
                                <CardDescription>
                                    Live SKUs distributed across customer enterprise search.
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="xs"
                                icon={Plus}
                                onClick={() => setIsProductModalOpen(true)}
                            >
                                New SKU
                            </Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">SKU / Product</th>
                                        <th className="px-4 py-3.5">Category</th>
                                        <th className="px-4 py-3.5">Price</th>
                                        <th className="px-4 py-3.5">Inventory</th>
                                        <th className="px-4 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/60">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{product.title}</div>
                                                <div className="font-mono text-[11px] text-slate-400">{product.sku}</div>
                                            </td>
                                            <td className="px-4 py-4">{product.category}</td>
                                            <td className="px-4 py-4 font-mono font-semibold text-slate-900">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`font-semibold ${
                                                        product.stock < 15 ? 'text-amber-600' : 'text-slate-800'
                                                    }`}
                                                >
                                                    {product.stock} units
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={product.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sub-Orders Assigned to this Vendor (5 Columns) */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-emerald-600" />
                                    <span>Vendor Sub-Order Routing</span>
                                </CardTitle>
                                <CardDescription>
                                    Split items routed directly to your fulfillment queue.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                                {subOrders.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        No sub-orders received yet.
                                    </div>
                                ) : (
                                    subOrders.map((so) => (
                                        <div key={so.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-xs text-slate-900">
                                                    {so.sub_order_number}
                                                </span>
                                                <StatusBadge status={so.status} className="text-[10px]" />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                                                <span>Subtotal: {formatCurrency(so.subtotal)}</span>
                                                <span>Fee ({so.commission_rate}%): -{formatCurrency(so.commission_fee)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                                                <span className="font-medium text-slate-500">Net Vendor Payout:</span>
                                                <span className="font-mono font-bold text-emerald-600">
                                                    {formatCurrency(so.net_earnings)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payouts Disbursement Ledger */}
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-600" />
                            <span>Payout Disbursements & Bank Settlement History</span>
                        </CardTitle>
                        <CardDescription>
                            Audited ledger disbursements released to your commercial account.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="xs" onClick={() => setIsPayoutModalOpen(true)}>
                        New Disbursement
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Payout Reference</th>
                                <th className="px-4 py-3.5">Disbursement Amount</th>
                                <th className="px-4 py-3.5">Method</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Processed Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        No payouts generated yet for this vendor.
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/60">
                                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                                            {po.payout_number}
                                        </td>
                                        <td className="px-4 py-4 font-mono font-bold text-slate-900 text-sm">
                                            {formatCurrency(po.amount)}
                                        </td>
                                        <td className="px-4 py-4 capitalize">{po.payout_method.replace('_', ' ')}</td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={po.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {formatDate(po.processed_at || po.created_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Product Creation Modal */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                vendorId={vendor.id}
            />

            {/* Payout Request Modal */}
            {isPayoutModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsPayoutModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Request Vendor Disbursement</h3>
                                    <p className="text-xs text-slate-500">Available balance: {formatCurrency(vendor.balance)}</p>
                                </div>
                            </div>
                            <form onSubmit={handleRequestPayout} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Payout Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="50"
                                        max={vendor.balance}
                                        required
                                        className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Settlement Channel
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                                        value={payoutMethod}
                                        onChange={(e) => setPayoutMethod(e.target.value)}
                                    >
                                        <option value="bank_wire">Federal Commercial Wire (Same-Day)</option>
                                        <option value="ach_transfer">Standard ACH Direct Deposit</option>
                                        <option value="stripe_connect">Stripe Express Instant Payout</option>
                                    </select>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setIsPayoutModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" loading={submittingPayout}>
                                        Submit Disbursement Request
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
