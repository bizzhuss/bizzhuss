<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCurationController extends Controller
{
    /**
     * Display the Storefront Merchandising & Product Curation Suite.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['vendor:id,shop_name,logo,status', 'category:id,name,slug']);

        // Search filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function ($vq) use ($search) {
                      $vq->where('shop_name', 'like', "%{$search}%");
                  });
            });
        }

        // Category filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $cat = $request->input('category');
            $query->whereHas('category', function ($q) use ($cat) {
                $q->where('slug', $cat)->orWhere('id', $cat);
            });
        }

        // Tab filter
        $tab = $request->input('tab', 'all');
        if ($tab === 'featured' || $tab === 'flagship_featured') {
            $query->inFlagshipFeaturedTier()->orderBy('featured_order', 'asc');
        } elseif ($tab === 'special_sale' || $tab === 'flash_sale') {
            $query->inFlashSaleTier();
        } elseif ($tab === 'budget_picks' || $tab === 'smart_value') {
            $query->inBudgetPicksTier();
        } elseif ($tab === 'enterprise_tier' || $tab === 'enterprise') {
            $query->inEnterpriseTier();
        } elseif ($tab === 'best_sellers') {
            $query->where('total_sold_count', '>', 0)->orderByDesc('total_sold_count');
        } elseif ($tab === 'draft') {
            $query->where('status', 'draft');
        }

        // Default ordering if not already ordered
        if ($tab !== 'featured' && $tab !== 'flagship_featured' && $tab !== 'best_sellers') {
            $query->orderBy('id', 'desc');
        }

        $products = $query->get();
        $categories = Category::select('id', 'name', 'slug')->get();
        $vendors = Vendor::select('id', 'shop_name', 'status')->get();

        // Standardized tier counts synchronized with Homepage sections
        $tiers = Product::getStandardTiers();
        $tierMap = collect($tiers)->keyBy('id');

        // Calculate global platform merchandising KPIs matching homepage queries
        $metrics = [
            'total_products' => Product::activeOrPublished()->count(),
            'featured_count' => $tierMap['flagship_featured']['count'] ?? 0,
            'special_sale_count' => $tierMap['flash_sale']['count'] ?? 0,
            'budget_picks_count' => $tierMap['budget_picks']['count'] ?? 0,
            'enterprise_count' => $tierMap['enterprise_tier']['count'] ?? 0,
            'best_sellers_count' => Product::activeOrPublished()->where('total_sold_count', '>', 0)->count(),
            'total_units_sold' => (int) Product::activeOrPublished()->sum('total_sold_count'),
        ];

        return Inertia::render('Admin/Curation', [
            'products' => $products,
            'categories' => $categories,
            'vendors' => $vendors,
            'metrics' => $metrics,
            'tiers' => $tiers,
            'filters' => $request->only(['search', 'category', 'tab']),
        ]);
    }

    /**
     * Inline Toggle: Featured Product Status & Priority Order.
     */
    public function toggleFeatured(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'is_featured' => 'nullable|boolean',
            'featured_order' => 'nullable|integer|min:0|max:999',
        ]);

        $newFeatured = $request->has('is_featured')
            ? (bool) $request->input('is_featured')
            : !$product->is_featured;

        $product->is_featured = $newFeatured;
        if ($request->has('featured_order')) {
            $product->featured_order = (int) $request->input('featured_order', 0);
        }

        $product->save();

        $msg = $product->is_featured 
            ? "Product \"{$product->title}\" added to Storefront Featured row."
            : "Product \"{$product->title}\" removed from Featured row.";

        return back()->with('success', $msg);
    }

    /**
     * Inline Toggle: Special Sale / Offer Campaign.
     */
    public function toggleSpecialSale(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'is_on_special_sale' => 'nullable|boolean',
            'special_sale_title' => 'nullable|string|max:100',
            'compare_price' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);

        $newSale = $request->has('is_on_special_sale')
            ? (bool) $request->input('is_on_special_sale')
            : !$product->is_on_special_sale;

        $product->is_on_special_sale = $newSale;
        
        if ($newSale) {
            $product->special_sale_title = $request->input('special_sale_title') ?: 'Limited Time Offer';
            if ($request->filled('compare_price')) {
                $product->compare_price = $request->input('compare_price');
            }
            if ($request->filled('price')) {
                $product->price = $request->input('price');
            }
        } else {
            $product->special_sale_title = null;
        }

        $product->save();

        $msg = $product->is_on_special_sale
            ? "Special offer campaign \"{$product->special_sale_title}\" activated for \"{$product->title}\"."
            : "Special offer campaign deactivated for \"{$product->title}\".";

        return back()->with('success', $msg);
    }

    /**
     * Live Priority / Sorting Order Adjustment.
     */
    public function updateOrder(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'featured_order' => 'required|integer|min:0|max:999',
        ]);

        $product->update([
            'featured_order' => (int) $validated['featured_order'],
        ]);

        return back()->with('success', "Display priority for \"{$product->title}\" updated to #{$product->featured_order}.");
    }

    /**
     * Adjust Total Sold Count (for simulated / manual best-seller tuning).
     */
    public function updateSoldCount(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'total_sold_count' => 'required|integer|min:0',
        ]);

        $product->update([
            'total_sold_count' => (int) $validated['total_sold_count'],
        ]);

        return back()->with('success', "Sales counter for \"{$product->title}\" updated to {$product->total_sold_count} units.");
    }

    /**
     * Bulk Action Execution (Featured / Special Sale / Reset).
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|in:make_featured,remove_featured,make_special_sale,remove_special_sale,reset_curation',
            'special_sale_title' => 'nullable|string|max:100',
        ]);

        $ids = $validated['product_ids'];
        $action = $validated['action'];
        $count = count($ids);

        switch ($action) {
            case 'make_featured':
                Product::whereIn('id', $ids)->update(['is_featured' => true]);
                $msg = "Added {$count} products to Storefront Featured row.";
                break;

            case 'remove_featured':
                Product::whereIn('id', $ids)->update(['is_featured' => false]);
                $msg = "Removed {$count} products from Featured row.";
                break;

            case 'make_special_sale':
                $title = $request->input('special_sale_title') ?: 'Exclusive Flash Deal';
                Product::whereIn('id', $ids)->update([
                    'is_on_special_sale' => true,
                    'special_sale_title' => $title,
                ]);
                $msg = "Applied special sale \"{$title}\" to {$count} products.";
                break;

            case 'remove_special_sale':
                Product::whereIn('id', $ids)->update([
                    'is_on_special_sale' => false,
                    'special_sale_title' => null,
                ]);
                $msg = "Removed special sale campaigns from {$count} products.";
                break;

            case 'reset_curation':
                Product::whereIn('id', $ids)->update([
                    'is_featured' => false,
                    'is_on_special_sale' => false,
                    'special_sale_title' => null,
                    'featured_order' => 0,
                ]);
                $msg = "Reset all merchandising curation flags on {$count} products.";
                break;

            default:
                return back()->with('error', 'Invalid curation bulk action specified.');
        }

        return back()->with('success', $msg);
    }
}
