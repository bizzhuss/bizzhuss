import React, { useState, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
    Image as ImageIcon,
    Upload,
    Plus,
    Trash2,
    Eye,
    Check,
    X,
    Sparkles,
    ArrowRight,
    ArrowUpDown,
    Calendar,
    SlidersHorizontal,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function MarketingBanners({ 
    banners = [], 
    metrics = { total_banners: 0, active_hero: 0, active_deals: 0 }, 
    filters = {} 
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [badgeText, setBadgeText] = useState('EXCLUSIVE PROMO');
    const [targetUrl, setTargetUrl] = useState('#special-sales');
    const [sectionKey, setSectionKey] = useState('hero_carousel');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // File upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
            alert('Please select an image file (.jpg, .jpeg, .png, .webp).');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageUrlInput('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSubtitle('');
        setBadgeText('EXCLUSIVE PROMO');
        setTargetUrl('#special-sales');
        setSectionKey('hero_carousel');
        setStartTime('');
        setEndTime('');
        setSortOrder(0);
        setIsActive(true);
        setImageFile(null);
        setImagePreview(null);
        setImageUrlInput('');
        setEditingBanner(null);
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (banner) => {
        setEditingBanner(banner);
        setTitle(banner.title);
        setSubtitle(banner.subtitle || '');
        setBadgeText(banner.badge_text || '');
        setTargetUrl(banner.target_url || '/');
        setSectionKey(banner.section_key || 'hero_carousel');
        setStartTime(banner.start_time ? banner.start_time.substring(0, 16) : '');
        setEndTime(banner.end_time ? banner.end_time.substring(0, 16) : '');
        setSortOrder(banner.sort_order || 0);
        setIsActive(banner.is_active);
        setImagePreview(banner.image_url || banner.image_path);
        setImageFile(null);
        setImageUrlInput('');
        setIsCreateModalOpen(true);
    };

    const handleSubmitBanner = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle || '');
        formData.append('badge_text', badgeText || '');
        formData.append('target_url', targetUrl || '/');
        formData.append('section_key', sectionKey);
        formData.append('sort_order', sortOrder);
        formData.append('is_active', isActive ? 1 : 0);

        if (startTime) formData.append('start_time', startTime);
        if (endTime) formData.append('end_time', endTime);

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (imageUrlInput) {
            formData.append('image_url', imageUrlInput);
        }

        if (editingBanner) {
            router.post(`/marketing/banners/${editingBanner.id}`, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
            });
        } else {
            router.post('/marketing/banners', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleToggleStatus = (banner) => {
        router.patch(`/marketing/banners/${banner.id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteBanner = (banner) => {
        if (confirm(`Are you sure you want to remove banner "${banner.title}"?`)) {
            router.delete(`/marketing/banners/${banner.id}`, { preserveScroll: true });
        }
    };

    return (
        <MainLayout>
            <Head title="Promotional Banners - Marketing Portal" />

            <MarketingHeader
                title="Promotional Banner Manager"
                subtitle="Upload, schedule, and reorder high-converting hero carousels and promotional posters."
                actions={
                    <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
                        Upload New Banner
                    </Button>
                }
            />

            {/* Banner Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Banners</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total_banners}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Hero Carousel</span>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.active_hero}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category & Deals Posters</span>
                        <p className="text-2xl font-black text-brand-600 mt-1">{metrics.active_deals}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <SlidersHorizontal className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Banners Grid / Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900">Current Promotional Banners</h2>
                    <span className="text-xs text-slate-500">Live on Storefront according to sort order</span>
                </div>

                {banners.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No Banners Published</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Upload high-resolution graphics to capture buyer attention on the homepage.</p>
                        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
                            Upload First Banner
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banners.map((banner) => (
                            <div 
                                key={banner.id} 
                                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all bg-white shadow-xs hover:shadow-md ${
                                    banner.is_active ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
                                }`}
                            >
                                <div>
                                    {/* Banner Image Preview */}
                                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                                        <img 
                                            src={banner.image_url || banner.image_path} 
                                            alt={banner.title} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            {banner.badge_text && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent-orange text-white shadow-xs">
                                                    {banner.badge_text}
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 text-white border border-white/20">
                                                Order #{banner.sort_order}
                                            </span>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(banner)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-colors cursor-pointer ${
                                                    banner.is_active
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                }`}
                                            >
                                                {banner.is_active ? '● LIVE' : '○ DRAFT'}
                                            </button>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <h3 className="font-bold text-sm truncate">{banner.title}</h3>
                                            <p className="text-[11px] text-slate-300 truncate mt-0.5">{banner.subtitle}</p>
                                        </div>
                                    </div>

                                    {/* Placement details */}
                                    <div className="p-4 space-y-2 text-xs text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Section Placement:</span>
                                            <span className="font-bold text-slate-800 capitalize">
                                                {banner.section_key?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Target Destination:</span>
                                            <span className="font-mono text-[11px] text-purple-600 truncate max-w-[150px]">
                                                {banner.target_url || '/'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleOpenEditModal(banner)}
                                    >
                                        Edit Banner
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-600 hover:bg-rose-50"
                                        icon={Trash2}
                                        onClick={() => handleDeleteBanner(banner)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Create / Edit Banner with Live Preview */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-scale-up border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Upload artwork to appear on high-traffic landing zones.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBanner} className="space-y-5">
                            {/* Live Hero Mockup Preview */}
                            <div>
                                <span className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Live Interactive Mockup Preview</span>
                                </span>
                                
                                <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-950 p-6 min-h-[160px] flex items-center border border-slate-800 text-white">
                                    {imagePreview && (
                                        <div 
                                            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                                            style={{ backgroundImage: `url(${imagePreview})` }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 opacity-90" />
                                    
                                    <div className="relative z-10 space-y-2 max-w-sm">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-orange text-white font-black text-[9px] uppercase tracking-wider">
                                            <Sparkles className="w-2.5 h-2.5 text-white" />
                                            <span>{badgeText || 'EXCLUSIVE EVENT'}</span>
                                        </div>
                                        <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2">
                                            {title || 'Your Banner Title Goes Here'}
                                        </h4>
                                        <p className="text-[11px] text-slate-300 line-clamp-2">
                                            {subtitle || 'Banner subtitle highlighting key value propositions and promotional discounts.'}
                                        </p>
                                        <div className="pt-1">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold">
                                                <span>Shop Deals</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>

                                    {imagePreview && (
                                        <div className="relative z-10 hidden sm:block ml-auto shrink-0">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-24 h-24 object-cover rounded-xl shadow-lg border border-white/20"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cloudinary Image Uploader */}
                            <ImageUpload
                                label="Banner Artwork Image"
                                value={imageUrlInput || imagePreview}
                                onChange={(url) => {
                                    setImageUrlInput(url);
                                    setImagePreview(url);
                                    setImageFile(null);
                                }}
                                folder="bizzhuss_banners"
                                aspectRatio="banner"
                                recommendedSize="Recommended: 16:9 or 800x600 JPG, PNG, WebP up to 10MB"
                                placeholder="Click or drag to upload high-converting banner artwork"
                            />

                            {/* Form Input Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Banner Headline Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mega Tech & Hardware Expo"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Promotional Badge Tag
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. EXCLUSIVE 48-HOUR EVENT"
                                        value={badgeText}
                                        onChange={(e) => setBadgeText(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Subtitle / Caption
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Direct Manufacturer Pricing on Edge Gateways, Precision Tools & Hardware..."
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Section Placement *
                                    </label>
                                    <select
                                        value={sectionKey}
                                        onChange={(e) => setSectionKey(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                                    >
                                        <option value="hero_carousel">Hero Carousel (Top)</option>
                                        <option value="category_banner">Category Grid Banner</option>
                                        <option value="flash_sale_header">Flash Sale Header</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Target URL Destination
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. /shop or #special-sales"
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Display Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Schedule & Active Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Start Schedule (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        End Schedule (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="banner_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <label htmlFor="banner_active" className="text-xs font-bold text-slate-800 cursor-pointer">
                                    Publish immediately and make visible on live storefront
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" icon={Check}>
                                    {editingBanner ? 'Update Banner' : 'Publish Banner'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
