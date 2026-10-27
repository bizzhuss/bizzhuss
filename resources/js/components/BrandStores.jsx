import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Store, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function BrandStores({ stores = [] }) {
    const sliderRef = useRef(null);

    const slideLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const slideRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Audited Marketplace Merchants
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
                        Official Certified Brand Stores
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                        Each vendor is vetted for SLA fulfillment, strict product authenticity, and automated split-order disbursement.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-2">
                        <button
                            type="button"
                            onClick={slideLeft}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer"
                            aria-label="Previous Stores"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={slideRight}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer"
                            aria-label="Next Stores"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        href="/register?role=vendor"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20 cursor-pointer shrink-0"
                    >
                        <Store className="w-4 h-4" />
                        <span>Open a Store on Bizzhuss</span>
                    </Link>
                </div>
            </div>

            <div 
                ref={sliderRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {stores && stores.length > 0 ? (
                    stores.map((store, index) => (
                        <div
                            key={store.id || store.slug || index}
                            className="w-[280px] sm:w-[320px] shrink-0 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <h3 className="font-bold text-base text-white truncate">
                                        {store.shop_name || store.name || `Store #${index + 1}`}
                                    </h3>
                                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                        ★ Verified Store
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6">
                                    {store.description || "Official verified vendor merchant storefront on Bizzhuss."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/40">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Active Store
                                </span>
                                <Link
                                    href={`/shop?vendor=${store.slug || store.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 group-hover:translate-x-1 transition-transform"
                                >
                                    <span>Visit Store</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-slate-400 text-xs">No vendor stores active yet.</div>
                )}
            </div>
        </section>
    );
}
