import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
    Search, 
    Filter, 
    SlidersHorizontal, 
    ChevronDown, 
    ChevronRight, 
    Star, 
    Heart, 
    ShoppingCart, 
    Check, 
    X, 
    Grid3X3, 
    LayoutGrid, 
    List, 
    Store, 
    ArrowUpDown, 
    CheckCircle2, 
    Clock, 
    Tag, 
    ShieldCheck, 
    Flame, 
    Layers, 
    PackageOpen,
    Eye
} from 'lucide-react';

export default function Shop({ 
    products = { data: [], links: [], total: 0, from: 0, to: 0, current_page: 1, last_page: 1 }, 
    categories = [], 
    vendors = [], 
    filters = {} 
}) {
    const { auth } = usePage().props;
    const { addToCart, toggleWishlist, isInWishlist, showNotification } = useApp();

    // UI state
    const [viewMode, setViewMode] = useState('grid-4'); // 'grid-3', 'grid-4', 'list'
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [vendorSearch, setVendorSearch] = useState('');
    const [addedIds, setAddedIds] = useState({});

    // Filter local form state
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [inStockOnly, setInStockOnly] = useState(filters.in_stock === '1' || filters.in_stock === true || filters.in_stock === 'true');
    const [selectedRating, setSelectedRating] = useState(filters.rating || '');

    // Active Category and Vendor selection parsed from filters
    const activeCategories = useMemo(() => {
        if (!filters.categories && !filters.category) return [];
        if (filters.categories) {
            return Array.isArray(filters.categories) ? filters.categories : filters.categories.split(',');
        }
        return [filters.category];
    }, [filters.categories, filters.category]);

    const activeVendors = useMemo(() => {
        if (!filters.vendors && !filters.vendor) return [];
        if (filters.vendors) {
            return Array.isArray(filters.vendors) 
                ? filters.vendors.map(String) 
                : filters.vendors.split(',').map(String);
        }
        return [String(filters.vendor)];
    }, [filters.vendors, filters.vendor]);

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (activeCategories.length > 0) count += activeCategories.length;
        if (activeVendors.length > 0) count += activeVendors.length;
        if (filters.min_price || filters.max_price) count += 1;
        if (filters.in_stock) count += 1;
        if (filters.rating) count += 1;
        if (filters.search) count += 1;
        return count;
    }, [activeCategories, activeVendors, filters]);

    // Apply URL filter change
    const updateFilters = (newFilters) => {
        const merged = {
            ...filters,
            ...newFilters,
        };

        // Remove empty or undefined keys
        Object.keys(merged).forEach((key) => {
            if (merged[key] === '' || merged[key] === null || merged[key] === undefined || (Array.isArray(merged[key]) && merged[key].length === 0)) {
                delete merged[key];
            }
        });

        // Stringify arrays if present
        if (Array.isArray(merged.categories)) {
            merged.categories = merged.categories.join(',');
        }
        if (Array.isArray(merged.vendors)) {
            merged.vendors = merged.vendors.join(',');
        }

        router.get('/shop', merged, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Category Toggle
    const handleCategoryToggle = (slugOrId) => {
        let updated;
        const target = String(slugOrId);
        if (activeCategories.includes(target)) {
            updated = activeCategories.filter(c => c !== target);
        } else {
            updated = [...activeCategories, target];
        }
        updateFilters({ categories: updated, category: undefined });
    };

    // Vendor Toggle
    const handleVendorToggle = (vendorId) => {
        let updated;
        const target = String(vendorId);
        if (activeVendors.includes(target)) {
            updated = activeVendors.filter(v => v !== target);
        } else {
            updated = [...activeVendors, target];
        }
        updateFilters({ vendors: updated, vendor: undefined });
    };

    // Apply Price Filter
    const handleApplyPrice = (e) => {
        if (e) e.preventDefault();
        updateFilters({
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        });
    };

    // Quick Price Preset
    const handlePricePreset = (min, max) => {
        setMinPrice(min ? String(min) : '');
        setMaxPrice(max ? String(max) : '');
        updateFilters({
            min_price: min || undefined,
            max_price: max || undefined,
        });
    };

    // In-Stock Toggle
    const handleInStockToggle = (checked) => {
        setInStockOnly(checked);
        updateFilters({ in_stock: checked ? '1' : undefined });
    };

    // Rating Filter
    const handleRatingSelect = (rating) => {
        const next = selectedRating === String(rating) ? '' : String(rating);
        setSelectedRating(next);
        updateFilters({ rating: next || undefined });
    };

    // Sort Change
    const handleSortChange = (e) => {
        updateFilters({ sort: e.target.value });
    };

    // Clear All Filters
    const handleClearAll = () => {
        setMinPrice('');
        setMaxPrice('');
        setInStockOnly(false);
        setSelectedRating('');
        router.get('/shop', {}, { preserveState: true });
    };

    // Toggle Accordion Group
    const toggleAccordion = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    // Filter Vendors by Local Search
    const filteredVendorsList = useMemo(() => {
        if (!vendorSearch.trim()) return vendors;
        return vendors.filter(v => 
            v.shop_name?.toLowerCase().includes(vendorSearch.toLowerCase())
        );
    }, [vendors, vendorSearch]);

    // Handle Wishlist Toggle
    const handleToggleWishlist = (product) => {
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        const added = toggleWishlist(product);
        showNotification(
            added ? `Added "${product.title}" to Wishlist!` : `Removed "${product.title}" from Wishlist!`,
            added ? 'success' : 'info'
        );
    };

    // Handle Add to Cart
    const handleAddToCart = (product) => {
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        const cartItem = {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: Number(product.price),
            compare_price: product.compare_price ? Number(product.compare_price) : null,
            image: getProductImage(product),
            vendor: product.vendor ? {
                id: product.vendor.id,
                name: product.vendor.shop_name || 'Verified Merchant',
                shop_name: product.vendor.shop_name || 'Verified Merchant',
                commission_rate: product.vendor.commission_rate || 10,
            } : {
                id: 1,
                name: 'Verified Merchant',
                shop_name: 'Verified Merchant',
                commission_rate: 10,
            }
        };

        addToCart(cartItem, 1);
        setAddedIds(prev => ({ ...prev, [product.id]: true }));
        showNotification(`Added "${product.title}" to cart!`, 'success');

        setTimeout(() => {
            setAddedIds(prev => ({ ...prev, [product.id]: false }));
        }, 1800);
    };

    // Helper: Safe Image resolver
    const getProductImage = (prod) => {
        if (prod.image) return prod.image;
        if (Array.isArray(prod.images) && prod.images.length > 0) return prod.images[0];
        if (typeof prod.images === 'string') {
            try {
                const parsed = JSON.parse(prod.images);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
            } catch {
                return prod.images;
            }
        }
        return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
    };

    // Reusable Sidebar Filter Content
    const renderFilterSidebar = () => (
        <div className="space-y-6 text-xs text-slate-700">
            {/* Filter Header & Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                    <span className="font-black text-slate-900 text-sm tracking-tight">Filter Products</span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold text-[10px]">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                        Reset All
                    </button>
                )}
            </div>

            {/* In-Stock Only Switch */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div>
                    <label htmlFor="inStockToggle" className="font-bold text-slate-800 cursor-pointer text-xs block">
                        In-Stock Only
                    </label>
                    <span className="text-[10px] text-slate-500 block">Exclude out-of-stock items</span>
                </div>
                <input
                    id="inStockToggle"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => handleInStockToggle(e.target.checked)}
                    className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-400 cursor-pointer"
                />
            </div>

            {/* Category & Subcategory Accordion */}
            <div className="space-y-3 pb-5 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Departments & Categories</span>
                </h4>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {categories.map((cat) => {
                        const hasSub = (cat.subcategories && cat.subcategories.length > 0) || (cat.children && cat.children.length > 0);
                        const subList = cat.subcategories || cat.children || [];
                        const isExpanded = !!expandedCategories[cat.id];
                        const isChecked = activeCategories.includes(cat.slug) || activeCategories.includes(String(cat.id));

                        return (
                            <div key={cat.id} className="space-y-1">
                                <div className="flex items-center justify-between hover:bg-slate-100/70 p-1.5 rounded-lg transition-colors">
                                    <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCategoryToggle(cat.slug)}
                                            className="w-3.5 h-3.5 text-brand-500 rounded border-slate-300 focus:ring-brand-400 cursor-pointer"
                                        />
                                        <span className={`text-xs ${isChecked ? 'font-black text-brand-700' : 'font-medium text-slate-700'}`}>
                                            {cat.name}
                                        </span>
                                    </label>

                                    {hasSub && (
                                        <button
                                            type="button"
                                            onClick={() => toggleAccordion(cat.id)}
                                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded"
                                        >
                                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </div>

                                {/* Subcategories Accordion */}
                                {hasSub && isExpanded && (
                                    <div className="pl-6 space-y-1 py-1 border-l-2 border-slate-200 ml-3">
                                        {subList.map((sub) => {
                                            const isSubChecked = activeCategories.includes(sub.slug) || activeCategories.includes(String(sub.id));
                                            return (
                                                <label key={sub.id} className="flex items-center gap-2 cursor-pointer py-1 select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSubChecked}
                                                        onChange={() => handleCategoryToggle(sub.slug)}
                                                        className="w-3 h-3 text-brand-500 rounded border-slate-300 focus:ring-brand-400 cursor-pointer"
                                                    />
                                                    <span className={`text-[11px] ${isSubChecked ? 'font-bold text-brand-700' : 'text-slate-600'}`}>
                                                        {sub.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Range Slider & Inputs */}
            <div className="space-y-3 pb-5 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Price Range ($)
                </h4>

                {/* Quick Price Range Chips */}
                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => handlePricePreset(0, 25000)}
                        className="px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 rounded-md text-[10px] font-semibold transition-colors"
                    >
                        Under Rs. 25k
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePricePreset(25000, 100000)}
                        className="px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 rounded-md text-[10px] font-semibold transition-colors"
                    >
                        Rs. 25k – 100k
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePricePreset(100000, 500000)}
                        className="px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 rounded-md text-[10px] font-semibold transition-colors"
                    >
                        Rs. 100k+
                    </button>
                </div>

                <form onSubmit={handleApplyPrice} className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2 text-slate-400 text-[10px] font-bold">Rs.</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-400"
                            />
                        </div>
                        <span className="text-slate-400 text-xs">–</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2 text-slate-400 text-[10px] font-bold">Rs.</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                        Apply Price
                    </button>
                </form>
            </div>

            {/* Brand / Vendor Filter */}
            <div className="space-y-3 pb-5 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Verified Merchants & Brands</span>
                </h4>

                {/* Vendor Search */}
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        placeholder="Search merchant..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-400"
                    />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredVendorsList.map((vendor) => {
                        const isVendorChecked = activeVendors.includes(String(vendor.id)) || activeVendors.includes(vendor.slug);
                        return (
                            <label key={vendor.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 select-none">
                                <input
                                    type="checkbox"
                                    checked={isVendorChecked}
                                    onChange={() => handleVendorToggle(vendor.id)}
                                    className="w-3.5 h-3.5 text-brand-500 rounded border-slate-300 focus:ring-brand-400 cursor-pointer"
                                />
                                <span className={`text-xs ${isVendorChecked ? 'font-bold text-brand-700' : 'text-slate-700'}`}>
                                    {vendor.shop_name}
                                </span>
                            </label>
                        );
                    })}
                    {filteredVendorsList.length === 0 && (
                        <p className="text-[11px] text-slate-400 py-1">No merchants found.</p>
                    )}
                </div>
            </div>

            {/* Customer Ratings Filter */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Customer Rating
                </h4>

                <div className="space-y-1.5">
                    <button
                        type="button"
                        onClick={() => handleRatingSelect(4)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                            selectedRating === '4' ? 'bg-amber-50 border border-amber-200 font-bold' : 'hover:bg-slate-100'
                        }`}
                    >
                        <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                            <Star className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <span className="text-xs text-slate-700">& Above (4.0+)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRatingSelect(3)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                            selectedRating === '3' ? 'bg-amber-50 border border-amber-200 font-bold' : 'hover:bg-slate-100'
                        }`}
                    >
                        <div className="flex items-center text-amber-400">
                            {[1, 2, 3].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                            <Star className="w-3.5 h-3.5 text-slate-300" />
                            <Star className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <span className="text-xs text-slate-700">& Above (3.0+)</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <StorefrontLayout>
            <Head title="Shop All Products | Bizzhuss Enterprise Marketplace" />

            {/* Breadcrumb & Catalog Banner */}
            <div className="mb-6 space-y-3">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">Shop Catalog</span>
                    {filters.search && (
                        <>
                            <span>/</span>
                            <span className="text-brand-600">Search: &ldquo;{filters.search}&rdquo;</span>
                        </>
                    )}
                </div>

                {/* Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
                    <div className="relative z-10 max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>100% Certified Manufacturer Catalog</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Marketplace Equipment & Catalog
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Filter across industrial telemetry, high-density server racks, pneumatic tooling, and premium executive workspace appointments.
                        </p>
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-center">
                        <Layers className="w-64 h-64 text-brand-400" />
                    </div>
                </div>
            </div>

            {/* Main Content: Sidebar + Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs sticky top-20">
                    {renderFilterSidebar()}
                </aside>

                {/* Mobile Filter Modal */}
                {isMobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                        <div className="ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                    <h3 className="font-bold text-slate-900 text-sm">Filter Catalog</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileFiltersOpen(false)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {renderFilterSidebar()}
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                                >
                                    Apply & View Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Results Column */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Top Action Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Total Count & Mobile Filter Trigger */}
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                            >
                                <Filter className="w-4 h-4 text-brand-500" />
                                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                            </button>

                            <div className="text-xs text-slate-600 font-medium">
                                Showing <strong className="text-slate-900 font-black">{products.from || (products.data?.length > 0 ? 1 : 0)}</strong>–<strong className="text-slate-900 font-black">{products.to || products.data?.length || 0}</strong> of <strong className="text-slate-900 font-black">{products.total || products.data?.length || 0}</strong> items
                            </div>
                        </div>

                        {/* Right: Sort Dropdown & Layout View Toggles */}
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                            {/* Sort Selector */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <span className="hidden md:inline text-slate-400">Sort by:</span>
                                <div className="relative">
                                    <select
                                        value={filters.sort || 'featured'}
                                        onChange={handleSortChange}
                                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer"
                                    >
                                        <option value="featured">Featured Arrivals</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="newest">Newest Catalog Additions</option>
                                        <option value="rating">Top Customer Ratings</option>
                                    </select>
                                    <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* View Mode Switcher */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid-3')}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'grid-3' ? 'bg-white shadow-xs text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="3 Columns Grid"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid-4')}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'grid-4' ? 'bg-white shadow-xs text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="4 Columns Grid"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'list' ? 'bg-white shadow-xs text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Chips Bar */}
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                            <span className="text-[11px] text-slate-400 font-medium">Applied Filters:</span>
                            {activeCategories.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => handleCategoryToggle(c)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-900 text-xs font-semibold hover:bg-brand-100 transition-colors"
                                >
                                    <span>Category: {c}</span>
                                    <X className="w-3 h-3" />
                                </button>
                            ))}
                            {activeVendors.map((v) => {
                                const vendorObj = vendors.find(x => String(x.id) === String(v) || x.slug === v);
                                return (
                                    <button
                                        key={v}
                                        onClick={() => handleVendorToggle(v)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-100/80 text-brand-900 text-xs font-semibold hover:bg-brand-200 transition-colors"
                                    >
                                        <span>Merchant: {vendorObj ? vendorObj.shop_name : v}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                );
                            })}
                            {(filters.min_price || filters.max_price) && (
                                <button
                                    onClick={() => {
                                        setMinPrice('');
                                        setMaxPrice('');
                                        updateFilters({ min_price: undefined, max_price: undefined });
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold hover:bg-emerald-200 transition-colors"
                                >
                                    <span>Price: ${filters.min_price || 0} – ${filters.max_price || '∞'}</span>
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            {filters.in_stock && (
                                <button
                                    onClick={() => handleInStockToggle(false)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 text-xs font-semibold hover:bg-sky-200 transition-colors"
                                >
                                    <span>In-Stock Only</span>
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            {filters.rating && (
                                <button
                                    onClick={() => handleRatingSelect(filters.rating)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 transition-colors"
                                >
                                    <span>Rating: {filters.rating}★ & Above</span>
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline ml-1"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Products Container */}
                    {products.data && products.data.length > 0 ? (
                        <>
                            {/* LIST VIEW */}
                            {viewMode === 'list' ? (
                                <div className="space-y-4">
                                    {products.data.map((product) => {
                                        const imageUrl = getProductImage(product);
                                        const isWish = isInWishlist(product.id);
                                        const isAdded = !!addedIds[product.id];
                                        const discountPercent = product.compare_price && product.compare_price > product.price
                                            ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                                            : null;
                                        const vendorName = product.vendor?.shop_name || 'Verified Marketplace Merchant';

                                        return (
                                            <div 
                                                key={product.id}
                                                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row gap-5 items-stretch group"
                                            >
                                                {/* Left Thumbnail */}
                                                <div className="w-full sm:w-56 h-52 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
                                                    <Link href={`/product/${product.slug || product.id}`}>
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.title}
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
                                                            }}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </Link>
                                                    {discountPercent && (
                                                        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                            -{discountPercent}%
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleWishlist(product)}
                                                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                                                            isWish 
                                                                ? 'bg-rose-500 text-white shadow-sm' 
                                                                : 'bg-black/40 text-white hover:bg-black/60'
                                                        }`}
                                                        title="Add to Wishlist"
                                                    >
                                                        <Heart className={`w-4 h-4 ${isWish ? 'fill-white' : ''}`} />
                                                    </button>
                                                </div>

                                                {/* Middle Details */}
                                                <div className="flex-1 flex flex-col justify-between space-y-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                                                <Store className="w-3.5 h-3.5 text-brand-500" />
                                                                <span>Sold by: <strong className="hover:underline">{vendorName}</strong></span>
                                                            </span>
                                                            {product.sku && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <Link
                                                            href={`/product/${product.slug || product.id}`}
                                                            className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                                                        >
                                                            {product.title}
                                                        </Link>

                                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                                            {product.description || 'Verified manufacturer component rated for continuous industrial operation.'}
                                                        </p>

                                                        {/* Rating & Stock */}
                                                        <div className="mt-3 flex items-center gap-4 text-xs">
                                                            <div className="flex items-center text-amber-400">
                                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                                <span className="ml-1 font-bold text-slate-900 text-xs">4.9</span>
                                                                <span className="text-slate-400 text-[11px] ml-1">(48 reviews)</span>
                                                            </div>
                                                            <span className="text-slate-300">|</span>
                                                            {product.stock_quantity > 0 ? (
                                                                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                    In Stock ({product.stock_quantity} units ready)
                                                                </span>
                                                            ) : (
                                                                <span className="text-rose-600 font-semibold text-[11px]">
                                                                    Out of Stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price & Actions */}
                                                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div>
                                                            <div className="text-xl font-black text-slate-900">
                                                                {formatCurrency(product.price)}
                                                            </div>
                                                            {product.compare_price && product.compare_price > product.price && (
                                                                <div className="text-xs text-slate-400 line-through">
                                                                    {formatCurrency(product.compare_price)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/product/${product.slug || product.id}`}
                                                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>View Details</span>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddToCart(product)}
                                                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                                                    isAdded 
                                                                        ? 'bg-emerald-600 text-white' 
                                                                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                                                }`}
                                                            >
                                                                {isAdded ? (
                                                                    <>
                                                                        <Check className="w-4 h-4" />
                                                                        <span>Added</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShoppingCart className="w-4 h-4" />
                                                                        <span>Add to Cart</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* GRID VIEW (3 or 4 Columns) */
                                <div className={`grid gap-4 ${
                                    viewMode === 'grid-3' 
                                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                }`}>
                                    {products.data.map((product) => {
                                        const imageUrl = getProductImage(product);
                                        const isWish = isInWishlist(product.id);
                                        const isAdded = !!addedIds[product.id];
                                        const discountPercent = product.compare_price && product.compare_price > product.price
                                            ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                                            : null;
                                        const vendorName = product.vendor?.shop_name || 'Verified Merchant';

                                        return (
                                            <div 
                                                key={product.id}
                                                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                                            >
                                                {/* Card Image Area */}
                                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                                    <Link href={`/product/${product.slug || product.id}`}>
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.title}
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
                                                            }}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </Link>

                                                    {/* Discount Chip */}
                                                    {discountPercent && (
                                                        <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                            -{discountPercent}%
                                                        </div>
                                                    )}

                                                    {/* Wishlist Heart Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleWishlist(product)}
                                                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                                                            isWish 
                                                                ? 'bg-rose-500 text-white shadow-sm' 
                                                                : 'bg-black/40 text-white hover:bg-black/60'
                                                        }`}
                                                        title="Add to Wishlist"
                                                    >
                                                        <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-white' : ''}`} />
                                                    </button>

                                                    {/* SKU Badge */}
                                                    {product.sku && (
                                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                                                            {product.sku}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                                                    <div>
                                                        {/* Vendor Tag */}
                                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                                                            <Store className="w-3 h-3 text-brand-500 shrink-0" />
                                                            <span className="truncate font-medium hover:text-slate-800">
                                                                {vendorName}
                                                            </span>
                                                        </div>

                                                        {/* Product Title */}
                                                        <Link 
                                                            href={`/product/${product.slug || product.id}`}
                                                            className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                                                            title={product.title}
                                                        >
                                                            {product.title}
                                                        </Link>

                                                        {/* Ratings */}
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                            <div className="flex items-center text-amber-400">
                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                <span className="ml-1 font-bold text-slate-800 text-[11px]">
                                                                    4.9
                                                                </span>
                                                            </div>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-[10px] text-slate-400">(48)</span>
                                                        </div>
                                                    </div>

                                                    {/* Pricing & Add to Cart */}
                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                                                {formatCurrency(product.price)}
                                                            </div>
                                                            {product.compare_price && product.compare_price > product.price && (
                                                                <div className="text-[10px] text-slate-400 line-through">
                                                                    {formatCurrency(product.compare_price)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(product)}
                                                            className={`p-2 rounded-xl transition-all cursor-pointer shadow-xs ${
                                                                isAdded 
                                                                    ? 'bg-emerald-600 text-white' 
                                                                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                                            }`}
                                                            title="Add to Cart"
                                                        >
                                                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="pt-6 flex flex-wrap items-center justify-center gap-1">
                                    {products.links.map((link, idx) => {
                                        const isCurrent = link.active;
                                        const isUrl = Boolean(link.url);

                                        // Clean label e.g. &laquo; Previous -> Previous
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
                        /* Empty State */
                        <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
                                <PackageOpen className="w-8 h-8" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                                <h3 className="text-lg font-bold text-slate-900">No Matching Catalog Items</h3>
                                <p className="text-xs text-slate-500">
                                    We couldn&apos;t find any products matching your selected filters. Try broadening your criteria or reset your filters.
                                </p>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
