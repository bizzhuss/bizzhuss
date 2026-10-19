<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\PromotionalCampaign;
use App\Models\Vendor;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Display the Customer Storefront.
     */
    public function index(Request $request): Response
    {
        try {
            $query = Product::with(['vendor:id,shop_name,logo,commission_rate,status', 'category:id,name,slug'])
                ->where('status', 'published')
                ->whereHas('vendor', function ($q) {
                    $q->where('status', 'active');
                });

            if ($request->filled('category') && $request->input('category') !== 'all') {
                $cat = $request->input('category');
                $query->whereHas('category', function ($q) use ($cat) {
                    $q->where('slug', $cat)->orWhere('name', $cat);
                });
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $products = $query->orderBy('id', 'desc')->get();
            $categories = Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['products', 'subcategories' => fn ($q) => $q->where('is_active', true)->with('products')])
                ->orderBy('order', 'asc')
                ->get();
            $featuredVendors = Vendor::where('status', 'active')->limit(6)->get();

            // Base relation query with active vendor gatekeeper
            $curationBase = Product::with(['vendor:id,shop_name,logo,commission_rate,status', 'category:id,name,slug'])
                ->where('status', 'published')
                ->whereHas('vendor', function ($q) {
                    $q->where('status', 'active');
                });

            // 1. Fetch dynamic hero carousel promotional banners
            $heroBanners = Banner::active()
                ->section('hero_carousel')
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'desc')
                ->get();

            // 2. Fetch active promotional campaign & live countdown timer
            $activeCampaign = PromotionalCampaign::active()
                ->where(function ($q) {
                    $q->whereNull('end_time')->orWhere('end_time', '>=', now());
                })
                ->orderBy('end_time', 'asc')
                ->first();

            $featuredProducts = (clone $curationBase)
                ->where(function ($q) {
                    $q->where('curation_tier', 'flagship_featured')->orWhere('is_featured', true);
                })
                ->orderBy('featured_order', 'asc')
                ->orderBy('id', 'desc')
                ->take(8)
                ->get();

            $specialSaleProducts = (clone $curationBase)
                ->where(function ($q) {
                    $q->where('curation_tier', 'special_flash_sale')->orWhere('is_on_special_sale', true);
                })
                ->orderBy('id', 'desc')
                ->take(8)
                ->get();

            $bestSellingProducts = (clone $curationBase)
                ->orderByDesc('total_sold_count')
                ->take(8)
                ->get();

            $budgetPicks = (clone $curationBase)
                ->where('curation_tier', 'smart_value_budget')
                ->take(8)
                ->get();
            if ($budgetPicks->isEmpty()) {
                $budgetPicks = (clone $curationBase)->orderBy('price', 'asc')->take(8)->get();
            }

            $enterpriseHeavyDuty = (clone $curationBase)
                ->where('curation_tier', 'enterprise_heavy_duty')
                ->take(8)
                ->get();
            if ($enterpriseHeavyDuty->isEmpty()) {
                $enterpriseHeavyDuty = (clone $curationBase)->orderBy('price', 'desc')->take(8)->get();
            }

            $premiumLuxury = (clone $curationBase)
                ->orderBy('price', 'desc')
                ->take(8)
                ->get();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Storefront DB unavailable, serving demo catalog: ' . $e->getMessage());
            $products = collect();
            $categories = collect();
            $featuredVendors = collect();
            $heroBanners = collect();
            $activeCampaign = null;
            $featuredProducts = collect();
            $specialSaleProducts = collect();
            $bestSellingProducts = collect();
            $budgetPicks = collect();
            $enterpriseHeavyDuty = collect();
            $premiumLuxury = collect();
        }

        // Automatic fallback to DemoCatalogService if database is offline or empty
        $demoProducts = \App\Services\DemoCatalogService::products();
        $demoCategories = \App\Services\DemoCatalogService::categories();
        $demoVendors = \App\Services\DemoCatalogService::vendors();
        $demoBanners = \App\Services\DemoCatalogService::banners();

        if ($products->isEmpty()) {
            $products = $demoProducts;
        }
        if ($categories->isEmpty()) {
            $categories = $demoCategories;
        }
        if ($featuredVendors->isEmpty()) {
            $featuredVendors = $demoVendors;
        }
        if ($heroBanners->isEmpty()) {
            $heroBanners = $demoBanners;
        }
        if ($featuredProducts->isEmpty()) {
            $featuredProducts = $demoProducts->where('is_featured', true)->values();
        }
        if ($specialSaleProducts->isEmpty()) {
            $specialSaleProducts = $demoProducts->where('is_on_special_sale', true)->values();
        }
        if ($bestSellingProducts->isEmpty()) {
            $bestSellingProducts = $demoProducts->sortByDesc('total_sold_count')->values();
        }
        if ($budgetPicks->isEmpty()) {
            $budgetPicks = $demoProducts->where('curation_tier', 'smart_value_budget')->values();
            if ($budgetPicks->isEmpty()) {
                $budgetPicks = $demoProducts->sortBy('price')->values();
            }
        }
        if ($enterpriseHeavyDuty->isEmpty()) {
            $enterpriseHeavyDuty = $demoProducts->where('curation_tier', 'enterprise_heavy_duty')->values();
            if ($enterpriseHeavyDuty->isEmpty()) {
                $enterpriseHeavyDuty = $demoProducts->sortByDesc('price')->values();
            }
        }
        if ($premiumLuxury->isEmpty()) {
            $premiumLuxury = $demoProducts->sortByDesc('price')->values();
        }

        return Inertia::render('Storefront/Home', [
            'products' => $products,
            'banners' => $heroBanners,
            'activeCampaign' => $activeCampaign,
            'flashSaleEndTime' => $activeCampaign?->end_time?->toISOString(),
            'featuredProducts' => $featuredProducts,
            'specialSaleProducts' => $specialSaleProducts,
            'bestSellingProducts' => $bestSellingProducts,
            'budgetPicks' => $budgetPicks,
            'enterpriseHeavyDuty' => $enterpriseHeavyDuty,
            'premiumLuxury' => $premiumLuxury,
            'categories' => $categories,
            'featuredVendors' => $featuredVendors,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Display the Dedicated Shop / Catalog Page with Advanced Multi-Attribute Filters.
     */
    public function shop(Request $request): Response
    {
        try {
            $query = Product::with(['vendor:id,shop_name,logo,commission_rate,status', 'category:id,name,slug,parent_id'])
                ->where('status', 'published')
                ->whereHas('vendor', function ($q) {
                    $q->where('status', 'active');
                });

            // Filter by category or categories
            if ($request->filled('categories')) {
                $catFilter = is_array($request->input('categories')) 
                    ? $request->input('categories') 
                    : explode(',', $request->input('categories'));

                $query->whereHas('category', function ($q) use ($catFilter) {
                    $q->whereIn('slug', $catFilter)->orWhereIn('id', $catFilter)->orWhereIn('name', $catFilter);
                });
            } elseif ($request->filled('category') && $request->input('category') !== 'all') {
                $cat = $request->input('category');
                $query->whereHas('category', function ($q) use ($cat) {
                    $q->where('slug', $cat)->orWhere('name', $cat)->orWhere('id', $cat);
                });
            }

            // Filter by vendors / brands
            if ($request->filled('vendors')) {
                $vendorFilter = is_array($request->input('vendors')) 
                    ? $request->input('vendors') 
                    : explode(',', $request->input('vendors'));

                $query->whereHas('vendor', function ($q) use ($vendorFilter) {
                    $q->whereIn('id', $vendorFilter)->orWhereIn('shop_name', $vendorFilter)->orWhereIn('slug', $vendorFilter);
                });
            } elseif ($request->filled('vendor')) {
                $vId = $request->input('vendor');
                $query->whereHas('vendor', function ($q) use ($vId) {
                    $q->where('id', $vId)->orWhere('slug', $vId)->orWhere('shop_name', $vId);
                });
            }

            // Filter by price range
            if ($request->filled('min_price')) {
                $query->where('price', '>=', (float) $request->input('min_price'));
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', (float) $request->input('max_price'));
            }

            // Filter by In-Stock Only
            if ($request->boolean('in_stock')) {
                $query->where('stock_quantity', '>', 0);
            }

            // Search query
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sort = $request->input('sort', 'featured');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('id', 'desc');
                    break;
                default:
                    $query->orderBy('id', 'desc');
                    break;
            }

            $products = $query->paginate(12)->withQueryString();

            $categories = Category::with(['subcategories' => fn ($q) => $q->where('is_active', true)])
                ->where('is_active', true)
                ->whereNull('parent_id')
                ->orderBy('order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
            if ($categories->isEmpty()) {
                $categories = Category::where('is_active', true)
                    ->select('id', 'name', 'slug', 'icon')
                    ->orderBy('order', 'asc')
                    ->get();
            }

            $vendors = Vendor::where('status', 'active')->select('id', 'shop_name', 'slug')->get();

            if ($products->isEmpty()) {
                $products = \App\Services\DemoCatalogService::paginateProducts(12);
            }
            if ($categories->isEmpty()) {
                $categories = \App\Services\DemoCatalogService::categories();
            }
            if ($vendors->isEmpty()) {
                $vendors = \App\Services\DemoCatalogService::vendors();
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Shop database exception: ' . $e->getMessage());
            $products = \App\Services\DemoCatalogService::paginateProducts(12);
            $categories = \App\Services\DemoCatalogService::categories();
            $vendors = \App\Services\DemoCatalogService::vendors();
        }

        return Inertia::render('Storefront/Shop', [
            'products' => $products,
            'categories' => $categories,
            'vendors' => $vendors,
            'filters' => $request->only(['category', 'categories', 'vendors', 'min_price', 'max_price', 'rating', 'in_stock', 'sort', 'search']),
        ]);
    }

    /**
     * Display or redirect category page to shop with category filter.
     */
    public function category(Request $request, string $slug)
    {
        return redirect()->route('shop', ['category' => $slug]);
    }

    /**
     * Display single product detail page.
     */
    public function productDetail(string $slug): Response
    {
        try {
            $product = Product::with(['vendor', 'category'])
                ->where(function ($q) use ($slug) {
                    $q->where('slug', $slug)->orWhere('id', $slug);
                })
                ->first();

            // If product doesn't exist, pick the first published or any product
            if (!$product) {
                $product = Product::with(['vendor', 'category'])->first();
            }
        } catch (\Throwable $e) {
            $product = null;
        }

        if (!$product) {
            $demoList = \App\Services\DemoCatalogService::products();
            $product = $demoList->firstWhere('slug', $slug) ?? $demoList->first();
            $relatedProducts = $demoList->where('id', '!=', $product->id)->take(4)->values();

            return Inertia::render('Storefront/ProductDetail', [
                'product' => $product,
                'relatedProducts' => $relatedProducts,
            ]);
        }

        if (is_string($product->images)) {
            $product->images = json_decode($product->images, true) ?? [];
        }

        try {
            $relatedProducts = Product::with(['vendor', 'category'])
                ->where('id', '!=', $product->id)
                ->when($product->category_id, function ($q, $catId) {
                    $q->where('category_id', $catId);
                })
                ->limit(4)
                ->get()
                ->map(function ($p) {
                    if (is_string($p->images)) {
                        $p->images = json_decode($p->images, true) ?? [];
                    }
                    return $p;
                });
        } catch (\Throwable $e) {
            $relatedProducts = collect();
        }

        if ($relatedProducts->isEmpty()) {
            $relatedProducts = \App\Services\DemoCatalogService::products()
                ->where('id', '!=', $product->id)
                ->take(4)
                ->values();
        }

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Display shopping cart page.
     */
    public function cart(): Response
    {
        return Inertia::render('Storefront/Cart');
    }

    /**
     * Display customer wishlist page.
     */
    public function wishlist(): Response
    {
        return Inertia::render('Storefront/Wishlist');
    }

    /**
     * Display checkout page.
     */
    public function checkoutPage(): Response
    {
        return Inertia::render('Storefront/Checkout');
    }

    /**
     * Process checkout submission.
     */
    public function checkout(CheckoutRequest $request)
    {
        $validated = $request->validated();

        $order = $this->orderService->processCheckout(
            customerDetails: [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'payment_method' => $validated['payment_method'],
                'coupon_code' => $validated['coupon_code'] ?? null,
            ],
            cartItems: $validated['items'],
            customer: auth()->user()
        );

        return redirect()->route('storefront')->with('success', "Order #{$order->order_number} placed successfully across multi-vendor channels!");
    }
}
