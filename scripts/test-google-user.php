<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "--- 1. Testing User lookup with google_id and email in MongoDB ---\n";

$testGoogleId = '115070449084300620000';
$testEmail = 'bizzhuss@gmail.com';

try {
    $user = User::where('google_id', $testGoogleId)
        ->orWhere('email', $testEmail)
        ->first();
    echo "Found user: " . ($user ? "{$user->name} ({$user->email}, google_id={$user->google_id})" : "null") . "\n";
    
    if ($user) {
        $user->update([
            'google_id' => (string) $testGoogleId,
            'approval_status' => $user->approval_status ?? 'approved',
        ]);
        echo "✅ User update succeeded!\n";
    }
} catch (\Throwable $e) {
    echo "❌ Lookup/update error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n--- 2. Testing new Google user creation with password=null ---\n";
$newGoogleId = '99999999999999999999';
$newEmail = 'new_google_user_' . time() . '@example.com';

try {
    $newUser = User::create([
        'name' => 'New Google Tester',
        'email' => $newEmail,
        'google_id' => (string) $newGoogleId,
        'avatar' => 'https://example.com/avatar.jpg',
        'password' => null,
        'role' => 'customer',
        'status' => 'active',
        'approval_status' => 'approved',
        'email_verified_at' => now(),
    ]);
    echo "✅ New Google user created: {$newUser->name} (id={$newUser->id}, password=" . var_export($newUser->password, true) . ")\n";

    // Test Auth::login
    Auth::login($newUser, true);
    echo "✅ Auth::login succeeded! Authenticated as: " . Auth::user()->email . "\n";
    Auth::logout();

    // Clean up
    $newUser->delete();
    echo "✅ Cleaned up test user.\n";
} catch (\Throwable $e) {
    echo "❌ New user creation failed: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
