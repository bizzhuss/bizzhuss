import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
    const { flash } = usePage().props;
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const bannerMessage = flash?.error || urlParams?.get('message') || urlParams?.get('error');
    const intendedParam = urlParams?.get('intended') || '';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetUrl = intendedParam ? `/login?intended=${encodeURIComponent(intendedParam)}` : '/login';
        post(targetUrl);
    };



    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
            <Head title="Sign In | Bizzhuss Enterprise Marketplace" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Brand Logo */}
                <div className="flex justify-center">
                    <ApplicationLogo className="h-16 w-16 rounded-2xl shadow-xl hover:scale-105 transition-transform" />
                </div>

                <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
                    Sign In to Your Account
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    Access Customer Orders, Merchant Portal, or Platform Operations Desk
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
                    
                    {/* Notice / Flash Message Banner */}
                    {bannerMessage && (
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                            <span className="font-medium leading-relaxed">{bannerMessage}</span>
                        </div>
                    )}

                    {/* Google OAuth Login */}
                    <a
                        href="/auth/google/redirect"
                        className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Continue with Google</span>
                    </a>

                    <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-slate-800" />
                        <span className="absolute bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            or continue with email
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Email */}
                        <div>
                            <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your-name@domain.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block font-semibold text-slate-300">Password</label>
                                <a href="#" className="text-amber-400 hover:underline text-[11px]">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
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

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400"
                                />
                                <span className="text-slate-400 text-xs">Remember my session</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <span>{processing ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                        Don't have an account yet?{' '}
                        <Link href="/register" className="text-amber-400 font-bold hover:underline">
                            Register now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
