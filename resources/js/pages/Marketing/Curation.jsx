import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
    Sparkles,
    Flame,
    Gem,
    BadgeDollarSign,
    Search,
    Store,
    Package,
    Tag,
    DollarSign,
    Filter,
    Edit2,
    X,
    Check,
    AlertCircle,
    Layers,
    CheckSquare,
    Square,
    SlidersHorizontal,
    Clock
} from 'lucide-react';
import { getProductImage } from '@/lib/productImage';

export default function MarketingCuration({ 
    products = [], 
    categories = [], 
    vendors = [], 
    metrics = {
        total: 0,
        flagship: 0,
        flash_sale: 0,
        smart_value: 0,
        enterprise: 0,
        uncurated: 0
    }, 
    filters = {} 
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedVendor, setSelectedVendor] = useState(filters.vendor || 'all');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedTier, setSelectedTier] = useState(filters.tier || 'all');

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkTier, setBulkTier] = useState('flagship_featured');
    const [bulkBadge, setBulkBadge] = useState('Exclusive Deal');
    const [bulkDiscount, setBulkDiscount] = useState('');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Edit Product Merchandising Modal
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalTier, setModalTier] = useState('none');
    const [modalDiscount, setModalDiscount] = useState('');
    const [modalBadge, setModalBadge] = useState('');
    const [modalEndDate, setModalEndDate] = useState('');

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get('/marketing/curation', {
            search: searchQuery || undefined,
            vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            tier: selectedTier !== 'all' ? selectedTier : undefined,
        }, { preserveState: true });
    };

    const handleTierTabChange = (tier) => {
        setSelectedTier(tier);
        router.get('/marketing/curation', {
            tier: tier !== 'all' ? tier : undefined,
            vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    // Quick inline tier update
    const handleQuickTierChange = (product, newTier) => {
        router.post(`/marketing/curation/${product.id}/tier`, {
            curation_tier: newTier,
            discount_percentage: product.discount_percentage,
            sale_badge_label: product.sale_badge_label,
            flash_sale_end_time: product.flash_sale_end_time,
        }, { preserveScroll: true });
    };

    // Open detailed edit modal
    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setModalTier(product.curation_tier || (product.is_featured ? 'flagship_featured' : (product.is_on_special_sale ? 'special_flash_sale' : 'none')));
        setModalDiscount(product.discount_percentage || '');
        setModalBadge(product.sale_badge_label || product.special_sale_title || '');
        setModalEndDate(product.flash_sale_end_time ? product.flash_sale_end_time.substring(0, 16) : '');
    };

    const handleSaveProductModal = (e) => {
        e.preventDefault();
        if (!editingProduct) return;

        router.post(`/marketing/curation/${editingProduct.id}/tier`, {
            curation_tier: modalTier,
            discount_percentage: modalDiscount ? parseFloat(modalDiscount) : null,
            sale_badge_label: modalBadge || null,
            flash_sale_end_time: modalEndDate || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingProduct(null),
        });
    };

    // Bulk action handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkSubmit = (action) => {
        router.post('/marketing/curation/bulk', {
            product_ids: selectedIds,
            action: action,
            tier: bulkTier,
            sale_badge_label: bulkBadge,
            discount_percentage: bulkDiscount ? parseFloat(bulkDiscount) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkModalOpen(false);
            }
        });
    };

    const getTierBadge = (tier, isFeatured, isSpecial) => {
        if (tier === 'flagship_featured' || isFeatured) {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200"><Sparkles className="w-3 h-3 text-brand-500" /> Flagship Featured</span>;
        }
        if (tier === 'special_flash_sale' || isSpecial) {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><Flame className="w-3 h-3 text-rose-500" /> Special Flash</span>;
        }
        if (tier === 'smart_value_budget' || tier === 'budget_picks' || tier === 'smart_value') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"><BadgeDollarSign className="w-3 h-3 text-amber-600" /> Smart Value</span>;
        }
        if (tier === 'enterprise_heavy_duty' || tier === 'enterprise_tier' || tier === 'enterprise') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"><Gem className="w-3 h-3 text-indigo-600" /> Enterprise Tier</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Standard Catalog</span>;
    };

    return (
        <MainLayout>
            <Head title="Curation Hub - Merchandising Suite" />

            <MarketingHeader
                title="Storefront Curation Hub"
                subtitle="Select and promote products from verified suppliers across dedicated landing page showcases."
                actions={
                    selectedIds.length > 0 && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            icon={Layers}
                            onClick={() => setIsBulkModalOpen(true)}
                        >
                            Bulk Merchandising ({selectedIds.length})
                        </Button>
                    )
                }
            />

            {/* Curation Tier Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { key: 'all', label: 'All Catalog', count: metrics.total, icon: Package, color: 'text-slate-800' },
                    { key: 'flagship_featured', label: 'Flagship', count: metrics.flagship, icon: Sparkles, color: 'text-brand-600' },
                    { key: 'special_flash_sale', label: 'Flash Deals', count: metrics.flash_sale, icon: Flame, color: 'text-rose-600' },
                    { key: 'smart_value_budget', label: 'Smart Value', count: metrics.smart_value, icon: BadgeDollarSign, color: 'text-amber-700' },
                    { key: 'enterprise_heavy_duty', label: 'Enterprise', count: metrics.enterprise, icon: Gem, color: 'text-indigo-600' },
                    { key: 'none', label: 'Uncurated', count: metrics.uncurated, icon: Layers, color: 'text-slate-500' },
                ].map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedTier === item.key;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => handleTierTabChange(item.key)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                isActive 
                                    ? 'bg-purple-50/70 border-purple-500 shadow-xs' 
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <Icon className={`w-4 h-4 ${item.color}`} />
                                <span className={`text-base font-black ${item.color}`}>{item.count}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 mt-2 truncate">{item.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs mb-6">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by product title, SKU, or supplier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Vendors</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.shop_name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                    </select>

                    <Button type="submit" variant="secondary" size="sm" icon={Filter}>
                        Apply Filters
                    </Button>
                </form>
            </div>

            {/* Bulk Selection Notice Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-purple-600 text-white flex items-center justify-between text-xs animate-slide-up shadow-md">
                    <div className="flex items-center gap-2 font-semibold">
                        <CheckSquare className="w-4 h-4" />
                        <span>{selectedIds.length} products selected for batch merchandising</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={() => setIsBulkModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-white text-purple-900 font-bold hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                            Configure Batch
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setSelectedIds([])}
                            className="px-2 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold">
                                <th className="p-3 w-10 text-center">
                                    <button 
                                        type="button" 
                                        onClick={toggleSelectAll}
                                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                    >
                                        {selectedIds.length === products.length && products.length > 0 ? (
                                            <CheckSquare className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <Square className="w-4 h-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="p-3">Product</th>
                                <th className="p-3">Vendor / Category</th>
                                <th className="p-3">Pricing</th>
                                <th className="p-3">Curation Tier</th>
                                <th className="p-3">Promotional Badge</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        No products found matching the criteria.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isSelected = selectedIds.includes(product.id);
                                    const currentTier = product.curation_tier || (product.is_featured ? 'flagship_featured' : (product.is_on_special_sale ? 'special_flash_sale' : 'none'));

                                    return (
                                        <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-purple-50/40' : ''}`}>
                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelectProduct(product.id)}
                                                    className="cursor-pointer"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                                    )}
                                                </button>
                                            </td>

                                            {/* Product Info */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-product.svg';
                                                        }}
                                                    />
                                                    <div className="min-w-0">
                                                        <Link 
                                                            href={`/product/${product.slug || product.id}`}
                                                            target="_blank"
                                                            className="font-bold text-slate-900 hover:text-purple-600 transition-colors line-clamp-1 block"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                                                            {product.sku || `ID: ${product.id}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Vendor & Category */}
                                            <td className="p-3">
                                                <div className="space-y-0.5">
                                                    <span className="font-medium text-slate-700 flex items-center gap-1">
                                                        <Store className="w-3 h-3 text-brand-500 shrink-0" />
                                                        <span className="truncate max-w-[140px]">{product.vendor?.shop_name}</span>
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 block">
                                                        {product.category?.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Pricing & Discounts */}
                                            <td className="p-3">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.discount_percentage ? (
                                                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                                                            -{Math.round(product.discount_percentage)}% Promo
                                                        </span>
                                                    ) : product.compare_price && product.compare_price > product.price ? (
                                                        <span className="text-[10px] text-slate-400 line-through block">
                                                            {formatCurrency(product.compare_price)}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>

                                            {/* Curation Tier Selector */}
                                            <td className="p-3">
                                                <select
                                                    value={currentTier}
                                                    onChange={(e) => handleQuickTierChange(product, e.target.value)}
                                                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-xs"
                                                >
                                                    <option value="none">Standard Catalog</option>
                                                    <option value="flagship_featured">⭐ Flagship Featured</option>
                                                    <option value="special_flash_sale">🔥 Special Flash Sale</option>
                                                    <option value="smart_value_budget">🏷️ Smart Value & Budget</option>
                                                    <option value="enterprise_heavy_duty">💎 Enterprise Heavy Duty</option>
                                                </select>
                                            </td>

                                            {/* Badge Label */}
                                            <td className="p-3">
                                                {product.sale_badge_label ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-purple-100 text-purple-800">
                                                        <Tag className="w-3 h-3" />
                                                        <span>{product.sale_badge_label}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">Standard label</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Edit2}
                                                    onClick={() => handleOpenEditModal(product)}
                                                    title="Configure Promotional Campaign"
                                                >
                                                    Configure
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Configure Product Merchandising */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-up border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Merchandising Configuration</h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{editingProduct.title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProductModal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Showcase Tier Assignment
                                </label>
                                <select
                                    value={modalTier}
                                    onChange={(e) => setModalTier(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                                >
                                    <option value="none">None (Standard Catalog)</option>
                                    <option value="flagship_featured">⭐ Flagship Featured Showcase</option>
                                    <option value="special_flash_sale">🔥 Special Flash Sale Tier</option>
                                    <option value="smart_value_budget">🏷️ Smart Value & Budget Picks</option>
                                    <option value="enterprise_heavy_duty">💎 Enterprise & Heavy Duty Tier</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Promotional Discount %
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="e.g. 25"
                                        value={modalDiscount}
                                        onChange={(e) => setModalDiscount(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">Overrides compare price</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Sale Badge Label
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mega Deal, 40% Off"
                                        value={modalBadge}
                                        onChange={(e) => setModalBadge(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Flash Sale Expiration Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={modalEndDate}
                                    onChange={(e) => setModalEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-0.5 block">Used for countdown clock if specific to this deal</span>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" icon={Check}>
                                    Save Merchandising
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Bulk Actions */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-up border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Batch Merchandising Update</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{selectedIds.length} products selected</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBulkModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Select Target Tier
                                </label>
                                <select
                                    value={bulkTier}
                                    onChange={(e) => setBulkTier(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="flagship_featured">⭐ Flagship Featured Showcase</option>
                                    <option value="special_flash_sale">🔥 Special Flash Sale Tier</option>
                                    <option value="smart_value_budget">🏷️ Smart Value & Budget Picks</option>
                                    <option value="enterprise_heavy_duty">💎 Enterprise & Heavy Duty Tier</option>
                                    <option value="none">Standard Catalog (Reset)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Badge Label
                                    </label>
                                    <input
                                        type="text"
                                        value={bulkBadge}
                                        onChange={(e) => setBulkBadge(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Discount %
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Optional"
                                        value={bulkDiscount}
                                        onChange={(e) => setBulkDiscount(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleBulkSubmit('set_tier')}
                                    icon={Check}
                                >
                                    Apply Tier to Selected
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleBulkSubmit('reset_tier')}
                                >
                                    Reset Selected to Standard Catalog
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
