import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    Tag, 
    Wallet, 
    Settings, 
    ExternalLink,
    Store,
    Percent,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { cn } from '@/lib/utils';

export function VendorHeader({ vendor, title, subtitle, actions }) {
    const { url } = usePage();

    const safeVendor = vendor || {};

    const navTabs = [
        {
            name: 'Central Command',
            href: '/vendor',
            active: url === '/vendor' || url === '/vendor/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Products Catalog',
            href: '/vendor/products',
            active: url.startsWith('/vendor/products'),
            icon: Package,
        },
        {
            name: 'Orders & Fulfillment',
            href: '/vendor/orders',
            active: url.startsWith('/vendor/orders'),
            icon: ShoppingBag,
        },
        {
            name: 'Discounts & Coupons',
            href: '/vendor/coupons',
            active: url.startsWith('/vendor/coupons'),
            icon: Tag,
        },
        {
            name: 'Financial Wallet',
            href: '/vendor/wallet',
            active: url.startsWith('/vendor/wallet'),
            icon: Wallet,
        },
        {
            name: 'Store Settings',
            href: '/vendor/settings',
            active: url.startsWith('/vendor/settings'),
            icon: Settings,
        },
    ];

    return (
        <div className="mb-8">
            {/* Top Bar with Merchant Context & Action Buttons */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden shrink-0 border border-brand-200">
                        {safeVendor.logo ? (
                            <img src={safeVendor.logo} alt={safeVendor.shop_name} className="w-full h-full object-cover" />
                        ) : (
                            <ApplicationLogo asLink={false} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                {safeVendor.shop_name || 'Vendor Portal'}
                            </h1>
                            <StatusBadge status={safeVendor.status || 'active'} />
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand-50 text-brand-700 border border-brand-200">
                                <Percent className="w-2.5 h-2.5 text-brand-600" />
                                {safeVendor.commission_rate || 10}% Platform Fee
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {subtitle || 'Manage your merchant catalog, order fulfillment, discount promotions, and payout ledger.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                    {actions}
                    <Link
                        href={`/shop?vendor=${safeVendor.id || ''}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Storefront</span>
                    </Link>
                </div>
            </div>

            {/* Inactive or Pending Warning Banner */}
            {safeVendor.status && safeVendor.status !== 'active' && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                        <span className="font-bold">Merchant Account {safeVendor.status === 'pending' ? 'Pending Review' : 'Suspended'}: </span>
                        {safeVendor.status === 'pending' 
                            ? 'Your store is currently under review by Super Administration. You can configure your catalog, but products will not be visible on the live storefront until approved.'
                            : 'Your merchant account has been suspended. Please contact platform administration to reinstate your store.'}
                    </div>
                </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="mt-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
                <nav className="flex space-x-1 sm:space-x-2" aria-label="Vendor Portal Tabs">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    'inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-150',
                                    tab.active
                                        ? 'border-brand-600 text-brand-600 bg-brand-50/50 rounded-t-lg'
                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                )}
                            >
                                <Icon className={cn('w-4 h-4', tab.active ? 'text-brand-600' : 'text-slate-400')} />
                                <span>{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

export default VendorHeader;
