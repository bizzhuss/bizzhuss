<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'brand',
        'title',
        'slug',
        'sku',
        'barcode',
        'price',
        'compare_price',
        'cost_per_item',
        'stock_quantity',
        'low_stock_threshold',
        'images',
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
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'cost_per_item' => 'decimal:2',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_featured' => 'boolean',
            'is_on_special_sale' => 'boolean',
            'total_sold_count' => 'integer',
            'featured_order' => 'integer',
            'discount_percentage' => 'decimal:2',
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
