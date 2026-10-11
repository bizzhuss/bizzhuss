import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { TierNavbar } from './TierNavbar';
import { CartDrawer } from './CartDrawer';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { AppProvider, useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, X, Shield, GitBranch, Cpu, Database } from 'lucide-react';

function LayoutInner({ children, title, subtitle }) {
    const { flash } = usePage().props;
    const { notification, showNotification, clearNotification } = useApp();

    useEffect(() => {
        if (flash?.success) {
            showNotification(flash.success, 'success');
        }
        if (flash?.error) {
            showNotification(flash.error, 'error');
        }
    }, [flash]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
            {/* Persistent Top Navigation Bar across all tiers */}
            <TierNavbar />

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-5 right-5 z-50 max-w-md animate-slide-up">
                    <div
                        className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border ${
                            notification.type === 'error'
                                ? 'bg-rose-900 text-rose-100 border-rose-700'
                                : 'bg-slate-900 text-white border-slate-700'
                        }`}
                    >
                        {notification.type === 'error' ? (
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                            <p className="font-semibold">{notification.type === 'error' ? 'Notice' : 'Success'}</p>
                            <p className="mt-0.5 text-slate-300 leading-relaxed">{notification.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={clearNotification}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Page Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Global Slide-over Cart Drawer */}
            <CartDrawer />

            {/* Footer with Enterprise Architecture Summary */}
            <footer className="border-t border-slate-200 bg-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-600">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                <ApplicationLogo asLink={false} className="w-5 h-5 rounded shadow-xs" />
                                <span>Bizzhuss Platform</span>
                            </div>
                            <p className="text-slate-500">
                                Enterprise Multi-Vendor E-Commerce & Workforce Management Engine built on Laravel 11, Inertia.js, and React.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-2">Core Portals</h4>
                            <ul className="space-y-1">
                                <li>Tier 1: Customer Storefront & Catalog</li>
                                <li>Tier 2: Super Admin Platform Operations</li>
                                <li>Tier 3: Vendor Settlement & Inventory</li>
                                <li>Tier 4: Employee Workforce Kanban Board</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-2">Backend Services</h4>
                            <ul className="space-y-1">
                                <li>OrderService: Sub-Order Splitter</li>
                                <li>CommissionService: Fee Ledger</li>
                                <li>PayoutService: ACH / Wire Settlement</li>
                                <li>EmployeeTask: Kanban Dispatch</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-2">Environment</h4>
                            <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Backend:</span>
                                    <span className="font-bold text-slate-800">Laravel 11.56</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Frontend:</span>
                                    <span className="font-bold text-slate-800">React 19 + Inertia</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Styling:</span>
                                    <span className="font-bold text-slate-800">Tailwind CSS 3.4</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                        <p>© 2026 Bizzhuss Enterprise Solutions. All rights reserved.</p>
                        <p className="flex items-center gap-2">
                            <span>Status: Operational</span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export function MainLayout({ children, title, subtitle }) {
    return (
        <AppProvider>
            <LayoutInner title={title} subtitle={subtitle}>
                {children}
            </LayoutInner>
        </AppProvider>
    );
}
