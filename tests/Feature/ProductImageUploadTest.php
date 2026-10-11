<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProductImageUploadTest extends TestCase
{
    protected User $vendorUser;
    protected Vendor $vendor;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->vendorUser = User::where('role', 'vendor')->first() ?? User::factory()->create([
            'role' => 'vendor',
            'status' => 'active',
        ]);

        $this->vendor = Vendor::firstOrCreate(
            ['user_id' => $this->vendorUser->id],
            [
                'shop_name' => 'Apex Technologies',
                'slug' => 'apex-technologies-' . Str::lower(Str::random(4)),
                'status' => 'active',
                'commission_rate' => 10.00,
            ]
        );

        $this->category = Category::first() ?? Category::create([
            'name' => 'Industrial Hardware',
            'slug' => 'industrial-hardware-' . Str::lower(Str::random(4)),
        ]);
    }

    /**
     * Test creating product with multiple uploaded image files saved to public storage.
     */
    public function test_vendor_can_create_product_with_uploaded_images(): void
    {
        $file1 = UploadedFile::fake()->image('cover_main.jpg', 600, 600)->size(500);
        $file2 = UploadedFile::fake()->image('angle_side.png', 600, 600)->size(400);
        $file3 = UploadedFile::fake()->image('detail_back.webp', 600, 600)->size(300);

        $sku = 'IMG-SKU-' . rand(10000, 99999);

        $response = $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Hydraulic Valve Pro Edition',
            'category_id' => $this->category->id,
            'price' => 149.99,
            'compare_price' => 189.99,
            'sku' => $sku,
            'stock_quantity' => 20,
            'status' => 'published',
            'images' => [$file1, $file2, $file3],
            'image_order' => json_encode([
                ['type' => 'new', 'index' => 0],
                ['type' => 'new', 'index' => 1],
                ['type' => 'new', 'index' => 2],
            ]),
        ]);

        $response->assertSessionHas('success');

        $product = Product::where('sku', $sku)->first();
        $this->assertNotNull($product);
        $this->assertCount(3, $product->images);

        // Verify stored path prefix
        foreach ($product->images as $path) {
            $this->assertStringStartsWith('/storage/products/', $path);
            $relativePath = Str::after($path, '/storage/');
            Storage::disk('public')->assertExists($relativePath);
        }

        // Cleanup
        $product->delete();
    }

    /**
     * Test image file validation rejects non-image formats.
     */
    public function test_image_validation_rejects_disallowed_formats(): void
    {
        $badFile = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Invalid File Product',
            'category_id' => $this->category->id,
            'price' => 59.99,
            'sku' => 'BAD-EXT-' . rand(10000, 99999),
            'stock_quantity' => 10,
            'status' => 'published',
            'images' => [$badFile],
        ]);

        $response->assertSessionHasErrors(['images.0']);
    }

    /**
     * Test updating product deletes removed images from storage disk.
     */
    public function test_updating_product_deletes_removed_image_from_disk(): void
    {
        // 1. Create product with 2 files
        $file1 = UploadedFile::fake()->image('image_one.jpg', 400, 400);
        $file2 = UploadedFile::fake()->image('image_two.jpg', 400, 400);

        $sku = 'DEL-DISK-' . rand(10000, 99999);

        $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Rotary Actuator Gen 1',
            'category_id' => $this->category->id,
            'price' => 99.00,
            'sku' => $sku,
            'stock_quantity' => 15,
            'status' => 'published',
            'images' => [$file1, $file2],
        ]);

        $product = Product::where('sku', $sku)->first();
        $this->assertNotNull($product);
        $this->assertCount(2, $product->images);

        $path1 = $product->images[0];
        $path2 = $product->images[1];

        $rel1 = Str::after($path1, '/storage/');
        $rel2 = Str::after($path2, '/storage/');

        Storage::disk('public')->assertExists($rel1);
        Storage::disk('public')->assertExists($rel2);

        // 2. Update product: keep only path2 and remove path1
        $response = $this->actingAs($this->vendorUser)->put("/vendor/products/{$product->id}", [
            'title' => 'Rotary Actuator Gen 1 (Updated)',
            'category_id' => $this->category->id,
            'price' => 109.00,
            'sku' => $sku,
            'stock_quantity' => 12,
            'status' => 'published',
            'existing_images' => [$path2],
            'image_order' => json_encode([
                ['type' => 'existing', 'url' => $path2],
            ]),
        ]);

        $response->assertSessionHas('success');

        // Verify product now only has path2
        $updatedImages = $product->fresh()->images;
        $this->assertCount(1, $updatedImages);
        $this->assertEquals($path2, $updatedImages[0]);

        // path1 must be deleted from storage disk
        Storage::disk('public')->assertMissing($rel1);
        // path2 must still exist
        Storage::disk('public')->assertExists($rel2);

        // Cleanup
        $product->delete();
    }

    /**
     * Test destroying product cleans up all stored images from disk.
     */
    public function test_deleting_product_removes_all_stored_images(): void
    {
        $file = UploadedFile::fake()->image('temp_item.webp', 400, 400);
        $sku = 'CLEANUP-' . rand(10000, 99999);

        $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Disposable Sensor Module',
            'category_id' => $this->category->id,
            'price' => 29.99,
            'sku' => $sku,
            'stock_quantity' => 5,
            'status' => 'published',
            'images' => [$file],
        ]);

        $product = Product::where('sku', $sku)->first();
        $this->assertNotNull($product);

        $path = $product->images[0];
        $rel = Str::after($path, '/storage/');
        Storage::disk('public')->assertExists($rel);

        // Delete product
        $this->actingAs($this->vendorUser)->delete("/vendor/products/{$product->id}");

        // Assert file removed
        Storage::disk('public')->assertMissing($rel);
        $this->assertNull(Product::find($product->id));
    }

    /**
     * Test storefront and product detail safely render with stored paths.
     */
    public function test_storefront_safely_renders_stored_product_images(): void
    {
        $file = UploadedFile::fake()->image('storefront_preview.jpg', 600, 600);
        $sku = 'STORE-IMG-' . rand(10000, 99999);

        $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Storefront Display Item',
            'category_id' => $this->category->id,
            'price' => 88.00,
            'sku' => $sku,
            'stock_quantity' => 10,
            'status' => 'published',
            'images' => [$file],
        ]);

        $product = Product::where('sku', $sku)->first();

        // 1. Home page renders
        $this->get('/')->assertStatus(200);

        // 2. Shop page renders
        $this->get('/shop')->assertStatus(200);

        // 3. Product detail page renders
        $this->get("/product/{$product->slug}")->assertStatus(200);

        // Cleanup
        $product->delete();
    }
}
