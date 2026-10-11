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
        $totalCuratedCount = Product::where('curation_tier', '!=', 'none')
            ->orWhere('is_featured', true)
            ->orWhere('is_on_special_sale', true)
            ->count();

        $tierCounts = [
            'flagship_featured' => Product::where('curation_tier', 'flagship_featured')->orWhere('is_featured', true)->count(),
            'special_flash_sale' => Product::where('curation_tier', 'special_flash_sale')->orWhere('is_on_special_sale', true)->count(),
            'smart_value_budget' => Product::where('curation_tier', 'smart_value_budget')->count(),
            'enterprise_heavy_duty' => Product::where('curation_tier', 'enterprise_heavy_duty')->count(),
        ];

        $currentCampaign = PromotionalCampaign::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', now());
            })
            ->orderBy('end_time', 'asc')
            ->first();

        $recentBanners = Banner::orderBy('sort_order', 'asc')->orderBy('id', 'desc')->take(4)->get();

        $curatedProducts = Product::with(['vendor:id,shop_name,logo', 'category:id,name'])
            ->where('curation_tier', '!=', 'none')
            ->orWhere('is_featured', true)
            ->orWhere('is_on_special_sale', true)
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
