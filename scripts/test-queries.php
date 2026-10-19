<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Vendor;
use App\Models\Department;

echo "--- Testing Model Accessors for counts ---\n";

$cat = Category::first();
echo "Category: " . ($cat ? $cat->name : 'none') . "\n";
echo "Products count for category: " . ($cat ? $cat->products()->count() : 'none') . "\n";

$vendor = Vendor::first();
echo "Vendor: " . ($vendor ? $vendor->shop_name : 'none') . "\n";
echo "Products count for vendor: " . ($vendor ? $vendor->products()->count() : 'none') . "\n";

$dept = Department::first();
echo "Department: " . ($dept ? $dept->name : 'none') . "\n";
echo "Employees count for dept: " . ($dept ? $dept->employees()->count() : 'none') . "\n";
