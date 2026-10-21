import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
    Package, 
    UploadCloud, 
    Trash2, 
    Star, 
    Plus, 
    DollarSign, 
    Layers, 
    AlertCircle, 
    Percent, 
    Barcode, 
    Tag, 
    ArrowLeft, 
    Save, 
    Sparkles,
    Check,
    Image as ImageIcon
} from 'lucide-react';

export function ProductForm({ 
    initialData = null, 
    categories = [], 
    allCategories = [], 
    vendor = {}, 
    isEdit = false 
}) {
    const isNew = !isEdit;

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [isSlugManual, setIsSlugManual] = useState(false);
    const [categoryId, setCategoryId] = useState(initialData?.category_id || (allCategories[0]?.id || ''));
    const [brand, setBrand] = useState(initialData?.brand || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Pricing & Costs
    const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : '');
    const [comparePrice, setComparePrice] = useState(initialData?.compare_price ? initialData.compare_price.toString() : '');
    const [costPerItem, setCostPerItem] = useState(initialData?.cost_per_item ? initialData.cost_per_item.toString() : '');

    // Inventory
    const [sku, setSku] = useState(initialData?.sku || '');
    const [barcode, setBarcode] = useState(initialData?.barcode || '');
    const [stockQuantity, setStockQuantity] = useState(initialData?.stock_quantity !== undefined ? initialData.stock_quantity.toString() : '10');
    const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.low_stock_threshold !== undefined ? initialData.low_stock_threshold.toString() : '5');

    // Media Gallery State (tracks both existing paths and new uploaded files)
    const [gallery, setGallery] = useState(() => {
        const initial = Array.isArray(initialData?.images) ? initialData.images : [];
        return initial.map((url, idx) => ({
            id: `existing-${idx}-${Date.now()}`,
            type: 'existing',
            url,
            name: (typeof url === 'string' ? url.split('/').pop() : `Image ${idx + 1}`) || `Image ${idx + 1}`
        }));
    });
    const [isDragging, setIsDragging] = useState(false);
    const [imageError, setImageError] = useState(null);
    const fileInputRef = React.useRef(null);

    // Revoke object URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            gallery.forEach((item) => {
                if (item.type === 'new' && item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [gallery]);

    // Variants System
    const [hasVariants, setHasVariants] = useState(Array.isArray(initialData?.variants) && initialData.variants.length > 0);
    const [variants, setVariants] = useState(Array.isArray(initialData?.variants) ? initialData.variants : []);

    // Publication Status
    const [status, setStatus] = useState(initialData?.status || 'published');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Auto-generate slug when title changes unless manually edited
    useEffect(() => {
        if (!isSlugManual && isNew && title) {
            const generated = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setSlug(generated);
        }
    }, [title, isSlugManual, isNew]);

    // Profit & Margin Calculations
    const numPrice = parseFloat(price) || 0;
    const numCost = parseFloat(costPerItem) || 0;
    const profit = Math.max(0, numPrice - numCost);
    const margin = numPrice > 0 ? Math.round((profit / numPrice) * 100) : 0;

    // Helper to generate SKU
    const handleGenerateSku = () => {
        const vendorPrefix = vendor.shop_name ? vendor.shop_name.substring(0, 3).toUpperCase() : 'BZH';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase();
        setSku(`${vendorPrefix}-${randomLetters}-${randomNum}`);
    };

    // File Processing & Validation
    const handleFiles = (incomingFiles) => {
        setImageError(null);
        if (!incomingFiles || incomingFiles.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const maxFileSize = 4 * 1024 * 1024; // 4MB
        const maxTotalImages = 5;

        const currentCount = gallery.length;
        if (currentCount >= maxTotalImages) {
            setImageError(`Maximum limit of ${maxTotalImages} images reached for this product.`);
            return;
        }

        const validNewItems = [];
        const filesArray = Array.from(incomingFiles);

        for (const file of filesArray) {
            if (currentCount + validNewItems.length >= maxTotalImages) {
                setImageError(`Only up to ${maxTotalImages} images total can be attached.`);
                break;
            }

            const ext = '.' + file.name.split('.').pop().toLowerCase();
            const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext);

            if (!isValidType) {
                setImageError(`"${file.name}" is not a supported format. Please upload .jpg, .jpeg, .png, or .webp images.`);
                continue;
            }

            if (file.size > maxFileSize) {
                setImageError(`"${file.name}" exceeds the 4MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
                continue;
            }

            const previewUrl = URL.createObjectURL(file);
            validNewItems.push({
                id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                type: 'new',
                file,
                previewUrl,
                name: file.name,
                size: file.size
            });
        }

        if (validNewItems.length > 0) {
            setGallery((prev) => [...prev, ...validNewItems]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer && e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    };

    // Set Primary / Cover Image (moves item to index 0)
    const handleSetPrimaryImage = (index) => {
        setGallery((prev) => {
            const item = prev[index];
            return [item, ...prev.filter((_, i) => i !== index)];
        });
    };

    // Remove Image
    const handleRemoveImage = (index) => {
        setGallery((prev) => {
            const item = prev[index];
            if (item && item.type === 'new' && item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    // Variant Handlers
    const handleAddVariant = () => {
        const count = variants.length + 1;
        setVariants([
            ...variants,
            {
                id: Date.now(),
                option_type: 'Size',
                option_value: count === 1 ? 'M' : count === 2 ? 'L' : 'XL',
                sku: `${sku || 'SKU'}-V${count}`,
                stock: stockQuantity || '10',
                price_adjustment: '0.00',
            }
        ]);
    };

    const handleUpdateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const handleRemoveVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // Form Submit via FormData (multipart/form-data)
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('title', title);
        if (slug) formData.append('slug', slug);
        formData.append('category_id', categoryId);
        if (brand) formData.append('brand', brand);
        formData.append('description', description || '');
        formData.append('price', price);
        if (comparePrice) formData.append('compare_price', comparePrice);
        if (costPerItem) formData.append('cost_per_item', costPerItem);
        formData.append('sku', sku);
        if (barcode) formData.append('barcode', barcode);
        formData.append('stock_quantity', stockQuantity);
        formData.append('low_stock_threshold', lowStockThreshold);
        formData.append('status', status);

        // Variants
        if (hasVariants && variants.length > 0) {
            variants.forEach((v, idx) => {
                formData.append(`variants[${idx}][option_type]`, v.option_type);
                formData.append(`variants[${idx}][option_value]`, v.option_value);
                formData.append(`variants[${idx}][sku]`, v.sku);
                formData.append(`variants[${idx}][stock]`, v.stock);
                formData.append(`variants[${idx}][price_adjustment]`, v.price_adjustment);
            });
        }

        // Image ordering and files
        let newFileIndex = 0;
        const orderMetadata = [];

        gallery.forEach((item) => {
            if (item.type === 'existing') {
                formData.append('existing_images[]', item.url);
                orderMetadata.push({ type: 'existing', url: item.url });
            } else if (item.type === 'new' && item.file) {
                formData.append('images[]', item.file);
                orderMetadata.push({ type: 'new', index: newFileIndex });
                newFileIndex++;
            }
        });

        formData.append('image_order', JSON.stringify(orderMetadata));

        if (isEdit) {
            // Method spoofing for Laravel multipart PUT
            formData.append('_method', 'PUT');
            router.post(`/vendor/products/${initialData.id}`, formData, {
                forceFormData: true,
                onSuccess: () => setSubmitting(false),
                onError: (err) => {
                    setErrors(err);
                    setSubmitting(false);
                },
            });
        } else {
            router.post('/vendor/products', formData, {
                forceFormData: true,
                onSuccess: () => setSubmitting(false),
                onError: (err) => {
                    setErrors(err);
                    setSubmitting(false);
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Top Bar with Navigation & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/vendor/products"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">
                            {isEdit ? `Edit Product: ${initialData.title}` : 'Add New Product Listing'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Configure product information, multi-angle images, inventory thresholds, and pricing.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <Link href="/vendor/products">
                        <Button variant="secondary" size="sm" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                        icon={Save}
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
                    </Button>
                </div>
            </div>

            {/* Error alerts if validation fails */}
            {Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <div className="flex items-center gap-2 font-bold mb-1">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Please correct the following errors:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
                        {Object.values(errors).map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 8 Columns: Main Information & Variants */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Package className="w-4 h-4 text-brand-600" />
                                <span>Basic Product Information</span>
                            </CardTitle>
                            <CardDescription>
                                Set title, category taxonomy, brand origin, and detailed specifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Product Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Wireless Noise-Cancelling Headphones Pro"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Category Taxonomy <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <optgroup key={cat.id} label={cat.name}>
                                                <option value={cat.id}>{cat.name} (Main)</option>
                                                {cat.subcategories?.map((sub) => (
                                                    <option key={sub.id} value={sub.id}>
                                                        — {sub.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="e.g. Sony, Apple, Nike"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    SEO URL Slug
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-mono">
                                        /product/
                                    </div>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => {
                                            setIsSlugManual(true);
                                            setSlug(e.target.value);
                                        }}
                                        placeholder="wireless-noise-cancelling-headphones"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Full Product Description & Highlights
                                </label>
                                <textarea
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide detailed specifications, what is included in the package, warranty, and dimensions..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media Upload */}
                    {/* Modern Drag-and-Drop Media Uploader */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-sky-600" />
                                        <span>Product Imagery & Gallery</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Upload product photos (.jpg, .jpeg, .png, .webp up to 4MB). The first image is the Primary Cover.
                                    </CardDescription>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    gallery.length >= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {gallery.length} / 5 Images
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Drag & Drop Upload Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => gallery.length < 5 && fileInputRef.current?.click()}
                                className={`relative p-8 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                                    isDragging
                                        ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
                                        : gallery.length >= 5
                                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                                        : 'border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={handleFileInputChange}
                                    disabled={gallery.length >= 5}
                                    className="hidden"
                                />
                                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-bold text-slate-800">
                                    {gallery.length >= 5 ? (
                                        'Maximum 5 images attached'
                                    ) : (
                                        <>
                                            <span className="text-brand-600 hover:underline">Click to browse</span> or drag & drop product photos here
                                        </>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Supported formats: JPEG, PNG, WEBP &bull; Max 4MB per file &bull; Up to 5 images
                                </p>
                            </div>

                            {/* Error Banner */}
                            {imageError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                    <span>{imageError}</span>
                                </div>
                            )}

                            {/* Images Grid */}
                            {gallery.length === 0 ? (
                                <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/40">
                                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-600">No images attached yet</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Attach up to 5 high-resolution product photos above.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                                        <span>Attached Photos ({gallery.length})</span>
                                        <span className="text-[11px] text-slate-400">Click star to set Primary Cover</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                                        {gallery.map((item, idx) => {
                                            const displayUrl = item.type === 'new' ? item.previewUrl : item.url;
                                            const isPrimary = idx === 0;

                                            return (
                                                <div
                                                    key={item.id || idx}
                                                    className={`group relative rounded-2xl overflow-hidden border transition-all ${
                                                        isPrimary
                                                            ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                                                            : 'border-slate-200 hover:border-slate-300 shadow-xs'
                                                    }`}
                                                >
                                                    <div className="aspect-square bg-slate-100 relative">
                                                        <img
                                                            src={displayUrl}
                                                            alt={item.name || `Product image ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder-product.svg';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Primary Badge */}
                                                    {isPrimary && (
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-600 text-white shadow-sm flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-white" />
                                                            Primary
                                                        </span>
                                                    )}

                                                    {/* File Type Pill */}
                                                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                                                        {item.type === 'new' ? 'New Upload' : 'Saved'}
                                                    </span>

                                                    {/* Actions Overlay */}
                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        {!isPrimary && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetPrimaryImage(idx);
                                                                }}
                                                                className="p-2 rounded-xl bg-white/90 text-amber-600 hover:bg-white hover:text-amber-700 shadow-sm transition-transform hover:scale-110"
                                                                title="Set as Primary / Cover Image"
                                                            >
                                                                <Star className="w-4 h-4 fill-amber-400" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(idx);
                                                            }}
                                                            className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-white hover:text-rose-700 shadow-sm transition-transform hover:scale-110"
                                                            title="Delete / Remove Image"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Variants System */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-purple-600" />
                                        <span>Multi-Attribute Variants</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Configure sizes, colors, and separate SKU stock adjustments.
                                    </CardDescription>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasVariants}
                                        onChange={(e) => {
                                            setHasVariants(e.target.checked);
                                            if (e.target.checked && variants.length === 0) {
                                                handleAddVariant();
                                            }
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </CardHeader>

                        {hasVariants && (
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {variants.map((variant, vIdx) => (
                                        <div
                                            key={variant.id || vIdx}
                                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                                        >
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Option Type
                                                </label>
                                                <select
                                                    value={variant.option_type}
                                                    onChange={(e) => handleUpdateVariant(vIdx, 'option_type', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                                                >
                                                    <option value="Size">Size</option>
                                                    <option value="Color">Color</option>
                                                    <option value="Material">Material</option>
                                                    <option value="Storage">Storage</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Option Value
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.option_value}
                                                    onChange={(e) => handleUpdateVariant(vIdx, 'option_value', e.target.value)}
                                                    placeholder="e.g. XL, Blue"
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Variant SKU
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.sku}
                                                    onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                                                    placeholder="SKU-XL"
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Stock Qty
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={variant.stock}
                                                    onChange={(e) => handleUpdateVariant(vIdx, 'stock', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        Price (+/-)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.price_adjustment}
                                                        onChange={(e) => handleUpdateVariant(vIdx, 'price_adjustment', e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(vIdx)}
                                                    className="p-1.5 mt-4 text-slate-400 hover:text-rose-600 rounded-lg"
                                                    title="Remove Variant"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    icon={Plus}
                                    onClick={handleAddVariant}
                                >
                                    Add Another Variant
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Right 4 Columns: Pricing, Inventory, Profit Margins, and Status */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Status & Visibility Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold">Catalog Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="published">Published (Live on Catalog)</option>
                                <option value="pending_review">In Review (Awaiting Super Admin)</option>
                                <option value="draft">Draft (Hidden)</option>
                            </select>

                            <p className="text-[11px] text-slate-400">
                                {vendor.status !== 'active' 
                                    ? 'Note: Your vendor account is currently pending. Published products will automatically be placed under review.' 
                                    : 'Published items will immediately be indexed on the live storefront and search filters.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pricing & Profit Calculator */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <span>Pricing & Profit Margins</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Selling Price (PKR / Rs.) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="2999"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Compare-at Price (Regular Strikethrough - PKR / Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={comparePrice}
                                    onChange={(e) => setComparePrice(e.target.value)}
                                    placeholder="4999"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Cost per Item (Confidential - PKR / Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={costPerItem}
                                    onChange={(e) => setCostPerItem(e.target.value)}
                                    placeholder="12.50"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Customers won't see this. Used for profit analysis.</span>
                            </div>

                            {/* Live Profit Margin Widget */}
                            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-bold text-emerald-950 block">Net Profit: {formatCurrency(profit)}</span>
                                    <span className="text-[11px] text-emerald-700">Estimated profit margin</span>
                                </div>
                                <span className="text-base font-black text-emerald-600 font-mono">
                                    {margin}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Barcode className="w-4 h-4 text-slate-700" />
                                <span>Inventory & SKU Identifiers</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        SKU Code <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateSku}
                                        className="text-[11px] text-brand-600 hover:text-brand-700 font-bold"
                                    >
                                        Auto-Generate
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="PROD-HEADPH-001"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Barcode / GTIN / UPC / EAN
                                </label>
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="123456789012"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Stock Quantity <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Low-Stock Alert
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={lowStockThreshold}
                                        onChange={(e) => setLowStockThreshold(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}

export default ProductForm;
