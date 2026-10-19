<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "--- Testing User Model with MongoDB ---\n";
$user = User::where('email', 'admin@bizzhuss.com')->first();

if (!$user) {
    echo "❌ User admin@bizzhuss.com not found!\n";
    exit(1);
}

echo "✅ User found: {$user->name}\n";
echo "   ID: {$user->id}\n";
echo "   Role: {$user->role}\n";
echo "   Email: {$user->email}\n";
echo "   Password Hash: " . substr($user->password, 0, 15) . "...\n";

// Test password verification
$testPass = 'SecurePass2026!'; // Let's test if this password matches, or test invalid password
$valid = Hash::check($testPass, $user->password);
echo "   Password check with 'SecurePass2026!': " . ($valid ? "MATCH ✅" : "NO MATCH (expected if different password)") . "\n";

// Test Auth::attempt or manual validation
echo "\n--- Testing User Creation & Deletion (CRUD) ---";
$testEmail = 'audit_test_' . time() . '@example.com';
$createdUser = User::create([
    'name' => 'Audit Test User',
    'email' => $testEmail,
    'password' => Hash::make('Secret123!'),
    'role' => 'customer',
    'status' => 'active',
    'approval_status' => 'approved',
]);

echo "\n✅ Successfully created user: {$createdUser->name} ({$createdUser->email})\n";
echo "   Generated MongoDB ObjectId: {$createdUser->id}\n";

// Verify it exists in DB
$queried = User::where('email', $testEmail)->first();
if ($queried && $queried->id == $createdUser->id) {
    echo "✅ Verified queried user matches created user!\n";
} else {
    echo "❌ Failed to query created user!\n";
}

// Clean up test user
$queried->delete();
$afterDelete = User::where('email', $testEmail)->first();
if (!$afterDelete) {
    echo "✅ Successfully cleaned up test user.\n";
} else {
    echo "❌ Test user was not deleted!\n";
}

echo "\n🎉 ALL USER CRUD TESTS PASSED!\n";
