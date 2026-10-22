<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingCurationController extends Controller
{
    /**
     * Display the Marketing Curation Hub.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['vendor:id,shop_name,logo,status', 'category:id,name,slug'])
            ->whereHas('vendor', function ($q) {
                $q->where('status', 'active');
            });

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

        // Vendor filter
        if ($request->filled('vendor') && $request->input('vendor') !== 'all') {
            $query->where('vendor_id', $request->input('vendor'));
        }

        // Category filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $cat = $request->input('category');
            $query->whereHas('category', function ($q) use ($cat) {
                $q->where('slug', $cat)->orWhere('id', $cat);
            });
        }

        // Tier filter matching standardized homepage criteria
        if ($request->filled('tier') && $request->input('tier') !== 'all') {
            $tier = $request->input('tier');
            if ($tier === 'flagship_featured' || $tier === 'flagship' || $tier === 'flagship-featured') {
                $query->inFlagshipFeaturedTier();
            } elseif ($tier === 'special_flash_sale' || $tier === 'flash_sale' || $tier === 'flash-sale') {
                $query->inFlashSaleTier();
            } elseif ($tier === 'smart_value_budget' || $tier === 'budget_picks' || $tier === 'budget-picks' || $tier === 'smart_value') {
                $query->inBudgetPicksTier();
            } elseif ($tier === 'enterprise_heavy_duty' || $tier === 'enterprise_tier' || $tier === 'enterprise' || $tier === 'enterprise-tier') {
                $query->inEnterpriseTier();
            } elseif ($tier === 'none' || $tier === 'uncurated') {
                $query->where(function ($q) {
                    $q->where('curation_tier', 'none')
                      ->orWhereNull('curation_tier');
                })->where('is_featured', false)->where('is_on_special_sale', false);
            } else {
                $query->where('curation_tier', $tier);
            }
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        $products = $query->orderBy('id', 'desc')->get();
        $categories = Category::select('id', 'name', 'slug')->get();
        $vendors = Vendor::where('status', 'active')->select('id', 'shop_name')->get();

        // Standardized tier counts synchronized with Homepage sections
        $tiers = Product::getStandardTiers();
        $tierMap = collect($tiers)->keyBy('id');

        $metrics = [
            'total' => Product::activeOrPublished()->count(),
            'flagship' => $tierMap['flagship_featured']['count'] ?? 0,
            'flash_sale' => $tierMap['flash_sale']['count'] ?? 0,
            'smart_value' => $tierMap['budget_picks']['count'] ?? 0,
            'enterprise' => $tierMap['enterprise_tier']['count'] ?? 0,
            'uncurated' => Product::activeOrPublished()
                ->where(function ($q) {
                    $q->where('curation_tier', 'none')
                      ->orWhereNull('curation_tier');
                })
                ->where('is_featured', false)
                ->where('is_on_special_sale', false)
                ->count(),
        ];

        return Inertia::render('Marketing/Curation', [
            'products' => $products,
            'categories' => $categories,
            'vendors' => $vendors,
            'metrics' => $metrics,
            'tiers' => $tiers,
            'filters' => $request->only(['search', 'vendor', 'category', 'tier', 'min_price', 'max_price']),
        ]);
    }

    /**
     * Update Curation Tier and Merchandising Flags for a product.
     */
    public function updateTier(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'curation_tier' => 'required|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sale_badge_label' => 'nullable|string|max:100',
            'flash_sale_end_time' => 'nullable|date',
        ]);

        $product = Product::where('_id', $id)->orWhere('id', $id)->first();
        if (!$product && $id instanceof Product) {
            $product = $id;
        }
        if (!$product) {
            $product = Product::where('slug', $id)->firstOrFail();
        }

        // Normalize tier value
        $tier = strtolower(trim($request->input('curation_tier')));

        $product->curation_tier = $tier;
        $product->tier = $tier;

        if ($request->has('discount_percentage')) {
            $product->discount_percentage = $request->input('discount_percentage') !== null && $request->input('discount_percentage') !== ''
                ? (float) $request->input('discount_percentage')
                : null;
        }
        if ($request->filled('sale_badge_label')) {
            $product->sale_badge_label = $request->input('sale_badge_label');
        }
        if ($request->has('flash_sale_end_time')) {
            $product->flash_sale_end_time = $request->input('flash_sale_end_time') ?: null;
        }

        // If set to standard/none, ensure it removes any tier-specific promotional flags
        if (in_array($tier, ['standard', 'standard_catalog', 'standard catalog', 'none', 'uncurated'])) {
            $product->is_featured = false;
            $product->is_flash_sale = false;
            $product->is_on_special_sale = false;
            $product->curation_tier = 'none';
            $product->tier = 'none';
            $product->special_sale_title = null;
        } elseif (in_array($tier, ['flagship', 'flagship_featured', 'featured'])) {
            $product->is_featured = true;
        } elseif (in_array($tier, ['flash_sale', 'special_flash_sale', 'flash-sale'])) {
            $product->is_flash_sale = true;
            $product->is_on_special_sale = true;
            if ($request->filled('sale_badge_label')) {
                $product->sale_badge_label = $request->input('sale_badge_label');
                $product->special_sale_title = $request->input('sale_badge_label');
            } elseif (!$product->sale_badge_label) {
                $product->sale_badge_label = 'Flash Deal';
                $product->special_sale_title = 'Flash Deal';
            }
        } elseif (in_array($tier, ['enterprise', 'enterprise_tier', 'enterprise_heavy_duty', 'enterprise-tier'])) {
            if ($request->filled('sale_badge_label')) {
                $product->sale_badge_label = $request->input('sale_badge_label');
            }
        } elseif (in_array($tier, ['smart_value', 'smart_value_budget', 'budget_picks', 'budget-picks'])) {
            if ($request->filled('sale_badge_label')) {
                $product->sale_badge_label = $request->input('sale_badge_label');
            }
        }

        $product->save();

        return redirect()->back()->with('success', 'Product curation tier updated successfully.');
    }

    /**
     * Bulk Merchandising Actions.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_ids' => 'required|array|min:1',
            'action' => 'required|string|in:set_tier,reset_tier,set_discount',
            'tier' => 'nullable|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sale_badge_label' => 'nullable|string|max:100',
        ]);

        $ids = $validated['product_ids'];
        $count = count($ids);

        if ($validated['action'] === 'set_tier') {
            $tier = strtolower(trim($validated['tier'] ?? 'none'));
            $updateData = [
                'curation_tier' => $tier,
                'tier' => $tier,
            ];

            if (!empty($validated['sale_badge_label'])) {
                $updateData['sale_badge_label'] = $validated['sale_badge_label'];
            }
            if ($validated['discount_percentage'] !== null) {
                $updateData['discount_percentage'] = $validated['discount_percentage'];
            }

            if (in_array($tier, ['standard', 'standard_catalog', 'standard catalog', 'none', 'uncurated'])) {
                $updateData['is_featured'] = false;
                $updateData['is_flash_sale'] = false;
                $updateData['is_on_special_sale'] = false;
                $updateData['curation_tier'] = 'none';
                $updateData['tier'] = 'none';
                $updateData['special_sale_title'] = null;
            } elseif (in_array($tier, ['flagship', 'flagship_featured', 'featured'])) {
                $updateData['is_featured'] = true;
            } elseif (in_array($tier, ['flash_sale', 'special_flash_sale', 'flash-sale'])) {
                $updateData['is_flash_sale'] = true;
                $updateData['is_on_special_sale'] = true;
                $updateData['special_sale_title'] = $validated['sale_badge_label'] ?: 'Flash Deal';
            }

            foreach ($ids as $id) {
                $p = Product::where('_id', $id)->orWhere('id', $id)->first();
                if ($p) {
                    $p->update($updateData);
                }
            }
            return redirect()->back()->with('success', "Updated {$count} products to {$tier} tier.");
        }

        if ($validated['action'] === 'set_discount') {
            foreach ($ids as $id) {
                $p = Product::where('_id', $id)->orWhere('id', $id)->first();
                if ($p) {
                    $p->update([
                        'discount_percentage' => $validated['discount_percentage'],
                        'sale_badge_label' => $validated['sale_badge_label'] ?: 'Special Offer',
                    ]);
                }
            }
            return redirect()->back()->with('success', "Applied {$validated['discount_percentage']}% promotional discount to {$count} products.");
        }

        if ($validated['action'] === 'reset_tier') {
            foreach ($ids as $id) {
                $p = Product::where('_id', $id)->orWhere('id', $id)->first();
                if ($p) {
                    $p->update([
                        'curation_tier' => 'none',
                        'tier' => 'none',
                        'is_featured' => false,
                        'is_flash_sale' => false,
                        'is_on_special_sale' => false,
                        'discount_percentage' => null,
                        'sale_badge_label' => null,
                        'flash_sale_end_time' => null,
                    ]);
                }
            }
            return redirect()->back()->with('success', "Reset merchandising tier for {$count} products.");
        }

        return back()->with('error', 'Unknown action specified.');
    }
}
