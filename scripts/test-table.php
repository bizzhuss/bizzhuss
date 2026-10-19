<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use MongoDB\Laravel\Connection;

$traits = class_uses_recursive(Connection::class);
echo "Uses Macroable: " . (in_array(Illuminate\Support\Traits\Macroable::class, $traits) ? 'yes' : 'no') . PHP_EOL;

if (in_array(Illuminate\Support\Traits\Macroable::class, $traits)) {
    Connection::macro('collection', function ($name) {
        return $this->table($name);
    });
    $conn = DB::connection('mongodb');
    $res = $conn->collection('categories');
    echo "Macro worked: " . get_class($res) . PHP_EOL;
}
