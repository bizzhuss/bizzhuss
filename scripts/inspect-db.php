<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "Total Users: " . User::count() . PHP_EOL;
foreach (User::all() as $u) {
    echo "ID: {$u->id} | Email: {$u->email} | Role: {$u->role} | Name: {$u->name}" . PHP_EOL;
}

echo "\n--- Existing Collections & Counts ---\n";
$conn = DB::connection('mongodb');
echo "Connection class: " . get_class($conn) . PHP_EOL;

$collections = [
    'users', 'vendors', 'products', 'orders', 'order_items', 'coupons', 
    'categories', 'settings', 'promotional_banners', 'promotional_campaigns',
    'tasks', 'task_activities', 'employees', 'departments', 'designations',
    'vendor_payouts', 'carts', 'cart_items', 'reviews', 'notifications', 'flash_deals', 'payout_requests'
];

foreach ($collections as $col) {
    try {
        $count = $conn->table($col)->count();
        echo "{$col}: {$count} documents" . PHP_EOL;
    } catch (\Throwable $e) {
        echo "{$col}: [error: " . $e->getMessage() . "]" . PHP_EOL;
    }
}
