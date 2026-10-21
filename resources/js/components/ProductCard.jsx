import React from 'react';
import { Link } from '@inertiajs/react';
import { Heart, ShoppingBag, Check, Store, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getProductImage } from '@/lib/productImage';

export function ProductCard({
    product,
    badge,
    badgeColor,
    sublabel,
    rank,
    onAddToCart,
    onToggleWishlist,
    isAdded = false,
    isInWishlist = false,
}) {
    if (!product) return null;

    const imageSrc = getProductImage(product);
    const vendorName = product.vendor?.shop_name || 'Verified Supplier';
    const discountPercent = product.discount_percentage
        ? Math.round(Number(product.discount_percentage))
        : (product.compare_price && product.compare_price > product.price
            ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
            : 0);

    return (
        <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500 hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden">
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
            {onToggleWishlist && (
                <button
                    type="button"
                    onClick={(e) => onToggleWishlist(product, e)}
                    className={`absolute top-2.5 right-2.5 z-10 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                        isInWishlist
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                    title="Save to Wishlist"
                >
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-white' : ''}`} />
                </button>
            )}

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

                    {onAddToCart && (
                        <button
                            type="button"
                            onClick={(e) => onAddToCart(product, e)}
                            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                                isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-xs'
                            }`}
                            title="Add to Cart"
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Added</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
