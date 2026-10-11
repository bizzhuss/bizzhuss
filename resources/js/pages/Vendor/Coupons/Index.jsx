import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    Tag, 
    Plus, 
    Percent, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    Copy, 
    Check, 
    AlertCircle, 
    Sparkles,
    Calendar,
    Users,
    TrendingUp
} from 'lucide-react';

export default function CouponsIndex({ 
    vendor = {}, 
    coupons = [], 
    metrics = {} 
}) {
    // Create Coupon Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minSpend, setMinSpend] = useState('0');
    const [usageLimit, setUsageLimit] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Copy to clipboard notification
    const [copiedCode, setCopiedCode] = useState(null);

    // Delete Modal State
    const [couponToDelete, setCouponToDelete] = useState(null);

    const safeVendor = vendor || {};

    const handleCreateCoupon = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        router.post('/vendor/coupons', {
            code: couponCode,
            discount_type: discountType,
            discount_value: discountValue,
            min_spend: minSpend || 0,
            usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
            expires_at: expiresAt || null,
        }, {
            onSuccess: () => {
                setSubmitting(false);
                setIsCreateOpen(false);
                setCouponCode('');
                setDiscountValue('');
                setMinSpend('0');
                setUsageLimit('');
                setExpiresAt('');
            },
            onError: (err) => {
                setErrors(err);
                setSubmitting(false);
            },
        });
    };

    const handleToggleCoupon = (couponId) => {
        router.patch(`/vendor/coupons/${couponId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteCoupon = () => {
        if (!couponToDelete) return;
        router.delete(`/vendor/coupons/${couponToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setCouponToDelete(null),
        });
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <MainLayout>
            <Head title={`Discounts & Coupons - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            <VendorHeader
                vendor={safeVendor}
                title="Storefront Promotions & Coupons"
                subtitle="Create vendor-scoped promotional codes, boost conversion rates, and track redemption revenue."
                actions={
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create Coupon
                    </Button>
                }
            />

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Active Store Coupons"
                    value={`${metrics.active_coupons || 0} Live`}
                    subtitle="Currently eligible at checkout"
                    icon={Tag}
                    color="brand"
                />
                <StatCard
                    title="Redemption Count"
                    value={`${metrics.times_used || 0} Uses`}
                    subtitle="Customer checkouts applied"
                    icon={Users}
                    color="sky"
                />
                <StatCard
                    title="Attributed Revenue"
                    value={formatCurrency(metrics.revenue_generated || 0)}
                    subtitle="Total GMV driven by coupons"
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    title="Total Promotional Codes"
                    value={`${metrics.total_coupons || 0} Registered`}
                    subtitle="Archived and active codes"
                    icon={Sparkles}
                    color="purple"
                />
            </div>

            {/* Coupons Table Card */}
            <Card className="mb-8">
                <CardHeader>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-600" />
                            <span>Active & Scheduled Coupons</span>
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1">
                            Discounts generated here strictly apply to products sold by <strong className="text-slate-800">{safeVendor.shop_name}</strong>.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="xs"
                        icon={Plus}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        New Promo Code
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Promo Code</th>
                                <th className="px-4 py-3.5">Discount Value</th>
                                <th className="px-4 py-3.5">Min Order Spend</th>
                                <th className="px-4 py-3.5">Redemptions</th>
                                <th className="px-4 py-3.5">Attributed GMV</th>
                                <th className="px-4 py-3.5">Status / Validity</th>
                                <th className="px-4 py-3.5">Active</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="font-semibold text-slate-600 text-sm">No promotional coupons configured</p>
                                        <p className="text-xs text-slate-400 mt-1">Reward customers with seasonal discounts to boost repeat sales.</p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            icon={Plus}
                                            className="mt-4"
                                            onClick={() => setIsCreateOpen(true)}
                                        >
                                            Generate First Coupon
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => {
                                    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                                    const isLimitReached = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;

                                    return (
                                        <tr key={coupon.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Code & Copy */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-slate-900 bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-1 rounded-lg tracking-wider text-xs">
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(coupon.code)}
                                                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                                        title="Copy Code"
                                                    >
                                                        {copiedCode === coupon.code ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td className="px-4 py-4 font-bold text-slate-900">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <span className="inline-flex items-center gap-1 text-brand-600">
                                                        <Percent className="w-3.5 h-3.5" />
                                                        <span>{coupon.discount_value}% Off</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-mono">
                                                        <span>{formatCurrency(coupon.discount_value)} Flat Off</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Minimum Spend */}
                                            <td className="px-4 py-4 font-mono font-medium text-slate-600">
                                                {coupon.min_spend > 0 ? formatCurrency(coupon.min_spend) : 'No Min'}
                                            </td>

                                            {/* Usage Stats */}
                                            <td className="px-4 py-4">
                                                <div className="font-mono font-bold text-slate-900">
                                                    {coupon.times_used} uses
                                                </div>
                                                <span className="text-[11px] text-slate-400">
                                                    Cap: {coupon.usage_limit ? `${coupon.usage_limit} max` : 'Unlimited'}
                                                </span>
                                            </td>

                                            {/* Attributed GMV */}
                                            <td className="px-4 py-4 font-mono font-bold text-emerald-600">
                                                {formatCurrency(coupon.revenue_generated)}
                                            </td>

                                            {/* Status / Validity */}
                                            <td className="px-4 py-4">
                                                {isExpired ? (
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        Expired ({formatDate(coupon.expires_at)})
                                                    </span>
                                                ) : isLimitReached ? (
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Limit Reached
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {coupon.expires_at ? `Exp: ${formatDate(coupon.expires_at)}` : 'Never Expires'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Toggle Switch */}
                                            <td className="px-4 py-4">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={coupon.is_active}
                                                        onChange={() => handleToggleCoupon(coupon.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                                                </label>
                                            </td>

                                            {/* Delete */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setCouponToDelete(coupon)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Coupon Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Create Merchant Coupon</h3>
                                    <p className="text-xs text-slate-400">Offer store-scoped percentage or flat discounts.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                                {Object.values(errors).map((err, i) => (
                                    <p key={i}>{err}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Coupon Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. SUMMER20, BIZZHUSS10"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Discount Type
                                    </label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="percentage">Percentage Off (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Discount Value <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'percentage' ? '20' : '15.00'}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Min Order Spend ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={minSpend}
                                        onChange={(e) => setMinSpend(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Total Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.value)}
                                        placeholder="Unlimited"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating...' : 'Activate Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Coupon Modal */}
            {couponToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">
                            Remove Coupon Code
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to delete promo code <strong className="text-slate-800">{couponToDelete.code}</strong>? It will no longer be redeemable at customer checkout.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setCouponToDelete(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteCoupon}>
                                Delete Coupon
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
