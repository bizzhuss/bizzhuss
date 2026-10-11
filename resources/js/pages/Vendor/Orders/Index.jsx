import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    ShoppingBag, 
    Search, 
    Filter, 
    Truck, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Printer, 
    ExternalLink, 
    Package, 
    DollarSign, 
    ArrowRight, 
    X,
    User,
    MapPin,
    Calendar,
    CreditCard
} from 'lucide-react';

export default function OrdersIndex({ 
    vendor = {}, 
    subOrders = [], 
    metrics = {}, 
    filters = {} 
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    // Fulfillment Modal State
    const [orderForFulfillment, setOrderForFulfillment] = useState(null);
    const [deliveryStatus, setDeliveryStatus] = useState('processing');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Quick Invoice / Packing Slip Modal State
    const [orderForInvoice, setOrderForInvoice] = useState(null);

    const safeVendor = vendor || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/vendor/orders', {
            search: searchQuery || undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
        }, { preserveState: true });
    };

    const handleTabFilter = (status) => {
        setActiveTab(status);
        router.get('/vendor/orders', {
            status: status !== 'all' ? status : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleOpenFulfillment = (order) => {
        setOrderForFulfillment(order);
        setDeliveryStatus(order.delivery_status);
        setTrackingNumber(order.tracking_number || '');
        setCarrier(order.carrier || 'Standard Courier');
    };

    const handleSaveFulfillment = (e) => {
        e.preventDefault();
        if (!orderForFulfillment) return;

        setUpdatingStatus(true);
        router.patch(`/vendor/orders/${orderForFulfillment.order_id}/fulfillment`, {
            delivery_status: deliveryStatus,
            tracking_number: trackingNumber || null,
            carrier: carrier || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setUpdatingStatus(false);
                setOrderForFulfillment(null);
            },
            onError: () => setUpdatingStatus(false),
        });
    };

    const statusTabs = [
        { id: 'all', label: 'All Sub-Orders', count: metrics.total_sub_orders || 0 },
        { id: 'pending', label: 'Pending', count: metrics.pending || 0 },
        { id: 'processing', label: 'Processing', count: metrics.processing || 0 },
        { id: 'shipped', label: 'In Transit', count: metrics.shipped || 0 },
        { id: 'delivered', label: 'Delivered', count: metrics.delivered || 0 },
        { id: 'cancelled', label: 'Cancelled', count: metrics.cancelled || 0 },
    ];

    return (
        <MainLayout>
            <Head title={`Order Fulfillment - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            <VendorHeader
                vendor={safeVendor}
                title="Multi-Vendor Order Fulfillment"
                subtitle="Fulfill customer orders, enter dispatch tracking codes, and print official warehouse packing slips."
            />

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Sub-Orders"
                    value={`${metrics.total_sub_orders || 0} Orders`}
                    subtitle="Platform customer orders"
                    icon={ShoppingBag}
                    color="brand"
                />
                <StatCard
                    title="Awaiting Dispatch"
                    value={`${(metrics.pending || 0) + (metrics.processing || 0)} Orders`}
                    subtitle="Pending merchant packaging"
                    icon={Clock}
                    color={(metrics.pending || 0) > 0 ? 'amber' : 'brand'}
                />
                <StatCard
                    title="In Transit / Shipped"
                    value={`${metrics.shipped || 0} Orders`}
                    subtitle="Courier in-flight deliveries"
                    icon={Truck}
                    color="sky"
                />
                <StatCard
                    title="Completed Subtotal"
                    value={formatCurrency(metrics.total_net_revenue || 0)}
                    subtitle="Delivered net earnings"
                    icon={DollarSign}
                    color="emerald"
                />
            </div>

            {/* Main Orders Table Card */}
            <Card className="mb-8">
                {/* Search & Status Tabs Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabFilter(tab.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    activeTab === tab.id ? 'bg-brand-200/80 text-brand-900' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search order #, customer..."
                                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Sub-Orders List */}
                <div className="divide-y divide-slate-100">
                    {subOrders.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs">
                            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700 text-sm">No sub-orders found</p>
                            <p className="text-slate-400 mt-1">When customers purchase items from your storefront, they appear here for fulfillment.</p>
                        </div>
                    ) : (
                        subOrders.map((order) => (
                            <div key={order.order_id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 text-xs border border-slate-200">
                                            #{order.order_id}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-slate-900 text-sm">
                                                    {order.sub_order_number}
                                                </span>
                                                <StatusBadge status={order.delivery_status} />
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                                    Payment: {order.payment_status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                                <span>Master Order: #{order.order_number}</span>
                                                <span>•</span>
                                                <span>Placed: {formatDate(order.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Link href={`/vendor/orders/${order.order_id}/invoice`} target="_blank">
                                            <Button variant="secondary" size="xs" icon={Printer}>
                                                Packing Slip
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="primary"
                                            size="xs"
                                            icon={Truck}
                                            onClick={() => handleOpenFulfillment(order)}
                                        >
                                            Update Fulfillment
                                        </Button>
                                    </div>
                                </div>

                                {/* Order Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                                    {/* Items List (8 Columns) */}
                                    <div className="lg:col-span-8 space-y-3">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Purchased Items ({order.items_count} units)
                                        </span>
                                        <div className="space-y-2">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                            {item.image ? (
                                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <Package className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block line-clamp-1">{item.title}</span>
                                                            <span className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono font-medium text-slate-800">
                                                            {item.quantity} x {formatCurrency(item.unit_price)}
                                                        </span>
                                                        <span className="block text-[11px] font-mono font-bold text-emerald-600">
                                                            Net: {formatCurrency(item.vendor_earning)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer & Settlement Breakdown (4 Columns) */}
                                    <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between text-xs">
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Shipping Recipient
                                            </span>
                                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{order.customer_name}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-1 flex items-start gap-1.5 leading-relaxed">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span>{order.shipping_address}</span>
                                            </div>
                                            {order.tracking_number && (
                                                <div className="mt-3 p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                                                    <span className="font-semibold text-slate-700 block">Courier: {order.carrier || 'Courier'}</span>
                                                    <span className="font-mono text-brand-600 font-bold">Tracking: {order.tracking_number}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1">
                                            <div className="flex justify-between text-slate-500 text-[11px]">
                                                <span>Items Subtotal:</span>
                                                <span className="font-mono font-semibold">{formatCurrency(order.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 text-[11px]">
                                                <span>Platform Commission:</span>
                                                <span className="font-mono font-semibold text-rose-600">-{formatCurrency(order.platform_commission)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-900 font-bold text-xs pt-1 border-t border-slate-200/50">
                                                <span>Your Net Earning:</span>
                                                <span className="font-mono text-emerald-600">{formatCurrency(order.net_earnings)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Step-by-Step Fulfillment Modal */}
            {orderForFulfillment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Update Fulfillment</h3>
                                    <p className="text-xs text-slate-400">Order #{orderForFulfillment.sub_order_number}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOrderForFulfillment(null)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveFulfillment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Fulfillment Stage
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: 'pending', label: 'Pending Packaging' },
                                        { val: 'processing', label: 'Processing / Packed' },
                                        { val: 'shipped', label: 'Shipped (In Transit)' },
                                        { val: 'delivered', label: 'Delivered' },
                                        { val: 'cancelled', label: 'Cancelled' },
                                    ].map((s) => (
                                        <button
                                            key={s.val}
                                            type="button"
                                            onClick={() => setDeliveryStatus(s.val)}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                                deliveryStatus === s.val
                                                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(deliveryStatus === 'shipped' || deliveryStatus === 'delivered') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Logistics Carrier Name
                                        </label>
                                        <input
                                            type="text"
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                            placeholder="e.g. FedEx, TCS, DHL, Leopard Courier"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Tracking Consignment Number
                                        </label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="e.g. TRK-9876543210"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setOrderForFulfillment(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={updatingStatus}
                                >
                                    {updatingStatus ? 'Updating...' : 'Save Fulfillment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
