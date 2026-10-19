<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Vendor;
use App\Models\Category;

echo "--- Testing Product with vendor:id,... in MongoDB ---\n";

// Let's create a temporary product linked to existing vendor and category
$vendor = Vendor::first();
$category = Category::first();

if (!$vendor || !$category) {
    echo "Missing vendor or category\n";
    exit(1);
}

$prod = Product::create([
    'vendor_id' => $vendor->id,
    'category_id' => $category->id,
    'title' => 'Audit Test Product',
    'slug' => 'audit-test-product-' . time(),
    'price' => 99.99,
    'stock_quantity' => 10,
    'status' => 'published',
]);

echo "Created test product: {$prod->title} (id={$prod->id})\n";

try {
    $queried = Product::with(['vendor:id,shop_name,logo,commission_rate,status', 'category:id,name,slug'])
        ->where('id', $prod->id)
        ->first();
    echo "Queried product: " . ($queried ? $queried->title : 'null') . "\n";
    echo "Vendor loaded: " . ($queried && $queried->vendor ? $queried->vendor->shop_name : 'null') . "\n";
    echo "Category loaded: " . ($queried && $queried->category ? $queried->category->name : 'null') . "\n";
} catch (\Throwable $e) {
    echo "❌ Error loading product with relations: " . $e->getMessage() . "\n";
}

// Clean up
$prod->delete();
echo "Cleaned up test product.\n";
