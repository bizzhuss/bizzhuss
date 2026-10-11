import React from 'react';
import { cn } from '@/lib/utils';

export function Input({ label, error, className, id, ...props }) {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={cn(
                    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors duration-150',
                    error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        </div>
    );
}

export function Select({ label, error, children, className, id, ...props }) {
    const selectId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={cn(
                    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors duration-150',
                    error && 'border-rose-300 focus:border-rose-500',
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        </div>
    );
}

export function Textarea({ label, error, className, id, rows = 3, ...props }) {
    const areaId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                id={areaId}
                rows={rows}
                className={cn(
                    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors duration-150 resize-y',
                    error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        </div>
    );
}
