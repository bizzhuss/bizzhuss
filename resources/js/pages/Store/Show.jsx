import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import {
    Store,
    ShieldCheck,
    MapPin,
    Calendar,
    Star,
    Package,
    Search,
    X,
    Truck,
    Share2,
    Check,
    Phone,
    ArrowLeft,
    SlidersHorizontal,
    PackageOpen,
    Sparkles,
    Award,
    RotateCcw
} from 'lucide-react';

export default function VendorStoreShow({
    vendor = {},
    products = {},
    categories = [],
    stats = {},
    filters = {},
}) {
    const { addToCart, toggleWishlist, isInWishlist, showNotification } = useApp();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'newest');
    const [addedId, setAddedId] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);

    const storeSlug = vendor.slug || vendor.id;
    const productList = Array.isArray(products) ? products : (products?.data || []);
    const pagination = products?.links ? products : null;

    const applyFilters = (overrides = {}) => {
        const nextSearch = overrides.search !== undefined ? overrides.search : searchQuery;
        const nextCategory = overrides.category !== undefined ? overrides.category : selectedCategory;
        const nextSort = overrides.sort !== undefined ? overrides.sort : sortBy;

        router.get(
            `/store/${storeSlug}`,
            {
                search: nextSearch ? nextSearch.trim() : undefined,
                category: nextCategory || undefined,
                sort: nextSort && nextSort !== 'newest' ? nextSort : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const handleCategorySelect = (catSlug) => {
        const next = selectedCategory === catSlug ? '' : catSlug;
        setSelectedCategory(next);
        applyFilters({ category: next });
    };

    const handleSortChange = (e) => {
        const nextSort = e.target.value;
        setSortBy(nextSort);
        applyFilters({ sort: nextSort });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortBy('newest');
        router.get(`/store/${storeSlug}`, {}, { preserveState: true, preserveScroll: true });
    };

    const handleAddToCart = (product, e) => {
        if (e) e.preventDefault();
        const itemWithVendor = {
            ...product,
            vendor: product.vendor || {
                id: vendor.id,
                shop_name: vendor.shop_name,
                slug: vendor.slug,
            },
        };
        const result = addToCart(itemWithVendor, 1);
        if (result !== false) {
            setAddedId(product.id);
            showNotification(`${product.title || product.name} added to cart.`, 'success');
            setTimeout(() => setAddedId(null), 1500);
        }
    };

    const handleToggleWishlist = (product, e) => {
        if (e) e.preventDefault();
        toggleWishlist(product);
    };

    const handleShareStore = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (url && navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedLink(true);
            showNotification('Storefront link copied to clipboard!', 'success');
            setTimeout(() => setCopiedLink(false), 2500);
        }
    };

    const hasActiveFilters = Boolean(filters.search || filters.category || (filters.sort && filters.sort !== 'newest'));

    return (
        <StorefrontLayout>
            <Head title={`${vendor.shop_name || 'Official Store'} | Bizzhuss Marketplace`} />

            {/* Breadcrumb Back Navigation */}
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <Link href="/shop" className="inline-flex items-center gap-1 hover:text-brand-600 font-semibold transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Marketplace Products</span>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400">Official Stores</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                        {vendor.shop_name}
                    </span>
                </div>
            </div>

            {/* 1. Store Hero Banner & Identity Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-8">
                {/* Cover Banner */}
                <div className="h-44 sm:h-60 w-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
                    {vendor.banner ? (
                        <img src={vendor.banner} alt={vendor.shop_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-2xl sm:text-3xl uppercase tracking-widest opacity-25 select-none px-4 text-center">
                            {vendor.shop_name}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

                    {/* Top Right Badges on Banner */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Official Store</span>
                        </span>
                        <button
                            type="button"
                            onClick={handleShareStore}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition shadow-sm cursor-pointer"
                            title="Copy Storefront Link"
                        >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-700" />}
                            <span>{copiedLink ? 'Link Copied' : 'Share Store'}</span>
                        </button>
                    </div>
                </div>

                {/* Profile Details Container (Below Banner) */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        {/* Avatar + Store Identity Info */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                            {/* ONLY the Avatar floats over the banner */}
                            <div className="-mt-14 sm:-mt-16 shrink-0 z-10">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-lg border-2 border-white overflow-hidden">
                                    {(vendor.avatar || vendor.logo) ? (
                                        <img
                                            src={vendor.avatar || vendor.logo}
                                            alt={vendor.shop_name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-2xl rounded-xl">
                                            {(vendor.shop_name || 'S').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Store Name, Badges & Meta (Completely clear of the dark banner) */}
                            <div className="pt-2 sm:pt-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {vendor.shop_name}
                                    </h1>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        <Award className="w-3 h-3 text-blue-600" />
                                        <span>Flagship Merchant</span>
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                                    {(stats.city || vendor.city) && (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{stats.city || vendor.city}</span>
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Member since {stats.joined_date || 'Nov 2026'}</span>
                                    </span>
                                    {(vendor.support_phone || vendor.phone) && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{vendor.support_phone || vendor.phone}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="shrink-0 mb-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                <span>{stats.rating || '4.9'} / 5.0 ({stats.positive_rating || '99%'} Positive)</span>
                            </div>
                        </div>
                    </div>

                    {/* Store Bio Description */}
                    {vendor.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-4 max-w-4xl leading-relaxed">
                            {vendor.description}
                        </p>
                    )}

                    {/* 2. Merchant Trust & Performance Stats Strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Catalog</div>
                                <div className="text-sm sm:text-base font-black text-slate-900">
                                    {stats.total_products || 0} Products
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Time Dispatch</div>
                                <div className="text-sm sm:text-base font-black text-slate-900">
                                    {stats.ship_on_time || '100%'} SLA
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller Rating</div>
                                <div className="text-sm sm:text-base font-black text-slate-900">
                                    {stats.rating || '4.9'} ({stats.positive_rating || '99%'})
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response Rate</div>
                                <div className="text-sm sm:text-base font-black text-slate-900">
                                    {stats.response_rate || '98%'} Quick Reply
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Vendor-Only Product Catalog Toolbar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-brand-500" />
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Store Product Catalog
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Showing {productList.length} of {products?.total ?? productList.length} verified items exclusively from {vendor.shop_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {/* In-Store Search */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search in ${vendor.shop_name}...`}
                                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        applyFilters({ search: '' });
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                    title="Clear Search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-500 cursor-pointer"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="popular">Best Selling</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Store-Scoped Category Filter Pills */}
                {categories.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 pb-1">
                        <button
                            type="button"
                            onClick={() => handleCategorySelect('')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                !selectedCategory
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All Store Items ({stats.total_products || productList.length})
                        </button>

                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat.slug || selectedCategory === cat.id || selectedCategory === cat.name;
                            return (
                                <button
                                    key={cat.id || cat.slug}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.slug || cat.id)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                        isActive
                                            ? 'bg-brand-500 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="ml-auto px-3 py-1.5 rounded-full text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 whitespace-nowrap transition-colors cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Vendor Product Catalog Grid */}
            {productList.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8">
                        {productList.map((product) => (
                            <ProductCard
                                key={product.id || product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={handleToggleWishlist}
                                isAdded={addedId === (product.id || product._id)}
                                isInWishlist={isInWishlist(product.id || product._id)}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination && pagination.links && pagination.links.length > 3 && (
                        <div className="pt-2 pb-8 flex flex-wrap items-center justify-center gap-1.5">
                            {pagination.links.map((link, idx) => {
                                const isCurrent = link.active;
                                const isUrl = Boolean(link.url);
                                const cleanLabel = link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»');

                                if (!isUrl) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 select-none opacity-50"
                                            dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                            isCurrent
                                                ? 'bg-brand-500 text-white shadow-xs'
                                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* Empty Catalog State */
                <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                        <PackageOpen className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">
                            {hasActiveFilters ? 'No Matching Store Products' : 'Store Inventory Updating'}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {hasActiveFilters
                                ? `No items matched your filter criteria inside ${vendor.shop_name}. Try clearing your search or category filter.`
                                : `${vendor.shop_name} has not published live products in this catalog yet. Check back soon or explore other marketplace merchants.`}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                                Clear Store Filters
                            </button>
                        ) : (
                            <Link
                                href="/shop"
                                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-colors"
                            >
                                Explore Full Marketplace
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* 5. Store Guarantees & Return Policy Footer Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-10 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Bizzhuss Escrow & Return Protection</span>
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight">
                        Shop Safely with {vendor.shop_name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {vendor.return_policy || 'Every purchase from this verified storefront is protected by Bizzhuss Buyer Protection, genuine quality inspection, and automated dispatch tracking.'}
                    </p>
                </div>

                <div className="flex flex-wrap md:justify-end gap-3 text-xs">
                    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                        <RotateCcw className="w-4 h-4 text-brand-400 shrink-0" />
                        <div>
                            <div className="font-bold text-white">7-Day Return Policy</div>
                            <div className="text-[10px] text-slate-400">Platform mediated claims</div>
                        </div>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                            <div className="font-bold text-white">Verified Dispatch</div>
                            <div className="text-[10px] text-slate-400">City-wise tracked courier</div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
