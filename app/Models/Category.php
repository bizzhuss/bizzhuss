<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends BaseModel
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'categories';

    protected $guarded = [];

    protected $attributes = [
        'is_active' => true,
        'is_featured' => false,
        'is_verified_featured' => false,
        'order' => 0,
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_verified_featured' => 'boolean',
        'order' => 'integer',
        'commission_rate' => 'float',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    protected $appends = ['products_count'];

    public function getProductsCountAttribute(): int
    {
        if ($this->relationLoaded('products')) {
            return $this->products ? $this->products->count() : 0;
        }
        return $this->products()->count();
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
