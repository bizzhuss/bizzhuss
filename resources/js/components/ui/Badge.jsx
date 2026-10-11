import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ children, variant = 'default', className, ...props }) {
    const variants = {
        default: 'bg-slate-100 text-slate-800 border-slate-200',
        brand: 'bg-brand-50 text-brand-700 border-brand-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        blue: 'bg-sky-50 text-sky-700 border-sky-200',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export function StatusBadge({ status, className }) {
    const map = {
        // Statuses
        active: { variant: 'success', label: 'Active' },
        approved: { variant: 'success', label: 'Approved' },
        completed: { variant: 'success', label: 'Completed' },
        paid: { variant: 'success', label: 'Paid' },
        cleared: { variant: 'success', label: 'Cleared' },
        
        pending: { variant: 'warning', label: 'Pending' },
        processing: { variant: 'blue', label: 'Processing' },
        in_progress: { variant: 'blue', label: 'In Progress' },
        review: { variant: 'purple', label: 'Review' },
        todo: { variant: 'default', label: 'To Do' },
        
        urgent: { variant: 'danger', label: 'Urgent' },
        high: { variant: 'danger', label: 'High' },
        medium: { variant: 'warning', label: 'Medium' },
        low: { variant: 'default', label: 'Low' },
        
        rejected: { variant: 'danger', label: 'Rejected' },
        cancelled: { variant: 'danger', label: 'Cancelled' },
        out_of_stock: { variant: 'danger', label: 'Out of Stock' },
    };

    const s = map[status?.toLowerCase()] || { variant: 'default', label: status || 'Unknown' };

    return (
        <Badge variant={s.variant} className={className}>
            {s.label}
        </Badge>
    );
}

export function PriorityBadge({ priority, className }) {
    return <StatusBadge status={priority} className={className} />;
}
