<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$settings = DB::connection('mongodb')->table('settings');

try {
    echo "Testing updateOrInsert with direct fields...\n";
    $settings->updateOrInsert(
        ['key' => 'store_maintenance_mode'],
        [
            'maintenance_enabled' => false,
            'blocked_roles' => ['guest', 'customer'],
            'updated_at' => now()
        ]
    );
    echo "Success with direct fields!\n";
    $doc = $settings->where('key', 'store_maintenance_mode')->first();
    echo "Doc found: " . json_encode($doc) . PHP_EOL;
} catch (\Throwable $e) {
    echo "Direct fields failed: " . $e->getMessage() . PHP_EOL;
}
