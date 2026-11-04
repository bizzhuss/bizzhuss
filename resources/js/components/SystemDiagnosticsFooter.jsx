import React from 'react';
import { usePage } from '@inertiajs/react';

export default function SystemDiagnosticsFooter() {
    const { auth } = usePage().props;

    // Only allow logged-in users with role 'super_admin' to see this section
    const isSuperAdmin = auth?.user && (
        auth.user.role === 'super_admin' || 
        auth.user.is_super_admin === true ||
        auth.user.email === 'haseeb@bizzhuss.com' ||
        auth.user.email === 'haseebkhanuddin44@gmail.com' ||
        auth.user.permissions?.includes('*')
    );

    if (!isSuperAdmin) {
        return null; // Normal users, customers, and guests ke liye completely hidden
    }

    return (
        <div className="w-full border-b border-slate-200/70 bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Core Portals */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                        Core Portals
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
                        <li>Tier 1: Customer Storefront & Catalog</li>
                        <li>Tier 2: Super Admin Platform Operations</li>
                        <li>Tier 3: Vendor Settlement & Inventory</li>
                        <li>Tier 4: Employee Workforce Kanban Board</li>
                    </ul>
                </div>

                {/* Backend Services */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                        Backend Services
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
                        <li>OrderService: Sub-Order Splitter</li>
                        <li>CommissionService: Fee Ledger</li>
                        <li>PayoutService: ACH / Wire Settlement</li>
                        <li>EmployeeTask: Kanban Dispatch</li>
                    </ul>
                </div>

                {/* Environment */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                        Environment
                    </h4>
                    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>Backend:</span>
                            <span className="font-bold text-slate-800">Laravel 11.56</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>Frontend:</span>
                            <span className="font-bold text-slate-800">React 19 + Inertia</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>Styling:</span>
                            <span className="font-bold text-slate-800">Tailwind CSS 3.4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { SystemDiagnosticsFooter };
