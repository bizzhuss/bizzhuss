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
        ];
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
}
