<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Laravel\Socialite\Facades\Socialite;

echo "--- Current Google OAuth Config ---\n";
var_dump(config('services.google'));

try {
    $redirectResponse = Socialite::driver('google')->redirect();
    $targetUrl = $redirectResponse->getTargetUrl();
    echo "\nTarget Redirect URL:\n" . $targetUrl . "\n";
    
    // Parse query params to inspect redirect_uri
    $parts = parse_url($targetUrl);
    parse_str($parts['query'] ?? '', $query);
    echo "\nRedirect URI in query: " . ($query['redirect_uri'] ?? 'MISSING!') . "\n";
    echo "Client ID in query: " . ($query['client_id'] ?? 'MISSING!') . "\n";
} catch (\Throwable $e) {
    echo "\n❌ Error in redirect: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
