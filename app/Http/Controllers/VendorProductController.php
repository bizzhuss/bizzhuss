<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorProductController extends Controller
{
    /**
     * Helper to resolve the authenticated vendor.
     */
    protected function getVendor(Request $request): Vendor
    {
        $user = $request->user();

        if (!$user) {
            abort(redirect()->route('login')->with('error', 'Please log in with vendor credentials to access this portal.'));
        }

        $vendor = $user->vendor;

        // Auto-create default vendor profile if missing
        if (!$vendor) {
            if ($user->role === 'super_admin') {
                $vendor = Vendor::first();
            }

            if (!$vendor) {
                $vendor = Vendor::create([
                    'user_id' => $user->id,
                    'shop_name' => ($user->name ?? 'Merchant') . "'s Store",
                    'slug' => Str::slug(($user->name ?? 'merchant') . '-store') . '-' . Str::lower(Str::random(4)),
                    'status' => 'active',
                    'commission_rate' => 10.00,
                    'description' => 'Official verified vendor merchant storefront.',
                ]);
            }
        }

        return $vendor;
    }

    /**
     * Display product catalog listing with metrics and filters.
     */
    public function index(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        $query = Product::with(['category', 'category.parent'])
            ->where('vendor_id', $vendor->id);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $query->where('category_id', $request->input('category_id'));
        }

        // Status / Stock filter
        $status = $request->input('status', 'all');
        if ($status === 'published') {
            $query->where('status', 'published')->where('stock_quantity', '>', 0);
        } elseif ($status === 'pending_review') {
            $query->where('status', 'pending_review');
        } elseif ($status === 'draft') {
            $query->where('status', 'draft');
        } elseif ($status === 'out_of_stock') {
            $query->where('stock_quantity', '<=', 0);
        } elseif ($status === 'low_stock') {
            $query->where('stock_quantity', '>', 0)
                  ->whereRaw('stock_quantity <= low_stock_threshold');
        }

        $products = $query->orderBy('id', 'desc')->get();

        // Catalog inventory metrics
        $allVendorProducts = Product::where('vendor_id', $vendor->id)->get();
        $metrics = [
            'total_products' => $allVendorProducts->count(),
            'published' => $allVendorProducts->where('status', 'published')->count(),
            'pending_review' => $allVendorProducts->where('status', 'pending_review')->count(),
            'draft' => $allVendorProducts->where('status', 'draft')->count(),
            'low_stock' => $allVendorProducts->filter(fn($p) => $p->stock_quantity > 0 && $p->stock_quantity <= ($p->low_stock_threshold ?? 5))->count(),
            'out_of_stock' => $allVendorProducts->where('stock_quantity', '<=', 0)->count(),
            'total_inventory_units' => (int) $allVendorProducts->sum('stock_quantity'),
        ];

        // Categories for filter pills
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Vendor/Products/Index', [
            'vendor' => $vendor,
            'products' => $products,
            'categories' => $categories,
            'metrics' => $metrics,
            'filters' => [
                'search' => $request->input('search', ''),
                'category_id' => $request->input('category_id', 'all'),
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        $categories = Category::with('subcategories')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        $allCategories = Category::orderBy('name')->get();

        return Inertia::render('Vendor/Products/Create', [
            'vendor' => $vendor,
            'categories' => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        try {
            $vendor = $this->getVendor($request);

            // Validation rules without SQL relational rules (exists:categories,id etc.)
            $rules = [
                'title' => 'nullable|string|max:255',
                'name' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255',
                'category_id' => 'nullable|string',
                'brand' => 'nullable|string|max:100',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_per_item' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|max:100',
                'barcode' => 'nullable|string|max:100',
                'stock_quantity' => 'nullable|integer|min:0',
                'stock' => 'nullable|integer|min:0',
                'low_stock_threshold' => 'nullable|integer|min:0',
                'image' => 'nullable', // string URL or UploadedFile
                'images' => 'nullable', // array or string
                'existing_images' => 'nullable|array|max:10',
                'existing_images.*' => 'nullable|string',
                'image_order' => 'nullable|string',
                'variants' => 'nullable|array',
                'status' => 'nullable|string',
            ];

            if ($request->hasFile('images')) {
                $rules['images.*'] = 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif|max:10240';
            }
            if ($request->hasFile('image')) {
                $rules['image'] = 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif|max:10240';
            }

            $validated = $request->validate($rules);

            // 1. Resolve Title / Name
            $title = $validated['title'] ?? $validated['name'] ?? $request->input('title') ?? $request->input('name') ?? 'Untitled Product';

            // 2. Resolve Slug
            $slugBase = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($title);
            $uniqueSlug = $slugBase . '-' . Str::lower(Str::random(5));

            // 3. Resolve SKU
            $sku = !empty($validated['sku']) ? Str::upper($validated['sku']) : 'SKU-' . Str::upper(Str::random(8));

            // 4. Resolve Stock
            $stockQuantity = isset($validated['stock_quantity']) 
                ? (int) $validated['stock_quantity'] 
                : (isset($validated['stock']) ? (int) $validated['stock'] : 100);

            // 5. Resolve Status
            $status = $validated['status'] ?? 'published';
            if ($status === 'active') {
                $status = 'published';
            }
            if ($vendor && $vendor->status !== 'active') {
                $status = 'pending_review';
            }

            // 6. Image collection & Cloudinary uploads
            $imagePaths = [];

            // A. Single direct file upload 'image'
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                if ($file && $file->isValid()) {
                    $url = CloudinaryService::uploadImage($file, 'bizzhuss_products');
                    $imagePaths[] = $url;
                }
            } elseif ($request->filled('image') && is_string($request->input('image'))) {
                $imagePaths[] = $request->input('image');
            }

            // B. Multiple file uploads 'images'
            if ($request->hasFile('images')) {
                $files = $request->file('images');
                if (is_array($files)) {
                    foreach ($files as $file) {
                        if ($file && $file->isValid()) {
                            $url = CloudinaryService::uploadImage($file, 'bizzhuss_products');
                            $imagePaths[] = $url;
                        }
                    }
                } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                    $url = CloudinaryService::uploadImage($files, 'bizzhuss_products');
                    $imagePaths[] = $url;
                }
            }

            // C. String images provided in 'existing_images' or 'images'
            if ($request->filled('existing_images') && is_array($request->input('existing_images'))) {
                foreach ($request->input('existing_images') as $img) {
                    if (is_string($img) && !empty($img) && !in_array($img, $imagePaths)) {
                        $imagePaths[] = $img;
                    }
                }
            }
            if ($request->filled('images') && is_array($request->input('images')) && !$request->hasFile('images')) {
                foreach ($request->input('images') as $img) {
                    if (is_string($img) && !empty($img) && !in_array($img, $imagePaths)) {
                        $imagePaths[] = $img;
                    }
                }
            } elseif ($request->filled('images') && is_string($request->input('images')) && !in_array($request->input('images'), $imagePaths)) {
                $imagePaths[] = $request->input('images');
            }

            // D. Re-order if image_order metadata is passed
            if ($request->filled('image_order')) {
                $order = json_decode($request->input('image_order'), true);
                if (is_array($order)) {
                    $ordered = [];
                    foreach ($order as $item) {
                        if (isset($item['type']) && $item['type'] === 'new' && isset($item['index']) && isset($imagePaths[$item['index']])) {
                            $ordered[] = $imagePaths[$item['index']];
                        } elseif (isset($item['type']) && $item['type'] === 'existing' && !empty($item['url']) && in_array($item['url'], $imagePaths)) {
                            $ordered[] = $item['url'];
                        }
                    }
                    foreach ($imagePaths as $p) {
                        if (!in_array($p, $ordered)) {
                            $ordered[] = $p;
                        }
                    }
                    if (!empty($ordered)) {
                        $imagePaths = $ordered;
                    }
                }
            }

            $primaryImage = !empty($imagePaths) ? $imagePaths[0] : null;
            $vendorId = $vendor ? $vendor->id : (string) (auth()->id() ?? '');

            $product = Product::create([
                'vendor_id' => $vendorId,
                'category_id' => $validated['category_id'] ?? null,
                'brand' => $validated['brand'] ?? null,
                'title' => $title,
                'name' => $title,
                'slug' => $uniqueSlug,
                'sku' => $sku,
                'barcode' => $validated['barcode'] ?? null,
                'price' => (float) $validated['price'],
                'compare_price' => !empty($validated['compare_price']) ? (float) $validated['compare_price'] : null,
                'cost_per_item' => !empty($validated['cost_per_item']) ? (float) $validated['cost_per_item'] : null,
                'stock_quantity' => $stockQuantity,
                'stock' => $stockQuantity,
                'low_stock_threshold' => isset($validated['low_stock_threshold']) ? (int) $validated['low_stock_threshold'] : 5,
                'image' => $primaryImage,
                'images' => array_values(array_unique($imagePaths)),
                'featured_image' => $primaryImage,
                'thumbnail' => $primaryImage,
                'description' => $validated['description'] ?? '',
                'variants' => $validated['variants'] ?? [],
                'status' => $status,
            ]);

            return redirect()->route('vendor.products.index')
                ->with('success', "Product '{$product->title}' created successfully.");

        } catch (\Throwable $e) {
            Log::error('Product creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->except(['images', 'image']),
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Product creation failed: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Request $request, Product $product): Response
    {
        $vendor = $this->getVendor($request);

        if ($product->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to product.');
        }

        $categories = Category::with('subcategories')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        $allCategories = Category::orderBy('name')->get();

        return Inertia::render('Vendor/Products/Edit', [
            'vendor' => $vendor,
            'product' => $product->load('category'),
            'categories' => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        try {
            $vendor = $this->getVendor($request);

            if ($product->vendor_id !== $vendor->id && auth()->user()->role !== 'super_admin') {
                abort(403, 'Unauthorized access to product.');
            }

            $rules = [
                'title' => 'nullable|string|max:255',
                'name' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255',
                'category_id' => 'nullable|string',
                'brand' => 'nullable|string|max:100',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_per_item' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|max:100',
                'barcode' => 'nullable|string|max:100',
                'stock_quantity' => 'nullable|integer|min:0',
                'stock' => 'nullable|integer|min:0',
                'low_stock_threshold' => 'nullable|integer|min:0',
                'image' => 'nullable',
                'images' => 'nullable',
                'existing_images' => 'nullable|array|max:10',
                'existing_images.*' => 'nullable|string',
                'image_order' => 'nullable|string',
                'variants' => 'nullable|array',
                'status' => 'nullable|string',
            ];

            if ($request->hasFile('images')) {
                $rules['images.*'] = 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif|max:10240';
            }
            if ($request->hasFile('image')) {
                $rules['image'] = 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif|max:10240';
            }

            $validated = $request->validate($rules);

            if (!empty($validated['slug']) && $validated['slug'] !== $product->slug) {
                $validated['slug'] = Str::slug($validated['slug']) . '-' . Str::lower(Str::random(4));
            } else {
                unset($validated['slug']);
            }

            if (!empty($validated['sku'])) {
                $validated['sku'] = Str::upper($validated['sku']);
            }

            if (!empty($validated['name']) && empty($validated['title'])) {
                $validated['title'] = $validated['name'];
            }

            if (isset($validated['stock']) && !isset($validated['stock_quantity'])) {
                $validated['stock_quantity'] = (int) $validated['stock'];
            }

            // If vendor is not active, enforce pending_review status
            if ($vendor && $vendor->status !== 'active') {
                $validated['status'] = 'pending_review';
            }

            // 1. Gather retained existing images
            $existingImages = $request->input('existing_images', []);
            if (!is_array($existingImages)) {
                $existingImages = [];
            }

            // Support string images if provided in 'images' (legacy/tests)
            if ($request->filled('images') && is_array($request->input('images')) && !$request->hasFile('images')) {
                foreach ($request->input('images') as $img) {
                    if (is_string($img) && !empty($img) && !in_array($img, $existingImages)) {
                        $existingImages[] = $img;
                    }
                }
            } elseif ($request->filled('images') && is_string($request->input('images')) && !in_array($request->input('images'), $existingImages)) {
                $existingImages[] = $request->input('images');
            }

            // Support direct string in 'image'
            if ($request->filled('image') && is_string($request->input('image')) && !in_array($request->input('image'), $existingImages)) {
                $existingImages[] = $request->input('image');
            }

            // 2. Upload new image files via Cloudinary
            $newPaths = [];
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                if ($file && $file->isValid()) {
                    $url = CloudinaryService::uploadImage($file, 'bizzhuss_products');
                    $newPaths[] = $url;
                }
            }
            if ($request->hasFile('images')) {
                $files = $request->file('images');
                if (is_array($files)) {
                    foreach ($files as $file) {
                        if ($file && $file->isValid()) {
                            $url = CloudinaryService::uploadImage($file, 'bizzhuss_products');
                            $newPaths[] = $url;
                        }
                    }
                } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                    $url = CloudinaryService::uploadImage($files, 'bizzhuss_products');
                    $newPaths[] = $url;
                }
            }

            // 3. Assemble final ordered images
            $finalImages = [];
            if ($request->filled('image_order')) {
                $order = json_decode($request->input('image_order'), true);
                if (is_array($order)) {
                    foreach ($order as $item) {
                        if (isset($item['type']) && $item['type'] === 'existing' && in_array($item['url'], $existingImages)) {
                            $finalImages[] = $item['url'];
                        } elseif (isset($item['type']) && $item['type'] === 'new' && isset($item['index']) && isset($newPaths[$item['index']])) {
                            $finalImages[] = $newPaths[$item['index']];
                        }
                    }
                }
            }

            // Append any images that were not in order list
            foreach ($existingImages as $img) {
                if (!in_array($img, $finalImages)) {
                    $finalImages[] = $img;
                }
            }
            foreach ($newPaths as $img) {
                if (!in_array($img, $finalImages)) {
                    $finalImages[] = $img;
                }
            }

            // If no new files or existing images were sent
            if (!$request->has('images') && !$request->has('existing_images') && !$request->hasFile('images') && !$request->hasFile('image') && !$request->has('image')) {
                unset($validated['images']);
            } else {
                $validated['images'] = array_values(array_unique($finalImages));
                $validated['image'] = $finalImages[0] ?? null;
                $validated['featured_image'] = $finalImages[0] ?? null;
                $validated['thumbnail'] = $finalImages[0] ?? null;
            }

            unset($validated['existing_images'], $validated['image_order']);

            $product->update($validated);

            return redirect()->route('vendor.products.index')
                ->with('success', "Product '{$product->title}' updated successfully.");

        } catch (\Throwable $e) {
            Log::error('Product update failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $product->id,
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Product update failed: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Duplicate an existing product with a new SKU and draft status.
     */
    public function duplicate(Request $request, Product $product)
    {
        $vendor = $this->getVendor($request);

        if ($product->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to product.');
        }

        $copyTitle = $product->title . ' (Copy)';
        $newSku = $product->sku . '-COPY-' . Str::upper(Str::random(4));
        $newSlug = Str::slug($copyTitle) . '-' . Str::lower(Str::random(5));

        $duplicated = Product::create([
            'vendor_id' => $vendor->id,
            'category_id' => $product->category_id,
            'brand' => $product->brand,
            'title' => $copyTitle,
            'slug' => $newSlug,
            'sku' => $newSku,
            'barcode' => $product->barcode,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'cost_per_item' => $product->cost_per_item,
            'stock_quantity' => $product->stock_quantity,
            'low_stock_threshold' => $product->low_stock_threshold,
            'images' => $product->images,
            'description' => $product->description,
            'variants' => $product->variants,
            'status' => 'draft',
        ]);

        return redirect()->route('vendor.products.index')
            ->with('success', "Product duplicated as draft: '{$duplicated->title}'.");
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Request $request, Product $product)
    {
        $vendor = $this->getVendor($request);

        if ($product->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to product.');
        }

        // Clean up stored image files from disk
        if (is_array($product->images)) {
            foreach ($product->images as $img) {
                if (is_string($img) && str_starts_with($img, '/storage/')) {
                    $relative = Str::after($img, '/storage/');
                    if (Storage::disk('public')->exists($relative)) {
                        Storage::disk('public')->delete($relative);
                    }
                }
            }
        }

        $title = $product->title;
        $product->delete();

        return redirect()->route('vendor.products.index')
            ->with('success', "Product '{$title}' was successfully deleted.");
    }
}
