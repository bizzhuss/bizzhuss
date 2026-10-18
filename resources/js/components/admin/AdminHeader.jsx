import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Store, 
    Building2, 
    Users, 
    CheckSquare, 
    Settings, 
    ExternalLink,
    Shield,
    Sparkles,
    Flame,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplicationLogo } from '@/components/ApplicationLogo';

export function AdminHeader({ title, subtitle, actions }) {
    const { url, maintenance } = usePage().props;
    const isMaintenanceActive = maintenance?.is_enabled || false;

    const navTabs = [
        {
            name: 'Central Command',
            href: '/admin',
            active: url === '/admin' || url === '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Vendor Oversight',
            href: '/admin/vendors',
            active: url.startsWith('/admin/vendors'),
            icon: Store,
        },
        {
            name: 'Storefront Curation',
            href: '/admin/marketing/curation',
            active: url.startsWith('/admin/marketing/curation') || url.startsWith('/admin/curation'),
            icon: Sparkles,
        },
        {
            name: 'Departments',
            href: '/admin/workforce/departments',
            active: url.startsWith('/admin/workforce/departments'),
            icon: Building2,
        },
        {
            name: 'Workforce Directory',
            href: '/admin/workforce/employees',
            active: url.startsWith('/admin/workforce/employees'),
            icon: Users,
        },
        {
            name: 'Task Delegation & Kanban',
            href: '/admin/workforce/tasks',
            active: url.startsWith('/admin/workforce/tasks'),
            icon: CheckSquare,
        },
        {
            name: 'Platform Settings',
            href: '/admin/settings',
            active: url.startsWith('/admin/settings'),
            icon: Settings,
        },
    ];

    return (
        <div className="mb-8">
            {/* Top Bar with Page Context & Custom Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <ApplicationLogo asLink={false} className="w-8 h-8 rounded-lg shadow-xs" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                    {title}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60">
                                    <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                                    Tier 2 Super Admin
                                </span>
                                {isMaintenanceActive && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                        Site Under Maintenance
                                    </span>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                    {actions}
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Live Storefront</span>
                    </Link>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="mt-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
                <nav className="flex space-x-1 sm:space-x-2" aria-label="Admin Navigation Tabs">
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
export default AdminHeader;
