import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShieldAlert, 
    FileQuestion, 
    ServerCrash, 
    Clock, 
    AlertTriangle, 
    ArrowLeft, 
    Home, 
    LogIn, 
    LifeBuoy 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApplicationLogo } from '@/components/ApplicationLogo';

export default function ErrorPage({ status = 404, message = null }) {
    const errorConfigs = {
        403: {
            title: '403: Access Restricted',
            subtitle: 'Permission Denied',
            description: message || 'You do not have the required role or authorization privileges to access this secure zone or resource.',
            icon: ShieldAlert,
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            iconColor: 'text-rose-600',
            iconBg: 'bg-rose-100',
        },
        404: {
            title: '404: Page Not Found',
            subtitle: 'Resource Relocated or Missing',
            description: message || 'The URL you requested could not be found on the Bizzhuss network. It may have been renamed, moved, or deleted.',
            icon: FileQuestion,
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-100',
        },
        500: {
            title: '500: Internal Server Error',
            subtitle: 'System Exception Encountered',
            description: message || 'An unexpected server condition occurred while processing your request. Our automated diagnostics have logged this incident.',
            icon: ServerCrash,
            badgeColor: 'bg-red-50 text-red-700 border-red-200',
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
        },
        503: {
            title: '503: Service Unavailable',
            subtitle: 'Scheduled Maintenance',
            description: message || 'The platform is currently undergoing scheduled operational updates. Please check back shortly.',
            icon: Clock,
            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
        },
    };

    const config = errorConfigs[status] || {
        title: `${status}: Unexpected Incident`,
        subtitle: 'Request Failed',
        description: message || 'An unexpected condition prevented the system from fulfilling your request.',
        icon: AlertTriangle,
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        iconColor: 'text-slate-600',
        iconBg: 'bg-slate-100',
    };

    const IconComponent = config.icon;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 antialiased font-sans">
            <Head title={`${config.title} - Bizzhuss Enterprise`} />

            {/* Header */}
            <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <ApplicationLogo asLink={false} className="w-8 h-8 rounded-lg shadow-xs" />
                    <span className="font-black text-lg tracking-tight text-slate-900">Bizzhuss</span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                    </Link>
                </div>
            </header>

            {/* Error Card Body */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-8 text-center sm:p-10">
                    {/* Status Badge & Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 shadow-sm border border-slate-200/60 bg-slate-50">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
                            <IconComponent className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.badgeColor}`}>
                            {config.subtitle}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {config.title}
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto pt-1">
                            {config.description}
                        </p>
                    </div>

                    {/* Operational Support Links */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button variant="primary" icon={Home} className="w-full sm:w-auto">
                                Return to Storefront
                            </Button>
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Go Back
                        </button>
                    </div>

                    {/* Helpdesk Footer */}
                    <div className="mt-6 pt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                        <LifeBuoy className="w-3.5 h-3.5" />
                        <span>Need assistance? Contact</span>
                        <a href="mailto:support@bizzhuss.com" className="text-brand-600 hover:underline font-medium">
                            support@bizzhuss.com
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
                &copy; {new Date().getFullYear()} Bizzhuss Enterprise. All rights reserved.
            </footer>
        </div>
    );
}
