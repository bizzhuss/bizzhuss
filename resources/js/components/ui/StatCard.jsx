import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendLabel,
    color = 'brand',
}) {
    const iconColors = {
        brand: 'bg-brand-50 text-brand-600 border-brand-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        sky: 'bg-sky-50 text-sky-600 border-sky-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <Card className="hover:border-slate-300 transition-all hover:shadow-md">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    {Icon && (
                        <div className={cn('p-2.5 rounded-xl border', iconColors[color] || iconColors.brand)}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                </div>
                <div className="mt-3">
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
                    {(subtitle || trend) && (
                        <div className="mt-2 flex items-center text-xs">
                            {trend && (
                                <span
                                    className={cn(
                                        'font-semibold mr-1.5',
                                        trend > 0 ? 'text-emerald-600' : 'text-rose-600'
                                    )}
                                >
                                    {trend > 0 ? `+${trend}%` : `${trend}%`}
                                </span>
                            )}
                            <span className="text-slate-500">{trendLabel || subtitle}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
