import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { getProductImage } from '@/lib/productImage';
import { 
    Flame, 
    Clock, 
    Star, 
    ShoppingCart, 
    Check, 
    Plus, 
    ChevronRight, 
    ChevronLeft,
    ShieldCheck, 
    Truck, 
    RotateCcw, 
    Zap, 
    Layers, 
    Store,
    ArrowRight,
    Cpu,
    Wrench,
    Briefcase,
    Sparkles,
    Eye,
    Percent,
    Heart,
    Award,
    TrendingUp,
    BadgeDollarSign,
    Gem,
    Package,
    X
} from 'lucide-react';

const ICON_MAP = {
    Cpu,
    Layers,
    Wrench,
    Briefcase,
    Zap,
    Package,
    Store,
    ShoppingBag: Package,
    Tag: Package,
    Sparkles,
    ShieldCheck,
    Truck,
    Flame,
};

function getCategoryIcon(iconName) {
    if (!iconName) return Package;
    if (typeof iconName !== 'string') return iconName;
    return ICON_MAP[iconName] || Package;
}

const heroSlides = [
    {
        id: 1,
        title: 'Premier Multi-Vendor Marketplace',
        subtitle: 'Verified Manufacturers, Direct Factory Pricing & Certified Enterprise Quality',
        tag: 'OFFICIAL PLATFORM',
        discount: 'Verified Merchant Network',
        bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
        ctaText: 'Explore Catalog',
        ctaLink: '/shop',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    }
];

export default function Home({ 
    categories = [], 
    products = [], 
    banners = [],
    activeCampaign = null,
    flashSaleEndTime = null,
    featuredProducts = [], 
    specialSaleProducts = [], 
    bestSellingProducts = [], 
    budgetPicks = [], 
    enterpriseHeavyDuty = [],
    premiumLuxury = [], 
    featuredVendors = [], 
    filters = {} 
}) {
    const { auth } = usePage().props;
    const { addToCart, toggleWishlist, isInWishlist, showNotification } = useApp();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [addedIds, setAddedIds] = useState({});
    const [inspectedStore, setInspectedStore] = useState(null);

    // Touch swipe gestures state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 40;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            setCurrentSlide((prev) => (prev + 1) % (activeSlides.length || 1));
        } else if (distance < -minSwipeDistance) {
            setCurrentSlide((prev) => (prev - 1 + (activeSlides.length || 1)) % (activeSlides.length || 1));
        }
    };

    // Dynamic Banner Slides with fallback
    const activeSlides = (banners && banners.length > 0)
        ? banners.map((b, idx) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle || 'Direct Manufacturer Pricing & Certified Enterprise Quality',
            tag: b.badge_text || 'EXCLUSIVE PROMOTIONAL EVENT',
            discount: 'Official Verified Deal',
            bgGradient: idx % 3 === 0
                ? 'from-slate-950 via-slate-900 to-indigo-950'
                : idx % 3 === 1
                ? 'from-amber-950 via-slate-900 to-stone-900'
                : 'from-slate-900 via-stone-900 to-emerald-950',
            ctaText: 'Explore Offer',
            ctaLink: b.target_url || '#special-sales',
            image: b.image_url || b.image_path,
        }))
        : heroSlides;

    // Live countdown timer state for Flash / Special Deals
    const computeTimeLeft = () => {
        const targetDate = flashSaleEndTime ? new Date(flashSaleEndTime) : (activeCampaign?.end_time ? new Date(activeCampaign.end_time) : null);
        if (targetDate && !isNaN(targetDate.getTime())) {
            const diff = targetDate.getTime() - Date.now();
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                return { hours, minutes, seconds };
            }
        }
        return { hours: 7, minutes: 24, seconds: 48 };
    };

    const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(computeTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [flashSaleEndTime, activeCampaign]);

    // Auto-advance banner slide
    useEffect(() => {
        const slideTimer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % (activeSlides.length || 1));
        }, 6000);
        return () => clearInterval(slideTimer);
    }, [activeSlides.length]);

    const handleAddToCart = (product, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        addToCart(product, 1);
        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        showNotification(`"${product.title}" added to your cart!`, 'success');
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 1500);
    };

    const handleToggleWishlist = (product, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!auth?.user) {
            router.visit(`/login?intended=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent('Please sign in to add items to your cart or wishlist.')}`);
            return;
        }
        const added = toggleWishlist(product);
        showNotification(
            added ? `"${product.title}" added to your wishlist!` : `"${product.title}" removed from your wishlist!`,
            added ? 'success' : 'info'
        );
    };

    const pageCategories = (categories && categories.length > 0) ? categories : (usePage().props.categories || []);
    const rootCategories = Array.isArray(pageCategories) ? pageCategories.filter((c) => !c.parent_id) : [];
    const displayCategories = rootCategories.length > 0 ? rootCategories : (Array.isArray(pageCategories) ? pageCategories : []);

    const verifiedFeatured = Array.isArray(pageCategories) ? pageCategories.filter((c) => Boolean(c.is_verified_featured)) : [];
    const displayVerifiedCategories = verifiedFeatured.length > 0 ? verifiedFeatured : displayCategories;

    // Reusable Product Card Component
    const renderCard = (product, { badge, badgeColor, sublabel, rank } = {}) => {
        const isAdded = addedIds[product.id];
        const imageSrc = getProductImage(product);
        const vendorName = product.vendor?.shop_name || 'Verified Supplier';
        const discountPercent = product.discount_percentage
            ? Math.round(Number(product.discount_percentage))
            : (product.compare_price && product.compare_price > product.price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0);

        return (
            <div
                key={product.id}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500 hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden"
            >
                {/* Ranking or Top Badge */}
                {rank && (
                    <div className="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-lg bg-slate-950 text-accent-orange font-black text-xs flex items-center justify-center shadow-md">
                        #{rank}
                    </div>
                )}

                {/* Primary Promotional Badge */}
                {badge && (
                    <div className={`absolute ${rank ? 'top-2.5 left-11' : 'top-2.5 left-2.5'} z-10 px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider shadow-xs ${
                        badgeColor || 'bg-brand-500 text-white'
                    }`}>
                        {badge}
                    </div>
                )}

                {/* Discount Percentage Pill */}
                {discountPercent > 0 && !badge && !rank && (
                    <div className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(product, e)}
                    className={`absolute top-2.5 right-2.5 z-10 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                        isInWishlist(product.id)
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                    title="Save to Wishlist"
                >
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                </button>

                {/* Image Container */}
                <Link href={`/product/${product.slug || product.id}`} className="relative h-36 sm:h-48 bg-slate-100 overflow-hidden block">
                    <img
                        src={imageSrc}
                        alt={product.title}
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.svg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {product.sku || `SKU-${product.id}`}
                    </div>
                </Link>

                {/* Card Content */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div>
                        {/* Vendor & Category Header */}
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mb-1">
                            <span className="truncate flex items-center gap-1 font-medium text-slate-600">
                                <Store className="w-3 h-3 text-brand-500 shrink-0" />
                                {vendorName}
                            </span>
                            <span className="text-slate-400 text-[9px] sm:text-[10px] hidden sm:inline">{product.category?.name}</span>
                        </div>

                        {/* Title */}
                        <Link 
                            href={`/product/${product.slug || product.id}`}
                            className="text-[11px] sm:text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                        >
                            {product.title}
                        </Link>

                        {/* Special Sale Title or Sublabel */}
                        {sublabel && (
                            <p className="mt-1 text-[10px] sm:text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="truncate">{sublabel}</span>
                            </p>
                        )}
                        {!sublabel && product.total_sold_count > 0 && (
                            <p className="mt-1 text-[10px] sm:text-[11px] font-medium text-slate-500">
                                <strong className="text-slate-700 font-bold">{product.total_sold_count}</strong> sold
                            </p>
                        )}
                    </div>

                    {/* Price and Cart Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <div className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                                {formatCurrency(product.price)}
                            </div>
                            {product.compare_price && product.compare_price > product.price && (
                                <div className="text-[10px] sm:text-[11px] text-slate-400 line-through truncate">
                                    {formatCurrency(product.compare_price)}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-xl transition-all cursor-pointer shrink-0 ${
                                isAdded 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                            }`}
                            title="Add to Cart"
                        >
                            {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <StorefrontLayout>
            <Head title="Bizzhuss - High-Scale Multi-Vendor Marketplace" />

            {/* 1. Main Hero Area: Category Sidebar + Promo Carousel */}
            <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Vertical Category Quick Sidebar */}
                    <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 divide-y divide-slate-100">
                        <div className="pb-2.5 px-3 pt-1">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Categories
                            </span>
                        </div>
                        <div className="pt-2 space-y-1">
                            {displayCategories && displayCategories.length > 0 ? (
                                displayCategories.map((cat) => {
                                    const Icon = getCategoryIcon(cat.icon);
                                    return (
                                        <Link
                                            key={cat.id || cat.slug}
                                            href={`/category/${cat.slug}`}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50/60 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" />
                                                <span className="truncate">{cat.name}</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 p-3">No categories found</p>
                            )}
                        </div>

                        {/* Marketplace Guarantee Callout */}
                        <div className="pt-3 px-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                                    <span>Bizzhuss Escrow Assurance</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug">
                                    100% Authentic products from verified Tier-1 manufacturers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Promo Banner Carousel with Touch Gestures */}
                    <div
                        className="lg:col-span-3 relative flex flex-col justify-between"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800 bg-slate-950 min-h-[260px] sm:min-h-[380px] flex items-center">
                            {activeSlides.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-opacity duration-700 flex flex-col md:flex-row items-start md:items-center justify-between p-5 sm:p-10 ${
                                        idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    {/* Background Image */}
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                                        style={{ backgroundImage: `url(${slide.image})` }}
                                    />
                                    {/* Mobile vertical gradient overlay & desktop horizontal gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-60 hidden md:block`} />

                                    {/* Content Column */}
                                    <div className="relative z-10 max-w-lg flex flex-col justify-between h-full md:h-auto text-white">
                                        <div>
                                            {/* Tag Badge */}
                                            <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 font-semibold rounded-full w-fit mb-2 bg-blue-600 text-white shadow-xs">
                                                <Sparkles className="w-3 h-3 text-white" />
                                                <span>{slide.tag}</span>
                                            </div>

                                            {/* Title */}
                                            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold leading-tight line-clamp-2 text-white">
                                                {slide.title}
                                            </h1>

                                            {/* Subtitle / Description */}
                                            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1.5 mb-4 leading-relaxed">
                                                {slide.subtitle}
                                            </p>
                                        </div>

                                        {/* Mobile Action Buttons */}
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <a
                                                href={slide.ctaLink}
                                                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 text-white shadow-md active:scale-95 flex items-center justify-center gap-2 transition-all hover:bg-blue-700 cursor-pointer"
                                            >
                                                <span>{slide.ctaText}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                            <span className="px-3 py-2 text-xs text-slate-300 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 font-medium">
                                                {slide.discount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desktop Product Image */}
                                    <div className="relative z-10 hidden md:block shrink-0 max-w-[280px]">
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="w-64 h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-300"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Carousel Arrow Controls (Hidden on Mobile) */}
                            <button
                                type="button"
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
                                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
                                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Subtle Pagination Dot Indicators */}
                        <div className="flex justify-center items-center gap-1.5 mt-3">
                            {activeSlides.map((_, dotIdx) => (
                                <button
                                    key={`dot-${dotIdx}`}
                                    type="button"
                                    onClick={() => setCurrentSlide(dotIdx)}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        dotIdx === currentSlide
                                            ? 'w-5 h-1.5 bg-blue-600 rounded-full'
                                            : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 rounded-full'
                                    }`}
                                    aria-label={`Go to slide ${dotIdx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Super Admin Curated Featured Products Showcase */}
            {featuredProducts.length > 0 && (
                <section id="featured-products" className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200/60">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                                    <span>Super Admin Curated</span>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-xs text-slate-500 font-medium">Editor's Top Priority Selection</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                                Featured Flagship Products
                            </h2>
                        </div>
                        <Link
                            href="/shop"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>EXPLORE FULL SHOWCASE</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {featuredProducts.map((p, idx) => 
                            renderCard(p, {
                                badge: p.sale_badge_label || (p.featured_order > 0 ? `Featured #${p.featured_order}` : 'Editor Pick'),
                                badgeColor: 'bg-brand-500 text-white font-black',
                                sublabel: p.is_on_special_sale ? p.special_sale_title : null,
                            })
                        )}
                    </div>
                </section>
            )}

            {/* 3. Special Sales & Promotional Offers (Daraz / Amazon Limited-Time Style) */}
            {specialSaleProducts.length > 0 && (
                <section id="special-sales" className="mb-12 bg-gradient-to-br from-rose-950 via-slate-950 to-slate-900 rounded-3xl p-4 sm:p-8 text-white border border-rose-900/40 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-rose-800/40 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
                                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                                    <span>Special Flash Offer</span>
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                                Limited-Time Deals & Special Sale Offers
                            </h2>
                            <p className="text-xs text-slate-300">
                                Deep promotional discounts configured by store administration. Act before timer expires.
                            </p>
                        </div>

                        {/* Live Timer Countdown */}
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-800 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl shrink-0 self-start sm:self-auto">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-300">Ends in:</span>
                            <div className="flex items-center gap-1 font-mono font-black text-xs text-white">
                                <span className="bg-slate-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-amber-400">
                                    {String(timeLeft.hours).padStart(2, '0')}h
                                </span>
                                <span>:</span>
                                <span className="bg-slate-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-amber-400">
                                    {String(timeLeft.minutes).padStart(2, '0')}m
                                </span>
                                <span>:</span>
                                <span className="bg-rose-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-white">
                                    {String(timeLeft.seconds).padStart(2, '0')}s
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {specialSaleProducts.map((p) => 
                            renderCard(p, {
                                badge: p.sale_badge_label || p.special_sale_title || 'Mega Offer',
                                badgeColor: 'bg-rose-500 text-white font-black',
                                sublabel: p.special_sale_title,
                            })
                        )}
                    </div>
                </section>
            )}

            {/* 4. Top Trending Best Sellers (Backed by total_sold_count) */}
            {bestSellingProducts.length > 0 && (
                <section id="best-sellers" className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-bold border border-emerald-300/40">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>High Demand Leaderboard</span>
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                                Top Trending Best Sellers
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Verified by completed order volume and buyer re-orders across all categories.
                            </p>
                        </div>

                        <Link
                            href="/shop?sort=popular"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>VIEW FULL LEADERBOARD</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {bestSellingProducts.map((p, idx) => 
                            renderCard(p, {
                                rank: idx + 1,
                                sublabel: `${p.total_sold_count || 120} units sold to date`,
                            })
                        )}
                    </div>
                </section>
            )}

            {/* 5. Featured Categories Rounded Grid */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Shop by Verified Category
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Direct manufacturer and distributor supply chains</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
                    {displayVerifiedCategories && displayVerifiedCategories.length > 0 ? (
                        displayVerifiedCategories.map((cat) => {
                            const Icon = getCategoryIcon(cat.icon);
                            return (
                                <Link
                                    key={cat.id || cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="group relative bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center"
                                >
                                    {cat.is_verified_featured && (
                                        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold">
                                            <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                            <span>Featured</span>
                                        </span>
                                    )}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-500 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors mb-2.5 sm:mb-3">
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                        {cat.name}
                                    </h3>
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                                        {cat.products_count ?? 0} Items
                                    </p>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                            No categories found
                        </div>
                    )}
                </div>
            </section>

            {/* 6. Budget Picks / Best Value Deals (Sorted by price ASC) */}
            {budgetPicks.length > 0 && (
                <section id="budget-picks" className="mb-12 bg-amber-500/10 border border-amber-400/40 rounded-3xl p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-200/60 mb-6 gap-2">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                                <BadgeDollarSign className="w-4 h-4 text-amber-700" />
                                <span>High Value, Low Cost</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                                Smart Value & Budget Picks
                            </h2>
                            <p className="text-xs text-slate-700 mt-0.5">
                                Essential supplies, tool kits, and accessories sorted by lowest entry price.
                            </p>
                        </div>
                        <Link
                            href="/shop?sort=price_asc"
                            className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>SEE ALL VALUE DEALS</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {budgetPicks.map((p) => 
                            renderCard(p, {
                                badge: p.sale_badge_label || 'Value Choice',
                                badgeColor: 'bg-emerald-600 text-white font-bold',
                            })
                        )}
                    </div>
                </section>
            )}

            {/* 7. Premium Luxury & Industrial Flagships (Sorted by price DESC) */}
            {premiumLuxury.length > 0 && (
                <section id="premium-luxury" className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                                    <Gem className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Enterprise & Heavy Duty Tier</span>
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                                Premium Machinery & Flagship Hardware
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Top-tier server racks, heavy impact tooling, and high-temp industrial pyrometers.
                            </p>
                        </div>

                        <Link
                            href="/shop?sort=price_desc"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>VIEW PREMIUM LINEUP</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {(enterpriseHeavyDuty.length > 0 ? enterpriseHeavyDuty : premiumLuxury).map((p) => 
                            renderCard(p, {
                                badge: p.sale_badge_label || 'Enterprise Flagship',
                                badgeColor: 'bg-slate-900 text-white font-bold',
                            })
                        )}
                    </div>
                </section>
            )}

            {/* 8. Complete Daily Catalog / Filtered Results */}
            <section id="all-products" className="mb-12">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Explore Complete Marketplace Catalog
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time inventory from verified multi-vendor marketplace sellers.
                        </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200/80 text-slate-800">
                        {products.length} Products Available
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {products.map((product) => 
                        renderCard(product, {
                            sublabel: product.is_on_special_sale ? product.special_sale_title : null,
                        })
                    )}
                </div>
            </section>

            {/* 9. Certified Marketplace Merchants Spotlight */}
            <section className="mb-10 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Audited Marketplace Merchants</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black">Official Certified Brand Stores</h2>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl">
                            Each vendor is vetted for SLA fulfillment, strict product authenticity, and automated split-order disbursement.
                        </p>
                    </div>

                    <Link
                        href="/register?role=vendor"
                        className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shrink-0 transition-transform hover:scale-102 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Store className="w-4 h-4" />
                        <span>Open a Store on Bizzhuss</span>
                    </Link>
                </div>

                <div className="mt-6">
                    {featuredVendors && featuredVendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {featuredVendors.map((vendor) => (
                                <div key={vendor.id || vendor.slug} className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-white text-sm">{vendor.shop_name}</h3>
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                                ★ Verified Store
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                            {vendor.description || 'Verified enterprise merchant offering direct manufacturer pricing and authentic products.'}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Active Store
                                        </span>
                                        <Link
                                            href={`/shop?vendor=${vendor.slug || vendor.id}`}
                                            className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <span>Visit Store</span>
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                            <Store className="w-10 h-10 text-brand-400 mx-auto mb-3 opacity-80" />
                            <h3 className="text-base font-bold text-white mb-1">Certified Vendor Network Initializing</h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                                Certified merchant stores are currently undergoing SLA verification. New enterprise supplier catalogs will be published here.
                            </p>
                            <Link
                                href="/register?role=vendor"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors"
                            >
                                <Store className="w-3.5 h-3.5" />
                                <span>Apply for Merchant Onboarding</span>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Store Inspection Modal */}
            {inspectedStore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setInspectedStore(null)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-black text-lg">
                                {inspectedStore.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    {inspectedStore.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                        ★ {inspectedStore.rating}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {inspectedStore.compliance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-5">
                            {inspectedStore.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                                    Platform Fee
                                </span>
                                <span className="text-xs font-black text-white mt-0.5 block">
                                    {inspectedStore.fee}
                                </span>
                            </div>
                            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                                    Catalog Status
                                </span>
                                <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                                    {inspectedStore.productsCount}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setInspectedStore(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <Link
                                href={`/shop?vendor=${inspectedStore.id}`}
                                onClick={() => setInspectedStore(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors inline-flex items-center gap-1.5"
                            >
                                <span>Browse Catalog</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
