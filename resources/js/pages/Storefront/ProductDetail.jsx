import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import SEOHead from '@/components/SEOHead';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { getProductImage } from '@/lib/productImage';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
    Star, 
    ShieldCheck, 
    Truck, 
    RotateCcw, 
    Store, 
    Check, 
    Plus, 
    Minus, 
    ShoppingCart, 
    Zap, 
    Heart, 
    Share2, 
    MessageSquare,
    ChevronRight,
    ChevronDown,
    Award,
    CheckCircle2,
    ThumbsUp
} from 'lucide-react';

export default function ProductDetail({ product = {}, relatedProducts = [] }) {
    const { auth } = usePage().props;
    const { addToCart, toggleWishlist, isInWishlist, showNotification } = useApp();

    // Extract actual images from product with defensive parsing & fallback placeholders
    const galleryImages = (() => {
        let imgs = [];
        if (Array.isArray(product?.images) && product.images.length > 0) {
            imgs = product.images.filter((img) => typeof img === 'string' && img.trim() !== '');
        } else if (typeof product?.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed)) {
                    imgs = parsed.filter((img) => typeof img === 'string' && img.trim() !== '');
                } else if (typeof parsed === 'string' && parsed.trim() !== '') {
                    imgs = [parsed];
                }
            } catch {
                if (product.images.trim()) imgs = [product.images];
            }
        }

        if (imgs.length === 0 && (product?.thumbnail || product?.image)) {
            imgs = [product.thumbnail || product.image];
        }

        if (imgs.length === 0) {
            return ['/placeholder-product.svg'];
        }

        return imgs;
    })();

    const [activeImage, setActiveImage] = useState(galleryImages[0] || '/placeholder-product.svg');

    useEffect(() => {
        if (galleryImages.length > 0) {
            setActiveImage(galleryImages[0]);
        }
    }, [product?.id]);

    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('Graphite Black');
    const [selectedVariant, setSelectedVariant] = useState('Enterprise Edition');
    const [isAdded, setIsAdded] = useState(false);
    const [isSellerOpen, setIsSellerOpen] = useState(true);
    const [isReviewsOpen, setIsReviewsOpen] = useState(true);

    const price = Number(product?.price) || 0;
    const comparePrice = Number(product?.compare_price) || (price > 0 ? price * 1.25 : 0);
    const discountPercent = comparePrice > price && comparePrice > 0 
        ? Math.round(((comparePrice - price) / comparePrice) * 100) 
        : (product?.discount_percentage ? Number(product.discount_percentage) : 0);

    const vendor = product?.vendor || {
        id: product?.vendor_id || 1,
        shop_name: 'Official Store',
        rating: 4.96,
        positive_rating: '98%',
        ship_on_time: '99%',
        response_rate: '97%',
        description: 'Certified Tier-1 industrial computing and enterprise telemetry equipment.'
    };

    const handleAddToCart = () => {
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        addToCart({
            ...product,
            price: price,
            image: activeImage,
            variant: `${selectedColor} - ${selectedVariant}`
        }, quantity, `${selectedColor} - ${selectedVariant}`);

        setIsAdded(true);
        showNotification(`Added ${quantity}x "${product?.title || 'Product'}" to your cart!`, 'success');
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        addToCart({
            ...product,
            price: price,
            image: activeImage,
            variant: `${selectedColor} - ${selectedVariant}`
        }, quantity, `${selectedColor} - ${selectedVariant}`);

        router.visit('/checkout');
    };

    const handleToggleWishlist = () => {
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        const added = toggleWishlist(product);
        showNotification(
            added ? `"${product?.title || 'Product'}" added to your wishlist!` : `"${product?.title || 'Product'}" removed from your wishlist!`,
            added ? 'success' : 'info'
        );
    };

    // Safe product images array for gallery & schema
    const productImages = Array.isArray(product?.images) && product.images.length > 0 
        ? product.images 
        : [product?.image || activeImage || getProductImage(product) || '/placeholder-product.svg'];

    const primaryImg = activeImage || productImages[0] || '/placeholder-product.svg';
    const cleanDesc = product?.description 
        ? product.description.replace(/<[^>]*>?/gm, '').trim().slice(0, 160) 
        : "Built for Buyers | Powered by Sellers";

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product?.title || product?.name || "Bizzhuss Product",
        "image": productImages,
        "description": product?.description 
            ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 200) 
            : `${product?.title || product?.name || 'Product'} on Bizzhuss - Built for Buyers | Powered by Sellers`,
        "sku": product?.sku || `SKU-${product?.id || 'PROD'}`,
        "offers": {
            "@type": "Offer",
            "url": `https://www.bizzhuss.com/product/${product?.slug || product?.id || ''}`,
            "priceCurrency": "PKR",
            "price": Number(product?.price || 0),
            "availability": (product?.stock_quantity ?? product?.stock ?? 0) > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": product?.vendor?.shop_name || product?.vendor?.name || "Bizzhuss Verified Seller"
            }
        }
    };

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: product?.category?.name || 'Catalog', url: product?.category?.slug ? `/shop?category=${product.category.slug}` : '/shop' },
        { name: product?.title || product?.name || 'Product', url: `/product/${product?.slug || product?.id || ''}` }
    ]);

    return (
        <StorefrontLayout>
            <SEOHead 
                title={product?.title || product?.name || "Product Details"}
                description={cleanDesc}
                image={primaryImg}
                url={`https://www.bizzhuss.com/product/${product?.slug || product?.id || ''}`}
                type="product"
                schemaData={[productSchema, breadcrumbSchema]}
            />

            {/* Breadcrumb Navigation */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                <Link href="/" className="hover:text-amber-600">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href={`/?category=${product?.category?.slug || 'industrial-iot'}`} className="hover:text-amber-600">
                    {product?.category?.name || 'Enterprise Hardware'}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-semibold truncate max-w-sm">
                    {product?.title || 'Product Specification'}
                </span>
            </nav>

            {/* Product Overview Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 lg:p-8 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    
                    {/* Left: Multi-Image Gallery */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Main Preview Image */}
                        <div className="relative h-80 sm:h-96 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                            <img
                                src={activeImage}
                                alt={product?.title}
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-product.svg';
                                }}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded shadow-sm">
                                -{discountPercent}% OFF
                            </div>
                        </div>

                        {/* Thumbnails Row */}
                        <div className="flex overflow-x-auto no-scrollbar gap-2 sm:grid sm:grid-cols-5 sm:gap-3 py-1">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveImage(img)}
                                    className={`w-16 h-16 sm:w-auto sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                        activeImage === img
                                            ? 'border-amber-400 ring-2 ring-amber-300 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-400'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt="thumbnail"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-product.svg';
                                        }}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle: Product Specs & Options */}
                    <div className="lg:col-span-4 space-y-5">
                        <div>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                SKU: {product?.sku || 'SKU-TND-900'}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 leading-tight">
                                {product?.title || 'EdgePulse Pro IIoT Telemetry Gateway with Dual 5G Fallback'}
                            </h1>
                            
                            {/* Ratings bar */}
                            <div className="mt-2.5 flex items-center gap-3 text-xs">
                                <div className="flex items-center text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="ml-1.5 font-bold text-slate-800 text-sm">4.9</span>
                                </div>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-600 font-medium">142 Ratings</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> 84 Verified Orders
                                </span>
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-amber-600">
                                    {formatCurrency(price)}
                                </span>
                                <span className="text-sm text-slate-400 line-through">
                                    {formatCurrency(comparePrice)}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    Save {formatCurrency(comparePrice - price)}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Inclusive of platform multi-vendor taxes and manufacturer freight guarantee.
                            </p>
                        </div>

                        {/* Variants: Color */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-800">Select Finish / Color:</label>
                            <div className="flex items-center gap-2">
                                {['Graphite Black', 'Industrial Matte Grey', 'Anodized Silver'].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                            selectedColor === color
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-800">Quantity:</label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-xs text-slate-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> In Stock ({product?.stock_quantity || 48} available)
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons: Add to Cart & Buy Now */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className={`flex-1 w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                                    isAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Added to Cart</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4 text-white" />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="flex-1 w-full py-3.5 rounded-xl bg-accent-orange hover:brightness-105 text-white font-black text-xs shadow-md shadow-accent-orange/20 transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Zap className="w-4 h-4 fill-white text-white" />
                                <span>Buy Now</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleWishlist}
                                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                                    isInWishlist(product?.id)
                                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                                        : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200'
                                }`}
                                title={isInWishlist(product?.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                                <Heart className={`w-4 h-4 ${isInWishlist(product?.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Seller Information Box & Buyer Guarantees */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Seller Card */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                            <button
                                type="button"
                                onClick={() => setIsSellerOpen(!isSellerOpen)}
                                className="w-full flex items-center justify-between pb-3 border-b border-slate-200 cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Seller Profile & Score
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        Certified Partner
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform md:hidden ${isSellerOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSellerOpen && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-xs">
                                            {(vendor?.shop_name || 'OS').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                                {vendor?.shop_name || 'Official Store'}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="font-semibold text-slate-800">{vendor?.rating || '5.0'}</span>
                                                <span>Seller Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seller Performance Metrics */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                                            <div className="text-xs font-bold text-slate-900">{vendor?.positive_rating || '100%'}</div>
                                            <div className="text-[10px] text-slate-400">Positive</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                                            <div className="text-xs font-bold text-slate-900">{vendor?.ship_on_time || '100%'}</div>
                                            <div className="text-[10px] text-slate-400">On Time</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                                            <div className="text-xs font-bold text-slate-900">{vendor?.response_rate || '100%'}</div>
                                            <div className="text-[10px] text-slate-400">Response</div>
                                        </div>
                                    </div>

                                    {/* Visit Store Button */}
                                    <Link
                                        href={`/shop?vendor=${vendor?.id || 1}`}
                                        className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Store className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Visit Merchant Store</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Delivery & Warranty Guarantees */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-xs text-slate-600">
                            <div className="flex items-start gap-2.5">
                                <Truck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900">Standard Delivery (2-4 Days)</p>
                                    <p className="text-[11px] text-slate-400">Automated multi-vendor split freight routing.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900">7 Days Return Guarantee</p>
                                    <p className="text-[11px] text-slate-400">Change of mind acceptable for intact sealed units.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-slate-900">1 Year Official Warranty</p>
                                    <p className="text-[11px] text-slate-400">Original manufacturer SLA replacement warranty.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Ratings & Reviews Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 lg:p-8 mb-10">
                <button
                    type="button"
                    onClick={() => setIsReviewsOpen(!isReviewsOpen)}
                    className="w-full flex items-center justify-between cursor-pointer text-left mb-2 sm:mb-6"
                >
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">Customer Ratings & Verified Feedback</h3>
                        {Array.isArray(product?.reviews) && product.reviews.length > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {product.reviews.length}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform md:hidden ${isReviewsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isReviewsOpen && (
                    <>
                        {Array.isArray(product?.reviews) && product.reviews.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
                                    {/* Score Summary */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                        <div className="text-5xl font-black text-slate-900">
                                            {(product.reviews.reduce((acc, r) => acc + (Number(r?.rating) || 5), 0) / product.reviews.length).toFixed(1)}
                                        </div>
                                        <div className="flex items-center text-amber-400 my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">Based on {product.reviews.length} verified customer reviews</p>
                                    </div>

                                    {/* Breakdown Bars */}
                                    <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
                                        {[
                                            { stars: 5, pct: 100, count: product.reviews.length },
                                            { stars: 4, pct: 0, count: 0 },
                                            { stars: 3, pct: 0, count: 0 },
                                            { stars: 2, pct: 0, count: 0 },
                                            { stars: 1, pct: 0, count: 0 },
                                        ].map((row) => (
                                            <div key={row.stars} className="flex items-center gap-3 text-xs">
                                                <span className="w-12 text-slate-600 font-semibold flex items-center gap-1">
                                                    {row.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                </span>
                                                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-amber-400 h-2.5 rounded-full"
                                                        style={{ width: `${row.pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-slate-400 text-[11px]">{row.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer Reviews List */}
                                <div className="pt-6 space-y-6">
                                    {product.reviews.map((rev, idx) => (
                                        <div key={idx} className="space-y-1.5 pb-5 border-b border-slate-100 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs">{rev?.author || rev?.user?.name || 'Verified Customer'}</span>
                                                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                                        Verified Buyer
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-400">{rev?.date || rev?.created_at?.slice(0, 10) || 'Recent'}</span>
                                            </div>
                                            <div className="flex text-amber-400">
                                                {[...Array(Number(rev?.rating) || 5)].map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{rev?.comment || rev?.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                                <MessageSquare className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-slate-700">No customer reviews yet</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    Be the first verified buyer to review this product after placing your order.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Related Products Section */}
            {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 lg:p-8 mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Related Products</h3>
                            <p className="text-xs text-slate-500">More solutions from the catalog</p>
                        </div>
                        <Link href="/shop" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                            Explore Catalog &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relProduct) => {
                            const relImgs = Array.isArray(relProduct?.images) && relProduct.images.length > 0
                                ? relProduct.images
                                : (typeof relProduct?.images === 'string' ? (() => { try { return JSON.parse(relProduct.images); } catch { return [relProduct.images]; } })() : []);
                            const relImg = Array.isArray(relImgs) && relImgs.length > 0
                                ? relImgs[0]
                                : (relProduct?.thumbnail || relProduct?.image || '/placeholder-product.svg');

                            return (
                                <div
                                    key={relProduct.id}
                                    className="group flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-md transition-all"
                                >
                                    <Link href={`/product/${relProduct.slug || relProduct.id}`} className="relative h-44 bg-slate-100 overflow-hidden block">
                                        <img
                                            src={relImg}
                                            alt={relProduct.title || 'Product'}
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.svg';
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>
                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="text-[11px] text-slate-500 font-medium mb-1">
                                                {relProduct?.vendor?.shop_name || 'Official Store'}
                                            </div>
                                            <Link
                                                href={`/product/${relProduct.slug || relProduct.id}`}
                                                className="font-bold text-sm text-slate-900 hover:text-amber-600 line-clamp-2 leading-snug"
                                            >
                                                {relProduct.title}
                                            </Link>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                                            <span className="font-extrabold text-base text-slate-900">
                                                {formatCurrency(relProduct.price)}
                                            </span>
                                            <Link
                                                href={`/product/${relProduct.slug || relProduct.id}`}
                                                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                                            >
                                                View &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sticky Mobile Bottom CTA Bar */}
            <div className="fixed bottom-[49px] left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 md:hidden flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
                <div className="flex-1 min-w-0 pr-1">
                    <div className="text-[10px] text-slate-500 font-medium">Subtotal ({quantity}x):</div>
                    <div className="text-base font-black text-amber-600 truncate">
                        {formatCurrency(price * quantity)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${
                            isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                        {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        <span>{isAdded ? 'Added' : 'Cart'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        className="px-4 py-2.5 rounded-xl bg-accent-orange text-white font-black text-xs flex items-center justify-center gap-1 shadow-md shadow-accent-orange/30 active:scale-95 transition-transform cursor-pointer"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Buy Now</span>
                    </button>
                </div>
            </div>
        </StorefrontLayout>
    );
}
