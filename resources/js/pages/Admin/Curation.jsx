import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
    Sparkles,
    Flame,
    TrendingUp,
    Search,
    CheckCircle2,
    XCircle,
    Store,
    Package,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Tag,
    DollarSign,
    ExternalLink,
    Filter,
    Edit2,
    X,
    Check,
    AlertCircle,
    Eye,
    Layers,
    SlidersHorizontal,
    ShoppingBag
} from 'lucide-react';

export default function Curation({ products = [], categories = [], vendors = [], metrics = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [activeTab, setActiveTab] = useState(filters.tab || 'all');

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkActionType, setBulkActionType] = useState('make_featured');
    const [bulkSaleTitle, setBulkSaleTitle] = useState('Mega Eid Deal - Up to 40% Off');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Special Sale Modal state
    const [editingSaleProduct, setEditingSaleProduct] = useState(null);
    const [saleTitleInput, setSaleTitleInput] = useState('');
    const [salePriceInput, setSalePriceInput] = useState('');
    const [saleCompareInput, setSaleCompareInput] = useState('');

    // Sold Count Modal state
    const [editingSoldProduct, setEditingSoldProduct] = useState(null);
    const [soldCountInput, setSoldCountInput] = useState(0);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/marketing/curation', {
            search: searchQuery || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            tab: activeTab !== 'all' ? activeTab : undefined,
        }, { preserveState: true });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get('/admin/marketing/curation', {
            tab: tab !== 'all' ? tab : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        router.get('/admin/marketing/curation', {
            category: cat !== 'all' ? cat : undefined,
            tab: activeTab !== 'all' ? activeTab : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    // Toggle Featured Inline
    const handleToggleFeatured = (product) => {
        router.post(`/admin/marketing/curation/${product.id}/featured`, {
            is_featured: !product.is_featured,
        }, { preserveScroll: true });
    };

    // Open Special Sale Prompt
    const handleOpenSaleModal = (product) => {
        setEditingSaleProduct(product);
        setSaleTitleInput(product.special_sale_title || 'Mega Eid Deal - 20% OFF');
        setSalePriceInput(product.price || '');
        setSaleCompareInput(product.compare_price || (parseFloat(product.price) * 1.25).toFixed(2));
    };

    const handleSaveSpecialSale = (e) => {
        e.preventDefault();
        if (!editingSaleProduct) return;

        router.post(`/admin/marketing/curation/${editingSaleProduct.id}/special-sale`, {
            is_on_special_sale: true,
            special_sale_title: saleTitleInput,
            price: salePriceInput || undefined,
            compare_price: saleCompareInput || undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingSaleProduct(null),
        });
    };

    const handleRemoveSpecialSale = (product) => {
        router.post(`/admin/marketing/curation/${product.id}/special-sale`, {
            is_on_special_sale: false,
        }, { preserveScroll: true });
    };

    // Change Priority Order
    const handleOrderChange = (product, newOrder) => {
        const orderVal = parseInt(newOrder, 10);
        if (isNaN(orderVal) || orderVal < 0) return;

        router.patch(`/admin/marketing/curation/${product.id}/order`, {
            featured_order: orderVal,
        }, { preserveScroll: true });
    };

    // Save Sold Count
    const handleSaveSoldCount = (e) => {
        e.preventDefault();
        if (!editingSoldProduct) return;

        router.patch(`/admin/marketing/curation/${editingSoldProduct.id}/sold-count`, {
            total_sold_count: parseInt(soldCountInput, 10) || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingSoldProduct(null),
        });
    };

    // Selection logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Bulk actions
    const handleExecuteBulk = () => {
        if (!selectedIds.length) return;

        router.post('/admin/marketing/curation/bulk', {
            product_ids: selectedIds,
            action: bulkActionType,
            special_sale_title: bulkActionType === 'make_special_sale' ? bulkSaleTitle : undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkModalOpen(false);
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Storefront Merchandising & Product Curation - Super Admin" />

            <AdminHeader
                title="Storefront Merchandising & Curation"
                subtitle="Curate homepage showcase rows, toggle featured flagship items, launch special flash sale campaigns, and control live priority sorting."
                actions={
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Live Storefront</span>
                        </Link>
                    </div>
                }
            />

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Curated Featured Items"
                    value={`${metrics.featured_count || 0} Products`}
                    subtitle="Actively displayed in Top Showcase"
                    icon={Sparkles}
                    color="brand"
                />
                <StatCard
                    title="Special Sales & Offers"
                    value={`${metrics.special_sale_count || 0} Campaigns`}
                    subtitle="Promotional banners & discounts"
                    icon={Flame}
                    color="amber"
                />
                <StatCard
                    title="Best-Seller Volume"
                    value={`${metrics.total_units_sold || 0} Units`}
                    subtitle={`Across ${metrics.best_sellers_count || 0} top-performing SKUs`}
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    title="Total Catalog Products"
                    value={`${metrics.total_products || 0} SKUs`}
                    subtitle="Active verified marketplace catalog"
                    icon={Package}
                    color="sky"
                />
            </div>

            {/* Bulk Action Floating Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                            {selectedIds.length}
                        </span>
                        <div>
                            <p className="text-xs font-bold text-white">
                                {selectedIds.length} {selectedIds.length === 1 ? 'Product' : 'Products'} Selected
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Apply bulk storefront merchandising changes instantly
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={bulkActionType}
                            onChange={(e) => setBulkActionType(e.target.value)}
                            className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none focus:ring-1 focus:ring-amber-400"
                        >
                            <option value="make_featured">⭐ Set as Featured (Showcase Row)</option>
                            <option value="remove_featured">✖ Remove from Featured</option>
                            <option value="make_special_sale">🔥 Add to Special Sale Campaign</option>
                            <option value="remove_special_sale">✖ Remove from Special Sale</option>
                            <option value="reset_curation">🔄 Reset All Curation Flags</option>
                        </select>

                        {bulkActionType === 'make_special_sale' && (
                            <input
                                type="text"
                                value={bulkSaleTitle}
                                onChange={(e) => setBulkSaleTitle(e.target.value)}
                                placeholder="Campaign Title (e.g. Mega Eid Deal)"
                                className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none w-56 focus:ring-1 focus:ring-amber-400"
                            />
                        )}

                        <button
                            type="button"
                            onClick={handleExecuteBulk}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                        >
                            Apply to {selectedIds.length} Items
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Tabs & Search Header */}
            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                        {[
                            { id: 'all', label: 'All Products', count: metrics.total_products },
                            { id: 'featured', label: '⭐ Featured Row', count: metrics.featured_count },
                            { id: 'special_sale', label: '🔥 Special Offers', count: metrics.special_sale_count },
                            { id: 'best_sellers', label: '📈 Best Sellers', count: metrics.best_sellers_count },
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleTabChange(t.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                                    activeTab === t.id
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>{t.label}</span>
                                {t.count !== undefined && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        activeTab === t.id ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Category Filter Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, SKU, brand, or vendor..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </form>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full sm:w-48 bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.slug}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table Card */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                </th>
                                <th className="py-4 px-2">Product Info</th>
                                <th className="py-4 px-3">Price & Compare</th>
                                <th className="py-4 px-3 text-center">Featured Switch</th>
                                <th className="py-4 px-3 text-center">Priority Order</th>
                                <th className="py-4 px-3 text-center">Special Offer</th>
                                <th className="py-4 px-3 text-center">Total Sold</th>
                                <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length > 0 ? (
                                products.map((product) => {
                                    const isSelected = selectedIds.includes(product.id);
                                    const discount = product.compare_price && product.compare_price > product.price
                                        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                                        : 0;

                                    return (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(product.id)}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                />
                                            </td>

                                            {/* Product Info */}
                                            <td className="py-4 px-2 max-w-xs">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={(product.images && product.images[0]) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                                                    />
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/product/${product.slug}`}
                                                            target="_blank"
                                                            className="font-bold text-slate-900 hover:text-brand-600 truncate block transition-colors"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                            <span className="font-mono text-slate-400">{product.sku}</span>
                                                            <span>•</span>
                                                            <span className="text-slate-600">{product.category?.name || 'Hardware'}</span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1.5">
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                {product.vendor?.shop_name || 'Marketplace Vendor'}
                                                            </span>
                                                            {product.status === 'published' ? (
                                                                <span className="text-[10px] font-bold text-emerald-600">● Live</span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-400">● {product.status}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Pricing & Discount */}
                                            <td className="py-4 px-3 whitespace-nowrap">
                                                <div className="font-mono font-bold text-slate-900 text-xs">
                                                    {formatCurrency(product.price)}
                                                </div>
                                                {product.compare_price && product.compare_price > product.price && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className="line-through text-slate-400 text-[11px] font-mono">
                                                            {formatCurrency(product.compare_price)}
                                                        </span>
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                                            -{discount}%
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Inline Featured Switch */}
                                            <td className="py-4 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleFeatured(product)}
                                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        product.is_featured
                                                            ? 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <Sparkles className={`w-3.5 h-3.5 ${product.is_featured ? 'text-slate-950' : 'text-slate-400'}`} />
                                                    <span>{product.is_featured ? 'Featured' : 'Standard'}</span>
                                                </button>
                                            </td>

                                            {/* Priority / Sort Order Input */}
                                            <td className="py-4 px-3 text-center">
                                                <div className="inline-flex items-center gap-1 justify-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="999"
                                                        defaultValue={product.featured_order || 0}
                                                        onBlur={(e) => handleOrderChange(product, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleOrderChange(product, e.target.value);
                                                            }
                                                        }}
                                                        className="w-14 text-center py-1 px-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold focus:ring-1 focus:ring-brand-500"
                                                    />
                                                </div>
                                            </td>

                                            {/* Special Offer Campaign Switch */}
                                            <td className="py-4 px-3 text-center">
                                                {product.is_on_special_sale ? (
                                                    <div className="space-y-1">
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                                                            <Flame className="w-3 h-3 text-rose-500" />
                                                            <span>{product.special_sale_title || 'Active Sale'}</span>
                                                        </span>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenSaleModal(product)}
                                                                className="text-[10px] text-amber-600 hover:underline font-semibold"
                                                            >
                                                                Edit Deal
                                                            </button>
                                                            <span className="text-slate-300">•</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSpecialSale(product)}
                                                                className="text-[10px] text-rose-600 hover:underline font-semibold"
                                                            >
                                                                Turn Off
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenSaleModal(product)}
                                                        className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Flame className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Add Deal</span>
                                                    </button>
                                                )}
                                            </td>

                                            {/* Sold Units Counter */}
                                            <td className="py-4 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingSoldProduct(product);
                                                        setSoldCountInput(product.total_sold_count || 0);
                                                    }}
                                                    className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                                                >
                                                    <span>{product.total_sold_count || 0} sold</span>
                                                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 text-right">
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-block transition-colors"
                                                    title="View on storefront"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="font-bold text-slate-700">No products match your curation filters.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Try clearing search or changing the tab filter.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Special Sale Campaign Modal */}
            {editingSaleProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Configure Special Offer</h3>
                                    <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                                        {editingSaleProduct.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingSaleProduct(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSpecialSale} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Special Offer Campaign Banner Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={saleTitleInput}
                                    onChange={(e) => setSaleTitleInput(e.target.value)}
                                    placeholder="e.g. Mega Eid Deal - 30% OFF, Clearance 50%"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                                />
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    {['Mega Eid Deal', 'Clearance 50% Off', 'Factory Direct Special', 'Flash 48h Offer'].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setSaleTitleInput(preset)}
                                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Sale Price (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={salePriceInput}
                                        onChange={(e) => setSalePriceInput(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Strike-through Compare (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={saleCompareInput}
                                        onChange={(e) => setSaleCompareInput(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingSaleProduct(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                                >
                                    Activate Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Sold Count Modal */}
            {editingSoldProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Tune Best-Seller Sales Count</h3>
                                <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                                    {editingSoldProduct.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingSoldProduct(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSoldCount} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Total Completed Units Sold
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={soldCountInput}
                                    onChange={(e) => setSoldCountInput(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    This determines ranking in the storefront "Best Sellers" section.
                                </p>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingSoldProduct(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                                >
                                    Save Counter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
