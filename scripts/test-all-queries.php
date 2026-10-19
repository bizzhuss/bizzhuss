<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Vendor;
use App\Models\Department;
use App\Models\Product;
use App\Models\VendorPayout;

echo "--- 1. Testing HandleInertiaRequests category resolution ---\n";
$cats = Category::whereNull('parent_id')
    ->where('is_active', true)
    ->with(['products', 'subcategories' => fn ($q) => $q->where('is_active', true)->with('products')])
    ->orderBy('order', 'asc')
    ->get();
echo "Categories count: " . $cats->count() . "\n";
foreach ($cats as $c) {
    echo "  - Cat: {$c->name}, products_count: {$c->products_count}\n";
    foreach ($c->subcategories as $sub) {
        echo "      Subcat: {$sub->name}, products_count: {$sub->products_count}\n";
    }
}
echo "✅ Categories query test passed!\n\n";

echo "--- 2. Testing AdminSettingController categories & rootCategories ---\n";
$categories = Category::with(['parent', 'subcategories', 'products'])->orderBy('name')->get();
$rootCategories = Category::whereNull('parent_id')->with(['subcategories.products', 'products'])->orderBy('name')->get();
echo "All categories: " . $categories->count() . ", Root categories: " . $rootCategories->count() . "\n";
echo "✅ AdminSettingController queries passed!\n\n";

echo "--- 3. Testing AdminVendorController vendor list ---\n";
$vendors = Vendor::with(['user:id,name,email,phone,avatar', 'products'])->get();
echo "Vendors count: " . $vendors->count() . "\n";
foreach ($vendors as $v) {
    echo "  - Vendor: {$v->shop_name}, products_count: {$v->products_count}\n";
}
echo "✅ AdminVendorController queries passed!\n\n";

echo "--- 4. Testing AdminWorkforceController departments list ---\n";
$departments = Department::with(['designations', 'employees'])->orderBy('name')->get();
echo "Departments count: " . $departments->count() . "\n";
foreach ($departments as $d) {
    echo "  - Department: {$d->name}, employees_count: {$d->employees_count}\n";
}
echo "✅ AdminWorkforceController queries passed!\n\n";

echo "🎉 ALL CONTROLLER QUERIES PASSED ON MONGODB ATLAS!\n";
