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
    Check
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
                                placeholder="Search by name, email, or phone..."
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
                                        </td>

                                        {/* Lifetime Spend */}
                                        <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                            {formatCurrency(user.total_spent)}
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
                    title="User Account Details"
                    maxWidth="max-w-lg"
                >
                    <div className="space-y-4 text-xs">
                        {/* Profile Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                {inspectedUser.avatar ? (
                                    <img src={inspectedUser.avatar} alt={inspectedUser.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    (inspectedUser.name || 'U').slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-slate-900 truncate">{inspectedUser.name}</h4>
                                <p className="text-slate-500 text-xs truncate">{inspectedUser.email}</p>
                            </div>
                            <div>
                                {renderRoleBadge(inspectedUser.role)}
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Contact Phone</span>
                                <span className="font-semibold text-slate-800">{inspectedUser.phone || 'Not provided'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Auth Method</span>
                                <div>{renderAuthProviderBadge(inspectedUser.auth_provider)}</div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Orders</span>
                                <span className="font-bold text-slate-900">{inspectedUser.orders_count} orders placed</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Lifetime Spend</span>
                                <span className="font-bold text-brand-600">{formatCurrency(inspectedUser.total_spent)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Registration Date</span>
                                <span className="font-medium text-slate-700">{inspectedUser.created_at}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account Status</span>
                                <span className="font-bold text-emerald-600 uppercase text-[11px]">{inspectedUser.status}</span>
                            </div>
                        </div>

                        {/* MongoDB ID with Copy */}
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Database Identifier (MongoDB ObjectId)</span>
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl font-mono text-[11px] text-slate-700">
                                <span className="flex-1 truncate">{inspectedUser.id}</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(inspectedUser.id)}
                                    className="text-slate-500 hover:text-slate-800 transition-colors p-1"
                                    title="Copy ObjectId"
                                >
                                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {inspectedUser.designation && (
                            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-amber-900">
                                <span className="font-bold block text-[11px]">Workforce Profile</span>
                                <p className="text-[11px] mt-0.5">
                                    Designation: <span className="font-semibold">{inspectedUser.designation}</span>
                                    {inspectedUser.department && <> • Department: <span className="font-semibold">{inspectedUser.department}</span></>}
                                </p>
                            </div>
                        )}

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
