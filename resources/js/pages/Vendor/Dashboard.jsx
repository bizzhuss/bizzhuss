import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    DollarSign, 
    TrendingUp, 
    Package, 
    ShoppingBag, 
    Tag, 
    Wallet, 
    Settings, 
    Plus, 
    ArrowRight, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    Store, 
    Layers,
    Percent,
    ExternalLink,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';

export default function Dashboard({ 
    vendor = {}, 
    metrics = {}, 
    recentOrders = [], 
    lowStockProducts = [], 
    payouts = [] 
}) {
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('100');
    const [payoutMethod, setPayoutMethod] = useState('bank_wire');
    const [accountDetails, setAccountDetails] = useState('');
    const [submittingPayout, setSubmittingPayout] = useState(false);

    const safeVendor = vendor || {};
    const availableBalance = metrics.available_balance || 0;

    const handleRequestPayout = (e) => {
        e.preventDefault();
        setSubmittingPayout(true);
        router.post('/vendor/payouts', {
            amount: payoutAmount,
            payment_method: payoutMethod,
            account_details: accountDetails,
        }, {
            onSuccess: () => {
                setSubmittingPayout(false);
                setIsPayoutModalOpen(false);
                setAccountDetails('');
            },
            onError: () => {
                setSubmittingPayout(false);
            },
        });
    };

    return (
        <MainLayout>
            <Head title={`Vendor Central Command - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            {/* Vendor Sub-Navigation Header */}
            <VendorHeader
                vendor={safeVendor}
                title="Vendor Central Command"
                subtitle="Live catalog inventory, incoming cross-vendor customer orders, and payout disbursements."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            icon={DollarSign}
                            onClick={() => setIsPayoutModalOpen(true)}
                        >
                            Request Payout
                        </Button>
                        <Link href="/vendor/products/create">
                            <Button variant="primary" icon={Plus}>
                                Add Product
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Low-Stock Warning Banner if any */}
            {lowStockProducts.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold">Inventory Alert: </span>
                            <span>You have {metrics.low_stock_count || lowStockProducts.length} items reaching or below their low-stock threshold. Restock soon to prevent missed sales.</span>
                        </div>
                    </div>
                    <Link
                        href="/vendor/products?status=low_stock"
                        className="font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1 shrink-0"
                    >
                        View Depleted Items <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Gross Sales Volume"
                    value={formatCurrency(metrics.total_sales_gmv || 0)}
                    subtitle="Total merchant revenue"
                    icon={DollarSign}
                    trend={15.2}
                    color="brand"
                />
                <StatCard
                    title="Net Earned Balance"
                    value={formatCurrency(metrics.total_net_earnings || 0)}
                    subtitle="After platform commission"
                    icon={TrendingUp}
                    trend={12.8}
                    color="emerald"
                />
                <StatCard
                    title="Available for Payout"
                    value={formatCurrency(availableBalance)}
                    subtitle="Ready for disbursement"
                    icon={Wallet}
                    color="indigo"
                />
                <StatCard
                    title="Pending Orders"
                    value={`${metrics.orders_to_fulfill || 0} Orders`}
                    subtitle="Requires merchant fulfillment"
                    icon={ShoppingBag}
                    color={metrics.orders_to_fulfill > 0 ? 'amber' : 'brand'}
                />
            </div>

            {/* Quick Access Management Hub */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Merchant Suite Modules
                        </h2>
                        <p className="text-xs text-slate-400">
                            Direct workflows for multi-variant products, sub-orders, coupons, and shop branding.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
                    <Link
                        href="/vendor/products"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Package className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                Product Catalog
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Multi-image uploader, size/color variants, barcodes, and profit margins.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                            <span>Manage Products</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/vendor/orders"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                                Order Fulfillment
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Vendor sub-order tracking, step-by-step status, and printable packing slips.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-sky-600">
                            <span>Fulfill Orders</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/vendor/coupons"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Tag className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                Coupon Engine
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Vendor-scoped promo codes, % or fixed discounts, usage caps, and metrics.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                            <span>Manage Coupons</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/vendor/wallet"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Wallet & Payouts
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Available net balance, bank details, withdrawal requests, and payouts ledger.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                            <span>Open Wallet</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/vendor/settings"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                Shop Settings
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Storefront logo, banner, customer support hotline, and return policy.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                            <span>Edit Profile</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout: Recent Sub-Orders & Low-Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Recent Sub-Orders Feed (7 Cols) */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-sky-600" />
                                    <span>Recent Sub-Orders</span>
                                </CardTitle>
                                <CardDescription>
                                    Latest items purchased from your storefront awaiting delivery.
                                </CardDescription>
                            </div>
                            <Link
                                href="/vendor/orders"
                                className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                            >
                                All Orders <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Order / Item</th>
                                        <th className="px-4 py-3.5">Qty</th>
                                        <th className="px-4 py-3.5">Net Earning</th>
                                        <th className="px-4 py-3.5">Fulfillment</th>
                                        <th className="px-6 py-3.5 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                                No sub-orders placed yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((ro) => (
                                            <tr key={ro.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                            {ro.product_image ? (
                                                                <img src={ro.product_image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <Package className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 line-clamp-1">{ro.product_title}</div>
                                                            <div className="text-[11px] text-slate-400 font-mono">#{ro.order_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-mono font-medium text-slate-800">
                                                    x{ro.quantity}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-bold text-slate-900">
                                                    {formatCurrency(ro.vendor_earning)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={ro.delivery_status} />
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500">
                                                    {formatDate(ro.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Low-Stock Inventory Desk (5 Cols) */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span>Stock Replenishment Desk</span>
                                </CardTitle>
                                <CardDescription>
                                    Catalog items that need urgent restocking.
                                </CardDescription>
                            </div>
                            <Link
                                href="/vendor/products?status=low_stock"
                                className="text-xs text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1"
                            >
                                Inventory <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                                {lowStockProducts.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="font-semibold text-slate-700">Healthy Inventory Levels</p>
                                        <p className="text-[11px] mt-0.5">No products currently below low-stock thresholds.</p>
                                    </div>
                                ) : (
                                    lowStockProducts.map((p) => (
                                        <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    {p.images && p.images[0] ? (
                                                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                                                        {p.title}
                                                    </h4>
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        SKU: {p.sku}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${p.stock_quantity <= 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                    {p.stock_quantity <= 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                                                </span>
                                                <Link
                                                    href={`/vendor/products/${p.id}/edit`}
                                                    className="block text-[11px] text-brand-600 hover:text-brand-700 font-semibold mt-1"
                                                >
                                                    Restock Item →
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Request Payout Modal */}
            {isPayoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Request Disbursement</h3>
                                    <p className="text-xs text-slate-400">Transfer net earnings to your bank or mobile wallet.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPayoutModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRequestPayout} className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-xs">
                                <span className="font-semibold text-emerald-900">Available Balance:</span>
                                <span className="font-mono font-black text-emerald-700 text-sm">
                                    {formatCurrency(availableBalance)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Withdrawal Amount (PKR / Rs.)
                                </label>
                                <input
                                    type="number"
                                    min="50"
                                    max={availableBalance}
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Minimum payout amount is Rs. 5,000</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Disbursement Channel
                                </label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="bank_wire">Commercial Bank Account / IBAN</option>
                                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                                    <option value="jazzcash">JazzCash Mobile Account</option>
                                    <option value="paypal">PayPal Electronic Wire</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Account Details / Beneficiary Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={accountDetails}
                                    onChange={(e) => setAccountDetails(e.target.value)}
                                    placeholder="Account Title, Account Number / IBAN, Bank Name, or Mobile Number"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setIsPayoutModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={submittingPayout || availableBalance < 50}
                                >
                                    {submittingPayout ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
