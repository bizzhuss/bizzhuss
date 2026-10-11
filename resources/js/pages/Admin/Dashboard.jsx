import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { TaskFormModal } from '@/components/forms/TaskFormModal';
import { VendorStatusModal } from '@/components/forms/VendorStatusModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    DollarSign, 
    TrendingUp, 
    Store, 
    ShieldAlert, 
    CheckCircle, 
    XCircle, 
    Users, 
    Clock, 
    Plus, 
    ExternalLink, 
    Layers,
    Briefcase,
    AlertCircle,
    ShoppingBag,
    Building2,
    CheckSquare,
    Settings,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function AdminDashboard({
    stats = { totalVendors: 0, totalOrders: 0, totalRevenue: 0, activeEmployees: 0 },
    metrics = {},
    vendors = [],
    employees = [],
    tasks = [],
    recentOrders = [],
    auth = {}
}) {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedVendorForReview, setSelectedVendorForReview] = useState(null);

    const departments = ['Logistics', 'Quality Assurance', 'Vendor Support', 'Billing', 'Platform Operations'];

    return (
        <MainLayout>
            <Head title="Super Admin Dashboard - Bizzhuss Enterprise" />

            {/* Dashboard Header with Sub-Navigation Tabs */}
            <AdminHeader
                title="Central Command"
                subtitle="High-altitude platform governance, merchant compliance, and operational workforce delegation."
                actions={
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsTaskModalOpen(true)}
                    >
                        Delegate Workforce Task
                    </Button>
                }
            />

            {/* Platform KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Gross Merchandise Value"
                    value={formatCurrency(metrics?.total_gmv ?? stats?.totalRevenue ?? 0)}
                    subtitle="Platform checkout volume"
                    icon={DollarSign}
                    trend={14.8}
                    color="brand"
                />
                <StatCard
                    title="Platform Commission Revenue"
                    value={formatCurrency(metrics?.platform_revenue ?? (stats?.totalRevenue ? stats.totalRevenue * 0.1 : 0))}
                    subtitle="Net retained transaction fees"
                    icon={TrendingUp}
                    trend={12.4}
                    color="emerald"
                />
                <StatCard
                    title="Merchant Network"
                    value={`${metrics?.total_vendors ?? stats?.totalVendors ?? vendors?.length ?? 0} Vendors`}
                    subtitle={`${metrics?.pending_vendor_approvals ?? 0} pending review`}
                    icon={Store}
                    color={(metrics?.pending_vendor_approvals ?? 0) > 0 ? 'amber' : 'brand'}
                />
                <StatCard
                    title="Workforce Operations"
                    value={`${metrics?.open_tasks ?? tasks?.length ?? 0} Open Tasks`}
                    subtitle="Active Kanban tickets"
                    icon={Briefcase}
                    color="sky"
                />
            </div>

            {/* Super Admin Management Suite Quick Navigation Hub */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Super Admin Management Modules
                        </h2>
                        <p className="text-xs text-slate-400">
                            Direct access to database-backed governance, workforce hierarchies, and platform configurations.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    <Link
                        href="/admin/marketing/curation"
                        className="group bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                                Storefront Merchandising
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Feature flagship items, launch special sale campaigns, and control live display priority.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                            <span>Curate Storefront</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/vendors"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Store className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                Vendor Oversight
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Merchant approvals, commission overrides, GMV trajectory & payout records.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                            <span>Manage Vendors</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/workforce/departments"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                Departments
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Corporate hierarchy, departmental nodes, and custom job designations.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                            <span>Configure Hierarchy</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/workforce/employees"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Workforce Directory
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Employee onboarding modal, code generator, and monthly sales quota tracking.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                            <span>View Directory</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/workforce/tasks"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                                Kanban & Delegation
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Interactive Kanban columns, progress bars, overdue bottleneck alerts & leaderboard.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-sky-600">
                            <span>Task Board</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/settings"
                        className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full focus:outline-none focus:ring-0"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform duration-200">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                Platform Settings
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                                Maintenance switch, platform currency, commission defaults & payout requests.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                            <span>Global Controls</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout: Vendor Approvals & Workforce Delegation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Vendor Approvals Queue (7 Columns) */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="w-4 h-4 text-brand-600" />
                                    <span>Vendor Onboarding & Governance</span>
                                </CardTitle>
                                <CardDescription>
                                    Review multi-vendor compliance credentials and set platform fee agreements.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                    {vendors?.length ?? 0} Total Registered
                                </span>
                                <Link
                                    href="/admin/vendors"
                                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                                >
                                    Full Suite <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Vendor / Shop</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Platform Fee</th>
                                        <th className="px-4 py-3.5">Current Ledger</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {(!vendors || vendors.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                                No registered vendors found.
                                            </td>
                                        </tr>
                                    ) : (
                                        vendors.map((vendor) => (
                                            <tr key={vendor?.id || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{vendor?.shop_name || 'Unnamed Vendor'}</div>
                                                    <div className="text-[11px] text-slate-400">{vendor?.contact_email || vendor?.user?.email || 'No direct email'}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={vendor?.status || 'active'} />
                                                </td>
                                                <td className="px-4 py-4 font-mono font-medium text-slate-900">
                                                    {vendor?.commission_rate ?? 10}%
                                                </td>
                                                <td className="px-4 py-4 font-mono font-semibold text-slate-900">
                                                    {formatCurrency(vendor?.balance ?? 0)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="secondary"
                                                        size="xs"
                                                        onClick={() => setSelectedVendorForReview(vendor)}
                                                    >
                                                        {vendor?.status === 'pending' ? 'Review & Approve' : 'Edit Agreement'}
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

                {/* Workforce Task Delegation Desk (5 Columns) */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-sky-600" />
                                    <span>Workforce Task Delegation</span>
                                </CardTitle>
                                <CardDescription>
                                    Active cross-departmental operations dispatched by administration.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/admin/workforce/tasks"
                                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                                >
                                    Kanban Board <ArrowRight className="w-3 h-3" />
                                </Link>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    icon={Plus}
                                    onClick={() => setIsTaskModalOpen(true)}
                                >
                                    New Task
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                                {(!tasks || tasks.length === 0) ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        No workforce tasks dispatched yet.
                                    </div>
                                ) : (
                                    tasks.map((task) => (
                                        <div key={task?.id || Math.random()} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                                                    {task?.title || 'Operational Task'}
                                                </h4>
                                                <StatusBadge status={task?.priority || 'medium'} className="text-[10px]" />
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                                {task?.description || 'No detailed instructions provided.'}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                    {task?.department || 'Operations'}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    <span>{task?.assignee?.name || task?.assignee?.email || 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Multi-Vendor Orders Table */}
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            <span>Recent Cross-Vendor Orders & Settlement Routing</span>
                        </CardTitle>
                        <CardDescription>
                            Real-time order intake showing automatic vendor sub-order split distribution.
                        </CardDescription>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Order #</th>
                                <th className="px-4 py-3.5">Purchaser</th>
                                <th className="px-4 py-3.5">Vendor Sub-Orders</th>
                                <th className="px-4 py-3.5">Order Total</th>
                                <th className="px-4 py-3.5">Payment</th>
                                <th className="px-6 py-3.5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(!recentOrders || recentOrders.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        No recent customer orders found.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order?.id || Math.random()} className="hover:bg-slate-50/60">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                            {order?.order_number || `#${order?.id || ''}`}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900">{order?.customer_name || 'Customer'}</div>
                                            <div className="text-[11px] text-slate-400">{order?.customer_email || '—'}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {order?.sub_orders && order.sub_orders.length > 0 ? (
                                                    order.sub_orders.map((so) => (
                                                        <span
                                                            key={so?.id || Math.random()}
                                                            className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700"
                                                        >
                                                            <Store className="w-3 h-3 text-brand-600" />
                                                            {so?.vendor?.shop_name || 'Vendor'}: {formatCurrency(so?.subtotal ?? 0)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">Direct Order</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-slate-900 font-mono">
                                            {formatCurrency(order?.total_amount ?? 0)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={order?.payment_status || 'paid'} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {order?.created_at ? formatDate(order.created_at) : 'Recent'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Task Creation & Delegation Modal */}
            <TaskFormModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                employees={employees}
                departments={departments}
            />

            {/* Vendor Review & Status Modal */}
            <VendorStatusModal
                isOpen={!!selectedVendorForReview}
                onClose={() => setSelectedVendorForReview(null)}
                vendor={selectedVendorForReview}
            />
        </MainLayout>
    );
}
