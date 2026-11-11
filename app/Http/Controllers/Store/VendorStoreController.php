<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorStoreController extends Controller
{
    /**
     * Display a dedicated public storefront page for a specific vendor.
     */
    public function show(Request $request, string $slug): Response
    {
        // 1. Resolve vendor profile across Vendor collection and User accounts
        $vendorProfile = Vendor::with('user')
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                  ->orWhere('_id', $slug)
                  ->orWhere('id', $slug)
                  ->orWhere('user_id', $slug);
            })
            ->first();

        $user = $vendorProfile?->user;

        if (!$vendorProfile) {
            $user = User::with('vendor')
                ->where(function ($q) use ($slug) {
                    $q->where('slug', $slug)
                      ->orWhere('vendor_slug', $slug)
                      ->orWhere('_id', $slug)
                      ->orWhere('id', $slug);
                })
                ->first();

            if ($user) {
                $vendorProfile = $user->vendor;
            }
        }

        // Only allow active storefronts (or users explicitly assigned vendor role / owning a Vendor profile)
        if (!$vendorProfile && (!$user || $user->role !== 'vendor')) {
            abort(404, 'Vendor storefront not found.');
        }

        // Collect all valid IDs associated with this merchant for product & order matching
        $matchIds = array_values(array_filter(array_unique([
            $vendorProfile ? (string)($vendorProfile->_id ?? $vendorProfile->id) : null,
            $user ? (string)($user->_id ?? $user->id) : null,
            $vendorProfile?->user_id ? (string)$vendorProfile->user_id : null,
        ])));

        $primaryVendorId = $vendorProfile
            ? (string)($vendorProfile->_id ?? $vendorProfile->id)
            : (string)($user->_id ?? $user->id);

        // 2. Base query for active/published products strictly belonging to this vendor
        $baseQuery = Product::with([
            'vendor:id,shop_name,slug,logo,commission_rate,status',
            'category:id,name,slug',
        ])
            ->where(function ($q) use ($matchIds) {
                $q->whereIn('vendor_id', $matchIds)
                  ->orWhereIn('user_id', $matchIds);
            })
            ->where(function ($q) {
                $q->whereIn('status', ['active', 'published'])
                  ->orWhereNull('status');
            });

        // Snapshot all vendor products for stats & store-specific category pills
        $allVendorProducts = (clone $baseQuery)->get();

        // Build distinct categories list scoped to this vendor's catalog
        $catIds = $allVendorProducts->pluck('category_id')->filter()->unique()->values()->all();
        $storeCategories = [];
        if (!empty($catIds)) {
            $storeCategories = Category::whereIn('_id', $catIds)
                ->orWhereIn('id', $catIds)
                ->get(['id', 'name', 'slug'])
                ->map(fn($c) => [
                    'id' => (string)($c->_id ?? $c->id),
                    'name' => $c->name,
                    'slug' => $c->slug ?? (string)($c->_id ?? $c->id),
                ])
                ->values()
                ->all();
        }

        // Fallback if products use raw 'category' string instead of category_id relation
        if (empty($storeCategories)) {
            $rawCats = $allVendorProducts->pluck('category')->filter(fn($c) => is_string($c) && $c !== '')->unique()->values();
            foreach ($rawCats as $catName) {
                $storeCategories[] = [
                    'id' => $catName,
                    'name' => $catName,
                    'slug' => $catName,
                ];
            }
        }

        // 3. Apply filtered search, category, and sorting
        $productsQuery = clone $baseQuery;

        if ($search = trim((string)$request->input('search', ''))) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($category = trim((string)$request->input('category', ''))) {
            $catRecord = Category::where('slug', $category)
                ->orWhere('name', $category)
                ->orWhere('_id', $category)
                ->orWhere('id', $category)
                ->first();

            $productsQuery->where(function ($q) use ($category, $catRecord) {
                $q->where('category', $category)
                  ->orWhere('category_id', $category);
                if ($catRecord) {
                    $q->orWhere('category_id', (string)($catRecord->_id ?? $catRecord->id));
                }
            });
        }

        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'popular':
                $productsQuery->orderBy('total_sold_count', 'desc')->orderBy('id', 'desc');
                break;
            default:
                $productsQuery->orderBy('created_at', 'desc')->orderBy('id', 'desc');
                break;
        }

        $products = $productsQuery->paginate(12)->withQueryString()->through(function ($product) {
            if (is_string($product->images)) {
                $product->images = json_decode($product->images, true) ?? [];
            }
            return $product;
        });

        // 4. Compute Vendor Storefront Analytics & Trust Stats
        $rawCreatedAt = $vendorProfile?->created_at ?? $user?->created_at;
        $joinedDate = '2024';
        if ($rawCreatedAt) {
            try {
                $joinedDate = $rawCreatedAt instanceof \DateTimeInterface
                    ? $rawCreatedAt->format('M Y')
                    : Carbon::parse($rawCreatedAt)->format('M Y');
            } catch (\Throwable $e) {
                $joinedDate = '2024';
            }
        }

        $ordersFulfilled = 0;
        try {
            $ordersFulfilled = OrderItem::whereIn('vendor_id', $matchIds)->count();
        } catch (\Throwable $e) {
            $ordersFulfilled = 0;
        }

        $totalSold = (int)$allVendorProducts->sum(fn($p) => (int)($p->total_sold_count ?? 0));
        $city = $vendorProfile?->city ?? $user?->city ?? 'Karachi, Pakistan';

        $stats = [
            'total_products' => $allVendorProducts->count(),
            'total_sold' => $totalSold,
            'orders_fulfilled' => $ordersFulfilled,
            'joined_date' => $joinedDate,
            'city' => $city,
            'rating' => (float)($vendorProfile?->rating ?? $user?->rating ?? 4.9),
            'positive_rating' => '99%',
            'response_rate' => '98%',
            'ship_on_time' => '100%',
        ];

        $shopName = $vendorProfile?->shop_name
            ?? $user?->shop_name
            ?? $user?->store_name
            ?? (($user?->name ?? 'Merchant') . "'s Official Store");

        $storeSlug = $vendorProfile?->slug
            ?? $user?->slug
            ?? $user?->vendor_slug
            ?? $primaryVendorId;

        return Inertia::render('Store/Show', [
            'vendor' => [
                'id' => $primaryVendorId,
                'name' => $user?->name ?? $shopName,
                'shop_name' => $shopName,
                'slug' => $storeSlug,
                'description' => $vendorProfile?->description
                    ?? $user?->shop_description
                    ?? $user?->description
                    ?? 'Official verified merchant storefront on Bizzhuss Marketplace. Audited for fulfillment quality and genuine products.',
                'return_policy' => $vendorProfile?->return_policy
                    ?? '7-Day Bizzhuss Buyer Protection & Verified Merchant Return Guarantee.',
                'support_phone' => $vendorProfile?->support_phone ?? $user?->phone ?? null,
                'avatar' => $vendorProfile?->logo ?? $user?->avatar ?? $user?->shop_logo ?? null,
                'banner' => $vendorProfile?->banner ?? $user?->banner ?? $user?->shop_banner ?? null,
                'is_verified' => ($vendorProfile?->status ?? $user?->status ?? 'active') === 'active',
                'city' => $city,
            ],
            'products' => $products,
            'categories' => $storeCategories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'sort' => $sort,
            ],
        ]);
    }
}
