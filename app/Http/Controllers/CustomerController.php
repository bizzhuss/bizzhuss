<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\PromotionalCampaign;
use App\Models\Review;
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
            $categories = Category::where(function ($q) {
                    $q->where('is_active', true)->orWhereNull('is_active');
                })
                ->where(function ($q) {
                    $q->whereNull('parent_id')->orWhere('parent_id', '')->orWhere('parent_id', '0');
                })
                ->with(['products', 'subcategories' => fn ($q) => $q->where(fn ($sub) => $sub->where('is_active', true)->orWhereNull('is_active'))->with('products')])
                ->orderBy('order', 'asc')
                ->orderBy('name', 'asc')
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

        // Strict MongoDB database catalog - no mock fallback
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

            $categories = Category::with(['subcategories' => fn ($q) => $q->where(fn ($sub) => $sub->where('is_active', true)->orWhereNull('is_active'))])
                ->where(function ($q) {
                    $q->where('is_active', true)->orWhereNull('is_active');
                })
                ->where(function ($q) {
                    $q->whereNull('parent_id')->orWhere('parent_id', '')->orWhere('parent_id', '0');
                })
                ->orderBy('order', 'asc')
                ->orderBy('name', 'asc')
                ->get();
            if ($categories->isEmpty()) {
                $categories = Category::where(function ($q) {
                        $q->where('is_active', true)->orWhereNull('is_active');
                    })
                    ->select('id', 'name', 'slug', 'icon', 'parent_id', 'is_verified_featured')
                    ->orderBy('order', 'asc')
                    ->orderBy('name', 'asc')
                    ->get();
            }

            $vendors = Vendor::where('status', 'active')->select('id', 'shop_name', 'slug')->get();

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Shop database exception: ' . $e->getMessage());
            $products = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 12, 1, [
                'path' => $request->url(),
                'query' => $request->query()
            ]);
            $categories = collect();
            $vendors = collect();
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
            abort(404, 'Product not found.');
        }

        if (is_string($product->images)) {
            $product->images = json_decode($product->images, true) ?? [];
        }

        // Load reviews from Review collection and combine with any embedded product reviews
        try {
            $dbReviews = Review::with('user:id,name,avatar')
                ->where('product_id', (string) $product->id)
                ->orWhere('product_id', $product->id)
                ->latest()
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => (string) $r->id,
                        'author' => $r->user?->name ?? 'Verified Buyer',
                        'rating' => (int) $r->rating,
                        'comment' => $r->comment,
                        'date' => $r->created_at ? $r->created_at->format('M d, Y') : date('M d, Y'),
                        'created_at' => $r->created_at ? $r->created_at->toISOString() : null,
                        'is_verified' => (bool) $r->is_verified_purchase,
                    ];
                })
                ->toArray();

            $embeddedReviews = is_array($product->reviews) ? $product->reviews : [];

            $seenIds = [];
            $combined = [];
            foreach (array_merge($dbReviews, $embeddedReviews) as $rev) {
                $id = $rev['id'] ?? md5(($rev['author'] ?? '') . ($rev['comment'] ?? '') . ($rev['date'] ?? ''));
                if (!in_array($id, $seenIds)) {
                    $seenIds[] = $id;
                    $combined[] = $rev;
                }
            }

            $product->reviews = $combined;
            if (count($combined) > 0) {
                $product->rating = round(collect($combined)->avg('rating') ?: 5, 1);
                $product->ratings_count = count($combined);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed loading reviews for product ' . $product->id . ': ' . $e->getMessage());
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

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Submit a customer review for a product.
     */
    public function submitReview(Request $request, string $slug)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3|max:1000',
        ]);

        try {
            $product = Product::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
            $user = $request->user();

            $rating = (int) $request->input('rating');
            $comment = trim($request->input('comment'));

            // 1. Create record in Review collection
            $review = Review::create([
                'user_id' => (string) $user->id,
                'product_id' => (string) $product->id,
                'rating' => $rating,
                'comment' => $comment,
                'status' => 'approved',
                'is_verified_purchase' => true,
            ]);

            // 2. Keep embedded reviews array updated on the product
            $existingReviews = is_array($product->reviews) ? $product->reviews : [];
            $newReviewEntry = [
                'id' => (string) $review->id,
                'user_id' => (string) $user->id,
                'author' => $user->name ?? 'Verified Buyer',
                'rating' => $rating,
                'comment' => $comment,
                'date' => now()->format('M d, Y'),
                'created_at' => now()->toISOString(),
                'is_verified' => true,
            ];
            array_unshift($existingReviews, $newReviewEntry);

            $avgRating = round(collect($existingReviews)->avg('rating') ?: 5, 1);
            $product->reviews = $existingReviews;
            $product->rating = $avgRating;
            $product->ratings_count = count($existingReviews);
            $product->save();

            return back()->with('success', 'Thank you! Your review has been submitted successfully.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Review submission error: ' . $e->getMessage());
            return back()->withErrors(['review' => 'Unable to submit your review at this time. Please try again.']);
        }
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
