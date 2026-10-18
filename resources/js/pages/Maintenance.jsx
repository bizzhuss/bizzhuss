import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { 
    Wrench, 
    Clock, 
    Mail, 
    MessageCircle, 
    ShieldCheck, 
    ArrowRight, 
    Sparkles, 
    RefreshCw,
    ExternalLink
} from 'lucide-react';

export default function Maintenance() {
    const socialLinks = [
        {
            name: 'WhatsApp',
            href: 'https://wa.me/923000000000?text=Hello%20Bizzhuss%20Support',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
            ),
            color: 'hover:bg-emerald-600 hover:text-white',
        },
        {
            name: 'Facebook',
            href: 'https://facebook.com',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            color: 'hover:bg-blue-600 hover:text-white',
        },
        {
            name: 'Instagram',
            href: 'https://instagram.com',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
            color: 'hover:bg-gradient-to-tr hover:from-amber-600 hover:to-rose-600 hover:text-white',
        },
        {
            name: 'Twitter / X',
            href: 'https://twitter.com',
            icon: (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: 'hover:bg-slate-800 hover:text-white',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden font-sans">
            <Head title="Store Under Scheduled Maintenance | Bizzhuss" />

            {/* Background Decorative Radial Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-brand-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Bar */}
            <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ApplicationLogo asLink={false} className="h-9 w-auto rounded-xl shadow-md" />
                    <span className="text-xl font-black tracking-tight text-white">
                        Bizzhuss
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        System Upgrade
                    </span>
                </div>
            </header>

            {/* Main Center Hero Card */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-2xl w-full text-center space-y-8 bg-slate-900/90 border border-slate-800/80 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-md">
                    
                    {/* Animated Visual Gear & Wrench Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-brand-500/20 to-sky-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner relative">
                                <Wrench className="w-12 h-12 text-amber-400 animate-pulse transform -rotate-12" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
                                <Clock className="w-4 h-4 text-amber-400" />
                            </div>
                        </div>
                    </div>

                    {/* Headline & Subtitle */}
                    <div className="space-y-3">
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                            Store Under Scheduled Maintenance
                        </h1>
                        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                            We are currently improving your experience with platform enhancements and operational updates. We'll be back shortly!
                        </p>
                    </div>

                    {/* Status Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2">
                        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="text-xs">
                                <p className="font-bold text-white">Data Integrity</p>
                                <p className="text-slate-400 text-[11px]">Orders & wallets securely preserved</p>
                            </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                            <div className="text-xs">
                                <p className="font-bold text-white">Estimated Downtime</p>
                                <p className="text-slate-400 text-[11px]">Resuming service momentarily</p>
                            </div>
                        </div>
                    </div>

                    {/* Direct Contact & WhatsApp CTA Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://wa.me/923000000000?text=Hello%20Bizzhuss%20Support%2C%20inquiring%20about%20scheduled%20maintenance."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-102"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp Support Desk</span>
                        </a>

                        <a
                            href="mailto:support@bizzhuss.com"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
                        >
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>Email Platform Governance</span>
                        </a>
                    </div>

                    {/* Interactive Social Media Channel Links */}
                    <div className="pt-6 border-t border-slate-800/80">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Follow our status updates
                        </p>
                        <div className="flex items-center justify-center gap-2.5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 transition-all shadow-sm ${social.color}`}
                                    title={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer with Discreet Staff / Admin Sign In Link */}
            <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                <p>© {new Date().getFullYear()} Bizzhuss Enterprise Marketplace. All rights reserved.</p>

                <div className="flex items-center gap-4">
                    <span className="text-slate-600">•</span>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
                    >
                        <span>Staff / Admin Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}
