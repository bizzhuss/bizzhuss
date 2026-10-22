<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'brand',
        'title',
        'name',
        'slug',
        'sku',
        'barcode',
        'price',
        'compare_price',
        'cost_per_item',
        'stock_quantity',
        'stock',
        'low_stock_threshold',
        'image',
        'images',
        'featured_image',
        'thumbnail',
        'description',
        'variants',
        'variations',
        'reviews',
        'rating',
        'ratings_count',
        'status',
        'is_featured',
        'is_on_special_sale',
        'special_sale_title',
        'total_sold_count',
        'featured_order',
        'curation_tier',
        'discount_percentage',
        'flash_sale_end_time',
        'sale_badge_label',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_price' => 'float',
            'cost_per_item' => 'float',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_featured' => 'boolean',
            'is_on_special_sale' => 'boolean',
            'total_sold_count' => 'integer',
            'featured_order' => 'integer',
            'discount_percentage' => 'float',
            'flash_sale_end_time' => 'datetime',
            'images' => 'array',
            'variants' => 'array',
            'variations' => 'array',
            'reviews' => 'array',
            'rating' => 'float',
            'ratings_count' => 'integer',
        ];
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Scope for products with active or published status.
     */
    public function scopeActiveOrPublished($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('status', ['active', 'published'])
              ->orWhereNull('status');
        });
    }

    /**
     * Scope for Flash Sale / Special Sale Tier products.
     */
    public function scopeInFlashSaleTier($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('curation_tier', ['special_flash_sale', 'flash_sale', 'flash-sale'])
              ->orWhereIn('tier', ['flash_sale', 'flash-sale', 'special_flash_sale'])
              ->orWhereIn('tier_slug', ['flash-sale', 'special-flash-sale'])
              ->orWhere('badge', 'Flash Deal')
              ->orWhere('sale_badge_label', 'Flash Deal')
              ->orWhere('is_on_special_sale', true)
              ->orWhere('is_flash_sale', true);
        });
    }

    /**
     * Scope for Smart Value & Budget Picks Tier products.
     */
    public function scopeInBudgetPicksTier($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('curation_tier', ['smart_value_budget', 'budget_picks', 'budget-picks', 'smart_value', 'smart-value'])
              ->orWhereIn('tier', ['budget_picks', 'budget-picks', 'smart_value', 'smart-value', 'smart_value_budget'])
              ->orWhereIn('tier_slug', ['smart-value-budget-picks', 'budget-picks', 'smart-value'])
              ->orWhere('badge', 'Smart Value')
              ->orWhere('sale_badge_label', 'Smart Value')
              ->orWhere('price', '<=', 1000);
        });
    }

    /**
     * Scope for Enterprise & Heavy Duty Tier products.
     */
    public function scopeInEnterpriseTier($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('curation_tier', ['enterprise_heavy_duty', 'enterprise_tier', 'enterprise'])
              ->orWhereIn('tier', ['enterprise_tier', 'enterprise', 'enterprise_heavy_duty'])
              ->orWhereIn('tier_slug', ['enterprise-heavy-duty-tier', 'enterprise-tier', 'enterprise'])
              ->orWhere('badge', 'Bulk Campaign Eid')
              ->orWhere('sale_badge_label', 'Bulk Campaign Eid')
              ->orWhere('badge', 'like', '%Enterprise%')
              ->orWhere('sale_badge_label', 'like', '%Enterprise%');
        });
    }

    /**
     * Scope for Flagship Featured Tier products.
     */
    public function scopeInFlagshipFeaturedTier($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('curation_tier', ['flagship_featured', 'flagship', 'featured'])
              ->orWhereIn('tier', ['flagship_featured', 'flagship', 'featured'])
              ->orWhereIn('tier_slug', ['flagship-featured', 'featured'])
              ->orWhere('is_featured', true);
        });
    }

    /**
     * Get the standardized Tier definitions and product counts synchronized with Homepage sections.
     */
    public static function getStandardTiers(): array
    {
        $base = static::activeOrPublished();

        return [
            [
                'id' => 'flash_sale',
                'slug' => 'flash-sale',
                'title' => 'Special Flash Sale Tier',
                'count' => (clone $base)->inFlashSaleTier()->count(),
            ],
            [
                'id' => 'budget_picks',
                'slug' => 'budget-picks',
                'title' => 'Smart Value & Budget Picks',
                'count' => (clone $base)->inBudgetPicksTier()->count(),
            ],
            [
                'id' => 'enterprise_tier',
                'slug' => 'enterprise-tier',
                'title' => 'Enterprise & Heavy Duty Tier',
                'count' => (clone $base)->inEnterpriseTier()->count(),
            ],
            [
                'id' => 'flagship_featured',
                'slug' => 'flagship-featured',
                'title' => 'Flagship Featured Showcase',
                'count' => (clone $base)->inFlagshipFeaturedTier()->count(),
            ],
        ];
    }
}
