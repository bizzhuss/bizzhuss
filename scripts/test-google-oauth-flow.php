<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

echo "=======================================================\n";
echo "      GOOGLE OAUTH CONFIGURATION & FLOW VERIFICATION    \n";
echo "=======================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertCheck($condition, $description) {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [PASS] ✅ {$description}\n";
        $passCount++;
    } else {
        echo "  [FAIL] ❌ {$description}\n";
        $failCount++;
    }
}

// 1. Check services.php Google configuration
echo "--- 1. Testing config('services.google') ---\n";
$googleConfig = config('services.google');

assertCheck(!empty($googleConfig), "services.google config exists");
assertCheck(!empty($googleConfig['client_id']), "services.google.client_id is present");
assertCheck(!empty($googleConfig['client_secret']), "services.google.client_secret is present");
assertCheck(!empty($googleConfig['redirect']), "services.google.redirect is present");

$redirect = $googleConfig['redirect'] ?? '';
echo "Configured redirect URI: {$redirect}\n";

assertCheck(filter_var($redirect, FILTER_VALIDATE_URL) !== false, "services.google.redirect is a valid URL");
assertCheck(!str_contains($redirect, '['), "services.google.redirect has no markdown '[' bracket");
assertCheck(!str_contains($redirect, ']'), "services.google.redirect has no markdown ']' bracket");
assertCheck(!str_contains($redirect, '(') && !str_contains($redirect, ')'), "services.google.redirect has no markdown parentheses");

// 2. Test SocialAuthController::redirectToGoogle URL generation
echo "\n--- 2. Testing Redirect URL Generation ---\n";
try {
    $controller = new \App\Http\Controllers\SocialAuthController();
    $response = $controller->redirectToGoogle();
    
    $targetUrl = $response->getTargetUrl();
    echo "Generated Target OAuth URL:\n" . substr($targetUrl, 0, 100) . "...\n";
    
    assertCheck(str_starts_with($targetUrl, 'https://accounts.google.com/o/oauth2/auth') || str_starts_with($targetUrl, 'https://accounts.google.com/o/oauth2/v2/auth'), "Redirect target is Google OAuth authorization endpoint");
    
    $parsed = parse_url($targetUrl);
    parse_str($parsed['query'] ?? '', $queryParams);
    
    assertCheck(!empty($queryParams['redirect_uri']), "Target URL contains non-empty 'redirect_uri' parameter");
    echo "Extracted redirect_uri param: " . ($queryParams['redirect_uri'] ?? 'NONE') . "\n";
    
    assertCheck(filter_var($queryParams['redirect_uri'], FILTER_VALIDATE_URL) !== false, "redirect_uri param is a valid URL");
    assertCheck(!empty($queryParams['client_id']), "Target URL contains 'client_id' parameter");
    assertCheck($queryParams['response_type'] === 'code', "Target URL response_type is 'code'");
    assertCheck(str_contains($queryParams['scope'] ?? '', 'openid') || str_contains($queryParams['scope'] ?? '', 'email'), "Target URL requests required scopes");
} catch (\Throwable $e) {
    echo "❌ Redirect error: " . $e->getMessage() . "\n";
    assertCheck(false, "Redirect URL generation without error");
}

// 3. Test MongoDB user handling on Google callback
echo "\n--- 3. Testing MongoDB User Provisioning via Google OAuth ---\n";
$mockGoogleId = 'mock_google_id_' . time();
$mockGoogleEmail = 'mock_oauth_' . time() . '@example.com';

try {
    // A. Provision new user as SocialAuthController would do
    $newUser = User::create([
        'name' => 'Mock Google User',
        'email' => $mockGoogleEmail,
        'google_id' => $mockGoogleId,
        'avatar' => 'https://lh3.googleusercontent.com/mock-avatar',
        'password' => null,
        'role' => 'customer',
        'status' => 'active',
        'approval_status' => 'approved',
        'email_verified_at' => now(),
    ]);

    assertCheck($newUser && $newUser->id, "New Google user successfully persisted in MongoDB");
    assertCheck(is_string($newUser->google_id) && $newUser->google_id === $mockGoogleId, "google_id is stored strictly as String");
    assertCheck($newUser->email_verified_at !== null, "email_verified_at is set for Google user");

    // B. Test querying user back via google_id or email
    $foundUser = User::where('google_id', $mockGoogleId)->orWhere('email', $mockGoogleEmail)->first();
    assertCheck($foundUser && $foundUser->id == $newUser->id, "User querying by google_id matches in MongoDB");

    // C. Test update existing user (e.g. avatar update)
    $foundUser->update([
        'google_id' => $mockGoogleId,
        'avatar' => 'https://lh3.googleusercontent.com/updated-avatar',
    ]);
    assertCheck($foundUser->fresh()->avatar === 'https://lh3.googleusercontent.com/updated-avatar', "Existing user successfully updated with new Google profile data");

    // Clean up
    $newUser->delete();
    echo "Cleaned up mock test user.\n";
} catch (\Throwable $e) {
    echo "❌ MongoDB Google user handling error: " . $e->getMessage() . "\n";
    assertCheck(false, "Google user provisioning test in MongoDB");
}

echo "\n=======================================================\n";
echo "SUMMARY: {$passCount} PASSED, {$failCount} FAILED\n";
echo "=======================================================\n";

if ($failCount > 0) {
    exit(1);
}
