import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import {
    HelpCircle,
    ShoppingBag,
    Truck,
    RotateCcw,
    Headphones,
    Store,
    PackageCheck,
    CreditCard,
    Building2,
    Share2,
    Network,
    FileText,
    ShieldCheck,
    Activity,
    ChevronRight,
    Home,
    PhoneCall,
    Mail,
    ArrowUpRight,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

const navigationGroups = [
    {
        title: 'Customer Care',
        items: [
            { name: 'Help Center & FAQ', href: '/help', icon: HelpCircle },
            { name: 'How to Buy Guide', href: '/how-to-buy', icon: ShoppingBag },
            { name: 'Track Your Order', href: '/track-order', icon: Truck },
            { name: 'Returns & Refunds', href: '/returns-refunds', icon: RotateCcw },
            { name: 'Contact Us', href: '/contact', icon: Headphones },
        ],
    },
    {
        title: 'Bizzhuss Business',
        items: [
            { name: 'Become a Seller', href: '/business/become-seller', icon: Store, badge: '0% Intro' },
            { name: 'Vendor Center', href: '/business/vendor-center', icon: PackageCheck },
            { name: 'Fee Structure & Payouts', href: '/business/fees-payouts', icon: CreditCard },
            { name: 'Enterprise Procurement', href: '/business/enterprise', icon: Building2, badge: 'B2B RFQ' },
            { name: 'Affiliate Program', href: '/business/affiliate', icon: Share2 },
        ],
    },
    {
        title: 'Platform Operations',
        items: [
            { name: 'Order Routing Service', href: '/operations/order-routing', icon: Network },
            { name: 'Privacy & Terms', href: '/terms', icon: FileText },
            { name: 'Compliance & Security', href: '/security', icon: ShieldCheck },
            { name: 'System Status', href: '/status', icon: Activity, badge: 'Operational' },
        ],
    },
];

export function HelpLayout({
    title,
    subtitle,
    categoryName = 'Knowledge Base',
    currentKey,
    breadcrumbs = [],
    children,
}) {
    const { url } = usePage();

    // Check if link is active
    const isLinkActive = (itemHref) => {
        if (currentKey && itemHref.includes(currentKey)) return true;
        if (url === itemHref) return true;
        if (itemHref !== '/' && url.startsWith(itemHref)) return true;
        return false;
    };

    return (
        <StorefrontLayout>
            <Head title={`${title} | Bizzhuss Help & Information`} />

            {/* Breadcrumb Trail */}
            <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-1">
                <Link href="/" className="inline-flex items-center gap-1.5 hover:text-amber-500 transition-colors shrink-0">
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-400 shrink-0">{categoryName}</span>
                {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={idx}>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        {b.href ? (
                            <Link href={b.href} className="hover:text-amber-500 transition-colors shrink-0">
                                {b.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-slate-900 shrink-0">{b.label}</span>
                        )}
                    </React.Fragment>
                ))}
                {!breadcrumbs.length && (
                    <>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900 shrink-0">{title}</span>
                    </>
                )}
            </div>

            {/* Hero Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-xl mb-8 border border-slate-700/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold mb-3">
                        <ApplicationLogo asLink={false} className="w-4 h-4 rounded shadow-xs" />
                        <span>Bizzhuss Official Documentation & Support</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar Navigation */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
                        <div className="space-y-6">
                            {navigationGroups.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        {group.title}
                                    </h3>
                                    <nav className="space-y-1">
                                        {group.items.map((item, itemIdx) => {
                                            const active = isLinkActive(item.href);
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={itemIdx}
                                                    href={item.href}
                                                    className={`group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                                                        active
                                                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 truncate">
                                                        <Icon
                                                            className={`w-4 h-4 shrink-0 transition-colors ${
                                                                active
                                                                    ? 'text-slate-950'
                                                                    : 'text-slate-400 group-hover:text-slate-700'
                                                            }`}
                                                        />
                                                        <span className="truncate">{item.name}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                                                                active
                                                                    ? 'bg-slate-950 text-white'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}
                        </div>

                        {/* Quick 24/7 Support Box */}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80">
                                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                                    <Headphones className="w-4 h-4 text-amber-500" />
                                    <span>Need Live Assistance?</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                                    Our concierge support is available round the clock.
                                </p>
                                <div className="space-y-1.5 text-xs">
                                    <a
                                        href="tel:18005552499"
                                        className="flex items-center gap-2 text-slate-700 hover:text-amber-600 font-semibold"
                                    >
                                        <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                                        <span>+1 (800) 555-BIZZ</span>
                                    </a>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-bold hover:underline mt-1"
                                    >
                                        <span>Open Support Ticket</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    {children}
                </div>
            </div>
        </StorefrontLayout>
    );
}

export default HelpLayout;
