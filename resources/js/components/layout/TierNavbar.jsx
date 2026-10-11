import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    ShoppingBag, 
    ShieldCheck, 
    Store, 
    Briefcase, 
    ShoppingCart, 
    Layers, 
    Sparkles, 
    Lock,
    User,
    CheckCircle2,
    LogOut,
    Megaphone
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function TierNavbar() {
    const pageProps = usePage().props;
    const url = usePage().url;
    const auth = pageProps.auth;
    const { totalItems, setIsCartOpen } = useApp();
    const currentUser = auth?.user;
    const currentRole = currentUser?.role;

    // RBAC Tier Navigation Definitions
    const tiers = [
        {
            name: 'Customer Store',
            href: '/',
            active: url === '/' || url.startsWith('/storefront') || url.startsWith('/product'),
            icon: ShoppingBag,
            badge: 'Tier 1',
            badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/60',
            activeStyles: 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30',
            allowed: true, // Always accessible
        },
        ...(currentRole === 'customer' ? [{
            name: 'Customer Portal',
            href: '/customer/dashboard',
            active: url.startsWith('/customer'),
            icon: User,
            badge: 'My Hub',
            badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/60',
            activeStyles: 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30',
            allowed: true,
        }] : []),
        {
            name: 'Super Admin',
            href: '/admin',
            active: url.startsWith('/admin'),
            icon: ShieldCheck,
            badge: 'Tier 2',
            badgeColor: 'border-brand-500/30 text-brand-300 bg-brand-950/60',
            activeStyles: 'bg-brand-600 text-white shadow-md shadow-brand-900/30',
            allowed: !currentRole || currentRole === 'super_admin',
            requiredRole: 'super_admin',
        },
        {
            name: 'Vendor Portal',
            href: '/vendor',
            active: url.startsWith('/vendor'),
            icon: Store,
            badge: 'Tier 3',
            badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-950/60',
            activeStyles: 'bg-amber-600 text-white shadow-md shadow-amber-900/30',
            allowed: !currentRole || currentRole === 'vendor',
            requiredRole: 'vendor',
        },
        {
            name: 'Employee Desk',
            href: '/employee',
            active: url.startsWith('/employee'),
            icon: Briefcase,
            badge: 'Tier 4',
            badgeColor: 'border-sky-500/30 text-sky-300 bg-sky-950/60',
            activeStyles: 'bg-sky-600 text-white shadow-md shadow-sky-900/30',
            allowed: !currentRole || currentRole === 'employee',
            requiredRole: 'employee',
        },
        {
            name: 'Marketing Hub',
            href: '/marketing',
            active: url.startsWith('/marketing'),
            icon: Megaphone,
            badge: 'Tier 5',
            badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-950/60',
            activeStyles: 'bg-purple-600 text-white shadow-md shadow-purple-900/30',
            allowed: !currentRole || currentRole === 'marketing_manager' || currentRole === 'super_admin',
            requiredRole: 'marketing_manager',
        },
    ];

    return (
        <header className="sticky top-0 z-50 bg-slate-950 text-white border-b border-slate-800 shadow-md">
            {/* Top Persistent Role Switcher - Strictly for Super Admin Only */}
            {currentUser?.role === 'super_admin' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
                    <div className="flex flex-col sm:flex-row items-center justify-between py-2 sm:py-2.5 gap-2.5">
                        {/* Role & Permissions Status */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Super Admin View: <strong className="capitalize">{currentUser.name}</strong></span>
                            </div>
                            <span className="hidden md:inline text-xs text-slate-400">
                                Global Master Switcher:
                            </span>
                        </div>

                        {/* Navigation Pills */}
                        <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2">
                            {tiers.map((tier) => {
                                const Icon = tier.icon;

                                return (
                                    <Link
                                        key={tier.name}
                                        href={tier.href}
                                        preserveScroll={false}
                                        className={cn(
                                            'group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                                            tier.active
                                                ? tier.activeStyles
                                                : 'text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'w-3.5 h-3.5 transition-colors',
                                                tier.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                            )}
                                        />
                                        <span>{tier.name}</span>
                                        <span
                                            className={cn(
                                                'text-[10px] px-1.5 py-0.2 rounded font-mono font-bold tracking-tight',
                                                tier.active
                                                    ? 'bg-black/25 text-white'
                                                    : tier.badgeColor
                                            )}
                                        >
                                            {tier.badge}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-header Brand & Navigation Bar */}
            <div className="bg-slate-900/95 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-14 gap-4">
                    {/* Left: Brand Logo & Context */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <ApplicationLogo asLink={false} className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black tracking-tight text-white">
                                    Bizzhuss
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 hidden sm:inline">
                                    RBAC Secured
                                </span>
                            </div>
                        </Link>

                        {/* Direct Portal / Storefront Quick Links */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Link 
                                href="/" 
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
                            >
                                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Customer Storefront</span>
                            </Link>

                            {currentUser?.role === 'vendor' && (
                                <Link 
                                    href="/vendor" 
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
                                >
                                    <Store className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Vendor Portal</span>
                                </Link>
                            )}

                            {currentUser?.role === 'employee' && (
                                <Link 
                                    href="/employee" 
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-colors"
                                >
                                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Workforce Desk</span>
                                </Link>
                            )}

                            {currentUser?.role === 'super_admin' && (
                                <Link 
                                    href="/admin" 
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-300 hover:text-white bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 transition-colors"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                                    <span>Admin Panel</span>
                                </Link>
                            )}

                            {(currentUser?.role === 'marketing_manager' || currentUser?.role === 'super_admin') && (
                                <Link 
                                    href="/marketing" 
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-colors"
                                >
                                    <Megaphone className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Marketing Hub</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: User Status & Cart Trigger */}
                    <div className="flex items-center gap-3">
                        {/* Cart Drawer Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-semibold hidden sm:inline">Cart</span>
                            {totalItems > 0 && (
                                <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Authenticated User Status & Logout */}
                        {currentUser ? (
                            <div className="flex items-center gap-2">
                                <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="font-semibold text-white">{currentUser.name.split(' ')[0]}</span>
                                    <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                                        {currentUser.role.replace('_', ' ')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
                            >
                                <User className="w-3.5 h-3.5" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
