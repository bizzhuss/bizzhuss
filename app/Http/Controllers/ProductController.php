<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Store a newly created product in MongoDB.
     * Exception-safe implementation with direct Cloudinary upload & async string URL support.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|string',
            'description' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'image' => 'nullable', // Can be string URL or UploadedFile
        ]);

        try {
            $imageUrl = null;

            // If user submitted an uploaded file directly in the form
            if ($request->hasFile('image')) {
                $imageUrl = CloudinaryService::uploadImage(
                    $request->file('image'), 
                    'bizzhuss_products'
                );
            } elseif (is_string($request->input('image')) && !empty($request->input('image'))) {
                // Already uploaded via async /upload/image endpoint
                $imageUrl = $request->input('image');
            } elseif ($request->hasFile('images')) {
                $files = $request->file('images');
                $firstFile = is_array($files) ? ($files[0] ?? null) : $files;
                if ($firstFile && $firstFile->isValid()) {
                    $imageUrl = CloudinaryService::uploadImage($firstFile, 'bizzhuss_products');
                }
            } elseif ($request->filled('images')) {
                $images = $request->input('images');
                if (is_array($images) && !empty($images)) {
                    $imageUrl = $images[0];
                } elseif (is_string($images)) {
                    $imageUrl = $images;
                }
            }

            // Clean user / vendor identification
            $vendorId = auth()->id() ?? null;
            $name = $request->input('name') ?: $request->input('title') ?: 'Untitled Product';
            $stock = (int) ($request->input('stock') ?? $request->input('stock_quantity') ?? 100);
            $sku = $request->input('sku') ? Str::upper($request->input('sku')) : 'SKU-' . Str::upper(Str::random(8));

            $product = Product::create([
                'name' => $name,
                'title' => $name,
                'slug' => Str::slug($name) . '-' . substr(uniqid(), -5),
                'price' => (float) $request->price,
                'compare_price' => $request->compare_price ? (float) $request->compare_price : null,
                'description' => $request->description ?? '',
                'image' => $imageUrl,
                'images' => $imageUrl ? [$imageUrl] : [],
                'featured_image' => $imageUrl,
                'thumbnail' => $imageUrl,
                'category_id' => $request->category_id,
                'vendor_id' => (string) $vendorId,
                'status' => 'active',
                'stock' => $stock,
                'stock_quantity' => $stock,
                'sku' => $sku,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->back()->with('success', 'Product created successfully!');

        } catch (\Throwable $e) {
            Log::error('Product creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->except(['image', 'images']),
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Product creation failed: ' . $e->getMessage()
            ])->withInput();
        }
    }
}
