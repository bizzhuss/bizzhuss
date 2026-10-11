import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Copy, 
    Trash2, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    DollarSign, 
    Percent, 
    Layers, 
    AlertCircle, 
    ExternalLink,
    Store,
    Tag,
    X,
    ArrowUpRight
} from 'lucide-react';

export default function ProductsIndex({ 
    vendor = {}, 
    products = [], 
    categories = [], 
    metrics = {}, 
    filters = {} 
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || 'all');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    // Delete Confirmation Modal State
    const [productToDelete, setProductToDelete] = useState(null);

    const safeVendor = vendor || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/vendor/products', {
            search: searchQuery || undefined,
            category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
        }, { preserveState: true });
    };

    const handleCategoryFilter = (catId) => {
        setSelectedCategory(catId);
        router.get('/vendor/products', {
            category_id: catId !== 'all' ? catId : undefined,
            search: searchQuery || undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
        }, { preserveState: true });
    };

    const handleTabFilter = (tab) => {
        setActiveTab(tab);
        router.get('/vendor/products', {
            status: tab !== 'all' ? tab : undefined,
            category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleDuplicate = (productId) => {
        router.post(`/vendor/products/${productId}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteProduct = () => {
        if (!productToDelete) return;
        router.delete(`/vendor/products/${productToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setProductToDelete(null),
        });
    };

    const statusTabs = [
        { id: 'all', label: 'All Listings', count: metrics.total_products || 0 },
        { id: 'published', label: 'Published', count: metrics.published || 0 },
        { id: 'pending_review', label: 'In Review', count: metrics.pending_review || 0 },
        { id: 'draft', label: 'Drafts', count: metrics.draft || 0 },
        { id: 'low_stock', label: 'Low Stock', count: metrics.low_stock || 0 },
        { id: 'out_of_stock', label: 'Out of Stock', count: metrics.out_of_stock || 0 },
    ];

    return (
        <MainLayout>
            <Head title={`Catalog Management - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            <VendorHeader
                vendor={safeVendor}
                title="Product Catalog & Inventory"
                subtitle="Complete SKU catalog, size & color variants, cost/pricing calculations, and stock control."
                actions={
                    <Link href="/vendor/products/create">
                        <Button variant="primary" icon={Plus}>
                            Add New Product
                        </Button>
                    </Link>
                }
            />

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Catalog SKUs"
                    value={`${metrics.total_products || 0} Products`}
                    subtitle="Registered in shop catalog"
                    icon={Package}
                    color="brand"
                />
                <StatCard
                    title="Active Storefront Listings"
                    value={`${metrics.published || 0} Active`}
                    subtitle="Live on customer catalog"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Total Inventory Units"
                    value={`${metrics.total_inventory_units || 0} Units`}
                    subtitle="Physical warehouse stock"
                    icon={Layers}
                    color="sky"
                />
                <StatCard
                    title="Inventory Alerts"
                    value={`${(metrics.low_stock || 0) + (metrics.out_of_stock || 0)} Critical`}
                    subtitle={`${metrics.out_of_stock || 0} sold out, ${metrics.low_stock || 0} low stock`}
                    icon={AlertTriangle}
                    color={(metrics.out_of_stock || 0) > 0 ? 'rose' : (metrics.low_stock || 0) > 0 ? 'amber' : 'brand'}
                />
            </div>

            {/* Main Catalog Card */}
            <Card className="mb-8">
                {/* Search & Status Tabs Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabFilter(tab.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    activeTab === tab.id ? 'bg-brand-200/80 text-brand-900' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search title, SKU, brand..."
                                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Category Pills Filter */}
                {categories.length > 0 && (
                    <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Filter className="w-3 h-3" /> Categories:
                        </span>
                        <button
                            onClick={() => handleCategoryFilter('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryFilter(cat.id.toString())}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                                    selectedCategory === cat.id.toString()
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Product / Identification</th>
                                <th className="px-4 py-3.5">Category</th>
                                <th className="px-4 py-3.5">Regular / Sale Price</th>
                                <th className="px-4 py-3.5">Inventory</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="font-semibold text-slate-600 text-sm">No products found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters, or add your first product.</p>
                                        <Link href="/vendor/products/create" className="inline-block mt-4">
                                            <Button variant="primary" size="sm" icon={Plus}>
                                                Create Product
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const primaryImg = (product.images && product.images.length > 0) ? product.images[0] : null;
                                    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold ?? 5);
                                    const isOutOfStock = product.stock_quantity <= 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Product Title & Identifiers */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                        {primaryImg ? (
                                                            <img
                                                                src={primaryImg}
                                                                alt={product.title}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500';
                                                                }}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 line-clamp-1 hover:text-brand-600">
                                                            {product.title}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                                            <span>SKU: {product.sku}</span>
                                                            {product.barcode && <span>• Barcode: {product.barcode}</span>}
                                                            {product.brand && <span className="font-sans font-semibold text-slate-500">[{product.brand}]</span>}
                                                        </div>
                                                        {product.variants && product.variants.length > 0 && (
                                                            <div className="mt-1 flex items-center gap-1">
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                                                    {product.variants.length} Variants
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {product.category ? product.category.name : 'Uncategorized'}
                                                </span>
                                            </td>

                                            {/* Pricing */}
                                            <td className="px-4 py-4">
                                                <div className="font-mono font-bold text-slate-900">
                                                    {formatCurrency(product.price)}
                                                </div>
                                                {product.compare_price && (
                                                    <div className="text-[11px] text-slate-400 font-mono line-through">
                                                        {formatCurrency(product.compare_price)}
                                                    </div>
                                                )}
                                                {product.cost_per_item && (
                                                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                                        Cost: {formatCurrency(product.cost_per_item)} (Margin: {Math.round(((product.price - product.cost_per_item) / product.price) * 100)}%)
                                                    </div>
                                                )}
                                            </td>

                                            {/* Inventory Count */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                                                        {product.stock_quantity} units
                                                    </span>
                                                </div>
                                                {isOutOfStock ? (
                                                    <span className="inline-flex text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                                        Sold Out
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-flex text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">
                                                        Threshold: {product.low_stock_threshold || 5}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-4 py-4">
                                                <StatusBadge status={product.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link href={`/product/${product.slug}`} target="_blank">
                                                        <button 
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                            title="View Live Storefront Page"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/vendor/products/${product.id}/edit`}>
                                                        <button 
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDuplicate(product.id)}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Duplicate Product as Draft"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setProductToDelete(product)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Delete Product Listing
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to delete <strong className="text-slate-800">{productToDelete.title}</strong>? This action will remove the listing from customer searches and disable active checkout.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteProduct}>
                                Permanently Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
