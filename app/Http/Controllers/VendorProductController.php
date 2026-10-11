<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
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
        $vendor = $this->getVendor($request);

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0.01',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',
            'sku' => 'required|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'images' => 'nullable|array|max:5',
            'existing_images' => 'nullable|array|max:5',
            'existing_images.*' => 'nullable|string',
            'image_order' => 'nullable|string',
            'variants' => 'nullable|array',
            'status' => 'required|in:published,pending_review,draft',
        ];

        if ($request->hasFile('images')) {
            $rules['images.*'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096';
        } else {
            $rules['images.*'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        $slugBase = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $uniqueSlug = $slugBase . '-' . Str::lower(Str::random(5));

        // If vendor is not active, enforce pending_review status
        if ($vendor->status !== 'active') {
            $validated['status'] = 'pending_review';
        }

        // Process uploaded image files
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products', 'public');
                    $imagePaths[] = '/storage/' . $path;
                }
            }
        }

        // Support string images if provided (e.g. from existing_images or initial data / testing)
        if ($request->filled('existing_images') && is_array($request->input('existing_images'))) {
            foreach ($request->input('existing_images') as $img) {
                if (is_string($img) && !empty($img) && !in_array($img, $imagePaths)) {
                    $imagePaths[] = $img;
                }
            }
        } elseif ($request->filled('images') && is_array($request->input('images')) && !$request->hasFile('images')) {
            foreach ($request->input('images') as $img) {
                if (is_string($img) && !empty($img) && !in_array($img, $imagePaths)) {
                    $imagePaths[] = $img;
                }
            }
        }

        // Re-order if image_order metadata is passed
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

        $product = Product::create([
            'vendor_id' => $vendor->id,
            'category_id' => $validated['category_id'],
            'brand' => $validated['brand'] ?? null,
            'title' => $validated['title'],
            'slug' => $uniqueSlug,
            'sku' => Str::upper($validated['sku']),
            'barcode' => $validated['barcode'] ?? null,
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'cost_per_item' => $validated['cost_per_item'] ?? null,
            'stock_quantity' => $validated['stock_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'images' => array_values(array_unique($imagePaths)),
            'description' => $validated['description'] ?? '',
            'variants' => $validated['variants'] ?? [],
            'status' => $validated['status'],
        ]);

        return redirect()->route('vendor.products.index')
            ->with('success', "Product '{$product->title}' created successfully.");
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
        $vendor = $this->getVendor($request);

        if ($product->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to product.');
        }

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0.01',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',
            'sku' => "required|string|max:100|unique:products,sku,{$product->id}",
            'barcode' => 'nullable|string|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'images' => 'nullable|array|max:5',
            'existing_images' => 'nullable|array|max:5',
            'existing_images.*' => 'nullable|string',
            'image_order' => 'nullable|string',
            'variants' => 'nullable|array',
            'status' => 'required|in:published,pending_review,draft',
        ];

        if ($request->hasFile('images')) {
            $rules['images.*'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096';
        } else {
            $rules['images.*'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        if (!empty($validated['slug']) && $validated['slug'] !== $product->slug) {
            $validated['slug'] = Str::slug($validated['slug']) . '-' . Str::lower(Str::random(4));
        } else {
            unset($validated['slug']);
        }

        $validated['sku'] = Str::upper($validated['sku']);

        // If vendor is not active, enforce pending_review status
        if ($vendor->status !== 'active') {
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
        }

        // 2. Upload new image files
        $newPaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products', 'public');
                    $newPaths[] = '/storage/' . $path;
                }
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

        // 4. In the update method, handle deleting old unneeded files from disk when a vendor removes an image
        $oldImages = is_array($product->images) ? $product->images : [];
        foreach ($oldImages as $oldImg) {
            if (is_string($oldImg) && !in_array($oldImg, $finalImages)) {
                if (str_starts_with($oldImg, '/storage/')) {
                    $relative = Str::after($oldImg, '/storage/');
                    if (Storage::disk('public')->exists($relative)) {
                        Storage::disk('public')->delete($relative);
                    }
                }
            }
        }

        // If no new files or existing images were sent (or neither was present in request at all, e.g. partial test update)
        if (!$request->has('images') && !$request->has('existing_images') && !$request->hasFile('images')) {
            unset($validated['images']);
        } else {
            $validated['images'] = array_values(array_unique($finalImages));
        }

        unset($validated['existing_images'], $validated['image_order']);

        $product->update($validated);

        return redirect()->route('vendor.products.index')
            ->with('success', "Product '{$product->title}' updated successfully.");
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
