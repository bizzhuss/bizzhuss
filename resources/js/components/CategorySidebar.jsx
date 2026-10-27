import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ShieldCheck, Package } from 'lucide-react';

export default function CategorySidebar({ categories = [], getCategoryIcon, className = '' }) {
    return (
        <div className={`w-full bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col h-[420px] ${className}`}>
            {/* Header */}
            <div className="pb-3 border-b border-slate-100 shrink-0 flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                    CATEGORIES
                </span>
                <Link 
                    href="/shop" 
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                    Browse All
                </Link>
            </div>

            {/* Scrollable Category List */}
            <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {categories && categories.length > 0 ? (
                    categories.map((cat, idx) => {
                        const Icon = getCategoryIcon ? getCategoryIcon(cat.icon) : Package;
                        const CategoryIcon = Icon || Package;
                        return (
                            <Link
                                key={cat.id || cat.slug || idx}
                                href={`/shop?category=${cat.slug || cat.id}`}
                                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition group cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 truncate min-w-0">
                                    <span className="text-slate-400 group-hover:text-brand-600 transition-colors shrink-0">
                                        <CategoryIcon className="w-4 h-4" />
                                    </span>
                                    <span className="truncate">{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                            </Link>
                        );
                    })
                ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                        No categories found
                    </div>
                )}
            </div>

            {/* Footer Badge (Pinned at bottom) */}
            <div className="pt-3 border-t border-slate-100 shrink-0">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Bizzhuss Escrow Assurance</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        100% Authentic products from verified Tier-1 manufacturers.
                    </p>
                </div>
            </div>
        </div>
    );
}
