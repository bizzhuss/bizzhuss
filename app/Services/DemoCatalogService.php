<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class DemoCatalogService
{
    /**
     * Get active categories from database.
     */
    public static function categories(): Collection
    {
        try {
            return Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['subcategories' => fn ($q) => $q->where('is_active', true)])
                ->orderBy('order', 'asc')
                ->get();
        } catch (\Throwable $e) {
            return collect();
        }
    }

    /**
     * Get fallback featured vendors (empty - strictly database driven).
     */
    public static function vendors(): Collection
    {
        return collect();
    }

    /**
     * Get fallback hero carousel promotional banners (empty - strictly database driven).
     */
    public static function banners(): Collection
    {
        return collect();
    }

    /**
     * Get fallback product catalog (empty - strictly database driven).
     */
    public static function products(): Collection
    {
        return collect();
    }

    /**
     * Get paginated fallback products for shop (empty - strictly database driven).
     */
    public static function paginateProducts(int $perPage = 12): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            collect([]),
            0,
            $perPage,
            1,
            ['path' => url('/shop')]
        );
    }
}
