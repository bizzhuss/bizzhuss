import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { 
    Users, 
    UserCheck, 
    Store, 
    Shield, 
    Briefcase, 
    Search, 
    X, 
    Mail, 
    Phone, 
    Calendar, 
    ShoppingBag, 
    DollarSign, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    KeyRound, 
    Globe, 
    Eye,
    ChevronLeft,
    ChevronRight,
    Copy,
    Check,
    MapPin,
    Truck,
    Building2,
    Package
} from 'lucide-react';

export default function UsersIndex({ users = {}, filters = {}, stats = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [inspectedUser, setInspectedUser] = useState(null);
    const [copiedId, setCopiedId] = useState(false);

    // Normalize user list whether paginated object or array
    const userList = Array.isArray(users) ? users : (users?.data || []);
    const pagination = users?.links ? users : null;

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/users', {
            search: searchQuery || undefined,
            role: selectedRole !== 'all' ? selectedRole : undefined,
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        router.get('/admin/users', {
            role: role !== 'all' ? role : undefined,
            search: searchQuery || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get('/admin/users', {
            role: selectedRole !== 'all' ? selectedRole : undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true 
        });
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    // Helper for role badge styling
    const renderRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Shield className="w-3 h-3 text-purple-600" />
                        Super Admin
                    </span>
                );
            case 'vendor':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        <Store className="w-3 h-3 text-sky-600" />
                        Vendor
                    </span>
                );
            case 'employee':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Briefcase className="w-3 h-3 text-amber-600" />
                        Employee
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Customer
                    </span>
                );
        }
    };

    // Helper for auth provider badge
    const renderAuthProviderBadge = (provider) => {
        if (provider === 'Google') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                    <span className="font-black text-red-600">G</span>
                    Google OAuth
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <KeyRound className="w-3 h-3 text-slate-500" />
                Email / Password
            </span>
        );
    };

    return (
        <MainLayout>
            <Head title="Super Admin User Directory | Bizzhuss" />

            <AdminHeader 
                title="Super Admin User Directory"
                subtitle="Comprehensive directory of platform registrations, access roles, registration sources, and verified order history."
            />

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Registered Users"
                    value={stats.total_users || 0}
                    subtitle="Platform-wide active accounts"
                    icon={Users}
                    color="brand"
                />
                <StatCard
                    title="Platform Customers"
                    value={stats.total_customers || 0}
                    subtitle="Direct retail & enterprise buyers"
                    icon={UserCheck}
                    color="emerald"
                />
                <StatCard
                    title="Marketplace Vendors"
                    value={stats.total_vendors || 0}
                    subtitle="Audited supplier stores"
                    icon={Store}
                    color="sky"
                />
                <StatCard
                    title="Google Social Sign-ups"
                    value={stats.google_signups || 0}
                    subtitle="OAuth 2.0 verified accounts"
                    icon={Globe}
                    color="purple"
                />
            </div>

            {/* Filter Tabs & Search Bar */}
            <Card className="mb-6">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
                        {[
                            { id: 'all', label: 'All Users', count: stats.total_users },
                            { id: 'customer', label: 'Customers', count: stats.total_customers },
                            { id: 'vendor', label: 'Vendors', count: stats.total_vendors },
                            { id: 'employee', label: 'Employees' },
                            { id: 'super_admin', label: 'Super Admins' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleRoleChange(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                                    selectedRole === tab.id
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        selectedRole === tab.id ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'
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
                                placeholder="Search by name, email, phone, store name, or city..."
                                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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

            {/* Users Data Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">User Profile</th>
                                <th className="px-4 py-3.5 text-center">Assigned Role</th>
                                <th className="px-4 py-3.5">Registration Source</th>
                                <th className="px-4 py-3.5 text-center">Orders Placed</th>
                                <th className="px-4 py-3.5 text-right">Lifetime Spend</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5">Registered On</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {userList.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-semibold text-slate-600">No users found matching your criteria</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Try refining or resetting your search term and role filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                userList.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* User Profile */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (user.name || 'U').slice(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-bold text-slate-900 block truncate">
                                                        {user.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                            {user.email}
                                                        </span>
                                                        {user.phone && user.phone !== 'N/A' && (
                                                            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                                                                •
                                                                <Phone className="w-3 h-3 shrink-0" />
                                                                {user.phone}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Store Name & Location Meta Badges */}
                                                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                        {user.shop_name && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/80">
                                                                <Store className="w-2.5 h-2.5 text-sky-600" />
                                                                {user.shop_name}
                                                            </span>
                                                        )}
                                                        {user.city && user.city !== 'N/A' && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                                {user.city}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            {renderRoleBadge(user.role)}
                                        </td>

                                        {/* Auth Provider */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            {renderAuthProviderBadge(user.auth_provider)}
                                        </td>

                                        {/* Orders Count */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                                <ShoppingBag className="w-3 h-3 text-slate-500" />
                                                {user.orders_count}
                                            </span>
                                            {user.vendor_orders_count > 0 && (
                                                <div className="text-[10px] text-sky-700 font-bold mt-1 whitespace-nowrap">
                                                    {user.vendor_orders_count} vendor sales
                                                </div>
                                            )}
                                        </td>

                                        {/* Lifetime Spend */}
                                        <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                            <div>{formatCurrency(user.total_spent)}</div>
                                            {user.vendor_gross_sales > 0 && (
                                                <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                                    Sales: {formatCurrency(user.vendor_gross_sales)}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                user.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {user.status === 'active' ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>

                                        {/* Registered On */}
                                        <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{user.created_at}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setInspectedUser(user)}
                                                className="inline-flex items-center gap-1 text-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Inspect</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.links && pagination.links.length > 3 && (
                    <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                            Showing <span className="font-bold text-slate-800">{pagination.from || 0}</span> to{' '}
                            <span className="font-bold text-slate-800">{pagination.to || 0}</span> of{' '}
                            <span className="font-bold text-slate-800">{pagination.total || 0}</span> registered users
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                            {pagination.links.map((link, idx) => {
                                const isCurrent = link.active;
                                const isUrl = Boolean(link.url);
                                const cleanLabel = link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»');

                                if (!isUrl) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 select-none opacity-50"
                                            dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                            isCurrent
                                                ? 'bg-brand-500 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>

            {/* User Inspection Modal */}
            {inspectedUser && (
                <Modal
                    isOpen={Boolean(inspectedUser)}
                    onClose={() => setInspectedUser(null)}
                    title="Comprehensive User & Entity Profile"
                    maxWidth="max-w-2xl"
                >
                    <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
                        {/* Profile Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                                {inspectedUser.avatar ? (
                                    <img src={inspectedUser.avatar} alt={inspectedUser.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    (inspectedUser.name || 'U').slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-base text-slate-900 truncate">{inspectedUser.name}</h4>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inspectedUser.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${inspectedUser.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                        {inspectedUser.status === 'active' ? 'Active' : 'Suspended'}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-xs truncate mt-0.5">{inspectedUser.email}</p>
                            </div>
                            <div className="shrink-0">
                                {renderRoleBadge(inspectedUser.role)}
                            </div>
                        </div>

                        {/* Core Account Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Contact Phone</span>
                                <span className="font-semibold text-slate-800">{inspectedUser.phone || 'Not provided'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Auth Method</span>
                                <div>{renderAuthProviderBadge(inspectedUser.auth_provider)}</div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Registration Date</span>
                                <span className="font-medium text-slate-700">{inspectedUser.created_at}</span>
                            </div>
                        </div>

                        {/* Detailed Buyer & Shipping Destination Profile */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                                        Buyer Shipping & Consignee Location
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Delivery Profile
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Delivery Address</span>
                                    <p className="font-medium text-slate-800 text-xs leading-relaxed">
                                        {inspectedUser.address || 'No saved address'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">City & Region</span>
                                    <p className="font-bold text-slate-900 text-xs">
                                        {inspectedUser.city || 'N/A'}{inspectedUser.postal_code && inspectedUser.postal_code !== 'N/A' ? ` (${inspectedUser.postal_code})` : ''}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Country: <strong className="text-slate-700">{inspectedUser.country || 'Pakistan'}</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Orders Placed</span>
                                    <span className="font-black text-slate-900 text-xs mt-0.5 block">
                                        {inspectedUser.orders_count} orders
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Purchases</span>
                                    <span className="font-black text-emerald-600 text-xs mt-0.5 block">
                                        {formatCurrency(inspectedUser.total_spent)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Vendor & Business Profile (if vendor or has shop_name) */}
                        {(inspectedUser.role === 'vendor' || inspectedUser.shop_name) && (
                            <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3 bg-gradient-to-br from-sky-50/30 to-white">
                                <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-sky-600" />
                                        <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                                            Marketplace Merchant & Storefront Profile
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                        Supplier Store
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Store / Shop Name</span>
                                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                            <span>{inspectedUser.shop_name || "Merchant's Store"}</span>
                                        </div>
                                        {inspectedUser.vendor_slug && (
                                            <div className="mt-1">
                                                <span className="text-[10px] text-slate-400">Slug: </span>
                                                <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">
                                                    {inspectedUser.vendor_slug}
                                                </code>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Business Registration</span>
                                        <div className="text-xs font-semibold text-slate-800">
                                            {inspectedUser.business_registration || 'Verified Marketplace Supplier'}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1">
                                            Carrier SLA: 1-3 Business Days
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sky-100">
                                    <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                                        <span className="text-[10px] text-sky-700 uppercase font-bold block">Vendor Orders Received</span>
                                        <span className="font-black text-slate-900 text-xs mt-0.5 block">
                                            {inspectedUser.vendor_orders_count || 0} sub-orders
                                        </span>
                                    </div>
                                    <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                                        <span className="text-[10px] text-sky-700 uppercase font-bold block">Gross Merchant Revenue</span>
                                        <span className="font-black text-brand-600 text-xs mt-0.5 block">
                                            {formatCurrency(inspectedUser.vendor_gross_sales || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workforce Profile (if employee/staff) */}
                        {inspectedUser.designation && (
                            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100 text-amber-900">
                                <span className="font-bold block text-[11px] flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                                    Workforce Profile
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>
                                        <span className="text-[10px] text-amber-700 font-semibold block">Designation:</span>
                                        <span className="font-bold text-slate-900">{inspectedUser.designation}</span>
                                    </div>
                                    {inspectedUser.department && (
                                        <div>
                                            <span className="text-[10px] text-amber-700 font-semibold block">Department:</span>
                                            <span className="font-bold text-slate-900">{inspectedUser.department}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MongoDB ID with Copy */}
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Database Identifier (MongoDB ObjectId)</span>
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl font-mono text-[11px] text-slate-700">
                                <span className="flex-1 truncate">{inspectedUser.id}</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(inspectedUser.id)}
                                    className="text-slate-500 hover:text-slate-800 transition-colors p-1 cursor-pointer"
                                    title="Copy ObjectId"
                                >
                                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setInspectedUser(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </MainLayout>
    );
}
