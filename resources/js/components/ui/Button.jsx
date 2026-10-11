import React from 'react';
import { cn } from '@/lib/utils';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    disabled = false,
    loading = false,
    icon: Icon,
    ...props
}) {
    const variants = {
        primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus-visible:outline-brand-600',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus-visible:outline-slate-600',
        accent: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus-visible:outline-emerald-600',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:outline-rose-600',
        outline: 'border border-brand-300 text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-600',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    };

    const sizes = {
        xs: 'px-2.5 py-1 text-xs font-medium rounded-md gap-1',
        sm: 'px-3 py-1.5 text-xs font-semibold rounded-md gap-1.5',
        md: 'px-3.5 py-2 text-sm font-semibold rounded-lg gap-2',
        lg: 'px-5 py-2.5 text-base font-semibold rounded-lg gap-2.5',
    };

    return (
        <button
            type="button"
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : Icon ? (
                <Icon className={cn('shrink-0', size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-4 h-4')} />
            ) : null}
            {children}
        </button>
    );
}
