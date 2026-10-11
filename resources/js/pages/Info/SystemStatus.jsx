import React, { useState } from 'react';
import { HelpLayout } from '@/Layouts/HelpLayout';
import {
    Activity,
    CheckCircle2,
    Clock,
    Server,
    ShieldCheck,
    Cpu,
    Database,
    Zap,
    RefreshCw,
    Bell,
    CheckCircle
} from 'lucide-react';

const SERVICES = [
    {
        name: 'Storefront Catalog & Search API',
        group: 'Tier 1 Customer Experience',
        status: 'Operational',
        uptime: '99.99%',
        latency: '42ms',
        icon: Zap,
    },
    {
        name: 'Multi-Vendor Sub-Order Routing Engine',
        group: 'OrderService Decomposition',
        status: 'Operational',
        uptime: '99.97%',
        latency: '68ms',
        icon: Cpu,
    },
    {
        name: 'Payment Gateway Vault & Escrow Ledger',
        group: 'PCI-DSS & Financial Settlement',
        status: 'Operational',
        uptime: '100.00%',
        latency: '115ms',
        icon: ShieldCheck,
    },
    {
        name: 'Merchant Inventory & Real-Time Sync',
        group: 'Tier 3 Vendor Central Engine',
        status: 'Operational',
        uptime: '99.95%',
        latency: '54ms',
        icon: Database,
    },
    {
        name: 'Logistics Carrier Webhook Dispatcher',
        group: 'Freight Line-Haul Telemetry',
        status: 'Operational',
        uptime: '99.92%',
        latency: '89ms',
        icon: Server,
    },
    {
        name: 'Super Admin Command & Workforce Queues',
        group: 'Tier 2 & 4 Internal Operations',
        status: 'Operational',
        uptime: '99.98%',
        latency: '38ms',
        icon: Activity,
    },
];

const RECENT_INCIDENTS = [
    {
        date: 'September 24, 2026',
        title: 'Scheduled Regional Carrier API Maintenance',
        status: 'Resolved',
        duration: '18 minutes',
        desc: 'Third-party carrier logistics webhook gateway underwent scheduled database maintenance. All sub-order tracking events were queued and processed without data loss.',
    },
    {
        date: 'September 18, 2026',
        title: 'Redis Cache Cluster Scaling Event',
        status: 'Resolved',
        duration: '6 minutes',
        desc: 'Automated horizontal autoscaling triggered during a high-traffic flash sale event. System response times returned to normal baseline immediately.',
    },
    {
        date: 'September 08, 2026',
        title: 'Routine Database Optimization & Indexing',
        status: 'Resolved',
        duration: '25 minutes',
        desc: 'Zero-downtime database optimization executed successfully on master PostgreSQL replication nodes.',
    },
];

export default function SystemStatus() {
    const [lastChecked, setLastChecked] = useState('Just now');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [email, setEmail] = useState('');

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            setLastChecked(new Date().toLocaleTimeString());
        }, 600);
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
        }
    };

    return (
        <HelpLayout
            title="Live Platform Status & Service Health"
            subtitle="Real-time operational telemetry, API uptime metrics, latency benchmarks, and incident history."
            categoryName="Platform Operations"
            currentKey="status"
            breadcrumbs={[{ label: 'System Status' }]}
        >
            {/* Overall System Health Status Banner */}
            <div className="bg-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>All Systems Fully Operational</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black">99.98% Platform Uptime</h2>
                    <p className="text-xs md:text-sm text-emerald-100 max-w-xl leading-relaxed">
                        All customer storefront services, vendor portals, automated order splitting services, and payment escrow ledgers are functioning normally.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-50 transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh Telemetry</span>
                    </button>
                </div>
            </div>

            {/* Individual Services Status Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Service Infrastructure Breakdown</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Live metrics polled every 60 seconds. Last checked: {lastChecked}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
                        100% Operational
                    </span>
                </div>

                <div className="space-y-3">
                    {SERVICES.map((srv, idx) => {
                        const Icon = srv.icon;
                        return (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{srv.name}</h4>
                                        <span className="text-[11px] text-slate-500">{srv.group}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-xs shrink-0 self-end sm:self-auto">
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Uptime (30d)</span>
                                        <span className="font-mono font-bold text-slate-900">{srv.uptime}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Avg Latency</span>
                                        <span className="font-mono font-bold text-slate-900">{srv.latency}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>{srv.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Incident History Log */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Past Incident & Maintenance Log</h3>
                <p className="text-xs text-slate-500 mb-6">Historical record of platform maintenance windows and resolutions.</p>

                <div className="space-y-4">
                    {RECENT_INCIDENTS.map((inc, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        {inc.status}
                                    </span>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{inc.title}</h4>
                                </div>
                                <span className="text-[11px] font-mono text-slate-500">{inc.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{inc.desc}</p>
                            <div className="text-[11px] text-slate-400 font-medium">
                                Maintenance Window Duration: {inc.duration}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscribe to Status Alerts */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">Subscribe to Uptime & Maintenance Alerts</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Get automated webhook or email notices before scheduled maintenance windows.
                        </p>
                    </div>
                </div>

                {subscribed ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-800">
                        Subscribed to Platform Alerts!
                    </span>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alerts@company.com"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
            </div>
        </HelpLayout>
    );
}
