<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "Testing GET /shop ...\n";
$request = Illuminate\Http\Request::create('/shop', 'GET');
$response = $kernel->handle($request);
echo "GET /shop HTTP Status: " . $response->getStatusCode() . "\n";

echo "Testing GET / (Home) ...\n";
$homeRequest = Illuminate\Http\Request::create('/', 'GET');
$homeResponse = $kernel->handle($homeRequest);
echo "GET / HTTP Status: " . $homeResponse->getStatusCode() . "\n";
