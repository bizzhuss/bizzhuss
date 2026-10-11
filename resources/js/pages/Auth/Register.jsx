import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { 
    Layers, 
    Lock, 
    Mail, 
    User, 
    Store, 
    Phone, 
    ArrowRight, 
    ShieldCheck, 
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';

export default function Register() {
    // Detect role from URL query param if present (?role=vendor)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const defaultRole = urlParams?.get('role') === 'vendor' ? 'vendor' : 'customer';

    const [activeTab, setActiveTab] = useState(defaultRole);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: defaultRole,
        phone: '',
        shop_name: '',
    });

    const handleTabChange = (role) => {
        setActiveTab(role);
        setData('role', role);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
            <Head title="Create Account | Bizzhuss Marketplace" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center">
                    <ApplicationLogo className="h-16 w-16 rounded-2xl shadow-xl hover:scale-105 transition-transform" />
                </div>

                <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
                    Create Your Account
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    Join thousands of buyers and verified suppliers on Bizzhuss
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
                    
                    {/* Role Toggle Tabs */}
                    <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                        <button
                            type="button"
                            onClick={() => handleTabChange('customer')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'customer'
                                    ? 'bg-amber-400 text-slate-950 shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Join as Customer</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('vendor')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'vendor'
                                    ? 'bg-amber-400 text-slate-950 shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Store className="w-3.5 h-3.5" />
                            <span>Become a Seller</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Full Name */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">
                                {activeTab === 'vendor' ? 'Merchant Contact Name *' : 'Full Name *'}
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.name}</p>
                            )}
                        </div>

                        {/* Vendor-Specific: Shop Name */}
                        {activeTab === 'vendor' && (
                            <div>
                                <label className="block font-semibold text-slate-300 mb-1">
                                    Official Shop / Business Name *
                                </label>
                                <div className="relative">
                                    <Store className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={data.shop_name}
                                        onChange={(e) => setData('shop_name', e.target.value)}
                                        placeholder="e.g. Apex Machinery & Tools"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                    />
                                </div>
                                {errors.shop_name && (
                                    <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.shop_name}</p>
                                )}
                            </div>
                        )}

                        {/* Email Address */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">Business Email Address *</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@company.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone Number (Optional for customer, required for vendor) */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">
                                Phone Number {activeTab === 'vendor' ? '*' : '(Optional)'}
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    required={activeTab === 'vendor'}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.phone}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.password}</p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                            </div>
                        </div>

                        {/* Vendor Commission Terms Notice */}
                        {activeTab === 'vendor' && (
                            <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-[11px] text-amber-300 space-y-1">
                                <div className="font-bold flex items-center gap-1 text-amber-400">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Merchant Commission Agreement</span>
                                </div>
                                <p className="text-slate-300">
                                    Standard 10% platform fee applies only upon completed orders. Real-time ACH/wire disbursement runs twice monthly.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <span>{processing ? 'Creating Account...' : (activeTab === 'vendor' ? 'Register as Merchant Seller' : 'Create Free Customer Account')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-amber-400 font-bold hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
