<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\PromotionalCampaign;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Display the Marketing & Merchandising Executive Dashboard.
     */
    public function index(Request $request): Response
    {
        $activeCampaignsCount = PromotionalCampaign::where('is_active', true)->count();
        $activeBannersCount = Banner::where('is_active', true)->count();
        $tiers = Product::getStandardTiers();
        $tierMap = collect($tiers)->keyBy('id');

        $totalCuratedCount = Product::activeOrPublished()->where(function ($q) {
            $q->inFlagshipFeaturedTier()
              ->orWhere(fn ($sub) => $sub->inFlashSaleTier())
              ->orWhere(fn ($sub) => $sub->inBudgetPicksTier())
              ->orWhere(fn ($sub) => $sub->inEnterpriseTier());
        })->count();

        $tierCounts = [
            'flagship_featured' => $tierMap['flagship_featured']['count'] ?? 0,
            'special_flash_sale' => $tierMap['flash_sale']['count'] ?? 0,
            'smart_value_budget' => $tierMap['budget_picks']['count'] ?? 0,
            'enterprise_heavy_duty' => $tierMap['enterprise_tier']['count'] ?? 0,
        ];

        $currentCampaign = PromotionalCampaign::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', now());
            })
            ->orderBy('end_time', 'asc')
            ->first();

        $recentBanners = Banner::orderBy('sort_order', 'asc')->orderBy('id', 'desc')->take(4)->get();

        $curatedProducts = Product::with(['vendor:id,shop_name,logo', 'category:id,name'])
            ->where(function ($q) {
                $q->inFlagshipFeaturedTier()
                  ->orWhere(fn ($sub) => $sub->inFlashSaleTier())
                  ->orWhere(fn ($sub) => $sub->inBudgetPicksTier())
                  ->orWhere(fn ($sub) => $sub->inEnterpriseTier());
            })
            ->orderBy('updated_at', 'desc')
            ->take(6)
            ->get();

        $metrics = [
            'active_campaigns' => $activeCampaignsCount,
            'active_banners' => $activeBannersCount,
            'curated_products' => $totalCuratedCount,
            'total_products' => Product::count(),
            'total_vendors' => Vendor::where('status', 'active')->count(),
            'tier_counts' => $tierCounts,
        ];

        return Inertia::render('Marketing/Dashboard', [
            'metrics' => $metrics,
            'currentCampaign' => $currentCampaign,
            'recentBanners' => $recentBanners,
            'curatedProducts' => $curatedProducts,
        ]);
    }
}
