<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vendor;
use MongoDB\BSON\Decimal128;

echo "--- Testing Vendor commission_rate ---\n";
$vendor = Vendor::first();
echo "Vendor commission_rate type: " . get_debug_type($vendor->commission_rate) . "\n";
echo "Vendor commission_rate value: " . $vendor->commission_rate . "\n";

try {
    $f = (float) $vendor->commission_rate;
    echo "Direct (float) cast: $f\n";
} catch (\Throwable $e) {
    echo "❌ Direct (float) failed: " . $e->getMessage() . "\n";
}

try {
    $f2 = (float) (string) $vendor->commission_rate;
    echo "Via (string): $f2\n";
} catch (\Throwable $e) {
    echo "❌ Via (string) failed: " . $e->getMessage() . "\n";
}
