<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

echo "=======================================================\n";
echo "    BIZZHUSS END-TO-END AUTHENTICATION AUDIT SUITE     \n";
echo "=======================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertTest($condition, $description) {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [PASS] {$description}\n";
        $passCount++;
    } else {
        echo "  [FAIL] ❌ {$description}\n";
        $failCount++;
    }
}

// -----------------------------------------------------------
// 1. INSPECT EXISTING MIGRATED USERS
// -----------------------------------------------------------
echo "--- 1. Migrated Users & Password Verification ---\n";
$migratedUsers = User::all();
echo "Found " . $migratedUsers->count() . " existing user accounts in MongoDB:\n";
foreach ($migratedUsers as $u) {
    echo "  - {$u->name} | {$u->email} | Role: {$u->role} | ID: {$u->id}\n";
}

$admin = User::where('email', 'admin@bizzhuss.com')->first();
assertTest($admin !== null, "Admin user (admin@bizzhuss.com) exists in MongoDB");
if ($admin) {
    assertTest(str_starts_with($admin->password, '$2y$'), "Admin password hash is securely bcrypt-hashed");
    assertTest(Hash::check('SecurePass2026!', $admin->password), "Admin password verification succeeds with 'SecurePass2026!'");
    assertTest(!Hash::check('WrongPassword123!', $admin->password), "Admin password verification safely rejects invalid password");
    assertTest($admin->role === 'super_admin', "Admin role is 'super_admin'");
    assertTest($admin->isSuperAdmin(), "Admin helper isSuperAdmin() returns true");
}

// Check vendor user with store
$vendorUser = User::where('role', 'vendor')->first();
if ($vendorUser) {
    echo "\nTesting existing Vendor user: {$vendorUser->name} ({$vendorUser->email})\n";
    $vendorStore = Vendor::where('user_id', $vendorUser->id)->first();
    assertTest($vendorStore !== null, "Vendor store found for user via user_id={$vendorUser->id}");
    assertTest($vendorUser->vendor !== null, "User->vendor Eloquent relation successfully resolves");
}

// -----------------------------------------------------------
// 2. SIGNUP (REGISTRATION) AUDIT
// -----------------------------------------------------------
echo "\n--- 2. Signup (Registration) Audit ---\n";

// A. Input Validation Tests
$emptyValidator = Validator::make([], [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
    'password' => ['required', 'string', 'min:8', 'confirmed'],
    'role' => ['required', 'string', 'in:customer,vendor'],
]);
assertTest($emptyValidator->fails(), "Validation rejects completely empty registration input");

$duplicateValidator = Validator::make([
    'name' => 'Duplicate Tester',
    'email' => 'admin@bizzhuss.com',
    'password' => 'SecurePass2026!',
    'password_confirmation' => 'SecurePass2026!',
    'role' => 'customer',
], [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
    'password' => ['required', 'string', 'min:8', 'confirmed'],
    'role' => ['required', 'string', 'in:customer,vendor'],
]);
assertTest($duplicateValidator->fails(), "Duplicate email (admin@bizzhuss.com) registration is strictly prevented");
assertTest(isset($duplicateValidator->errors()->get('email')[0]), "Error message is returned for duplicate email");

$unconfirmedPassword = Validator::make([
    'name' => 'Mismatch Tester',
    'email' => 'mismatch_' . time() . '@example.com',
    'password' => 'ValidPass123!',
    'password_confirmation' => 'DifferentPass456!',
    'role' => 'customer',
], [
    'password' => ['required', 'string', 'min:8', 'confirmed'],
]);
assertTest($unconfirmedPassword->fails(), "Unconfirmed password is automatically rejected");

$shortPassword = Validator::make([
    'password' => 'short',
    'password_confirmation' => 'short',
], [
    'password' => ['required', 'string', 'min:8', 'confirmed'],
]);
assertTest($shortPassword->fails(), "Short password (<8 chars) is rejected");

$invalidRole = Validator::make([
    'role' => 'super_admin', // Guests cannot register themselves as super_admin
], [
    'role' => ['required', 'string', 'in:customer,vendor'],
]);
assertTest($invalidRole->fails(), "Unauthorized privilege escalation (role=super_admin at registration) is rejected");

// B. Customer Registration Flow
$testCustomerEmail = 'audit_customer_' . time() . '@example.com';
$createdCustomer = User::create([
    'name' => 'Audit Customer User',
    'email' => $testCustomerEmail,
    'password' => Hash::make('CustomerPass2026!'),
    'role' => 'customer',
    'phone' => '+15550001111',
    'status' => 'active',
    'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
]);
assertTest($createdCustomer && $createdCustomer->id, "Customer record successfully created in MongoDB");
assertTest(str_starts_with($createdCustomer->password, '$2y$'), "Customer password is encrypted with bcrypt");
assertTest(!str_contains($createdCustomer->password, 'CustomerPass2026!'), "Customer password is never stored as plain text");
assertTest($createdCustomer->role === 'customer', "Customer role correctly set to 'customer'");

// C. Vendor Registration Flow (with auto-provisioning)
$testVendorEmail = 'audit_vendor_' . time() . '@example.com';
$createdVendorUser = User::create([
    'name' => 'Audit Merchant User',
    'email' => $testVendorEmail,
    'password' => Hash::make('MerchantPass2026!'),
    'role' => 'vendor',
    'phone' => '+15550002222',
    'status' => 'active',
    'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
]);
$createdVendorStore = Vendor::create([
    'user_id' => $createdVendorUser->id,
    'shop_name' => 'Audit Merchant Enterprise',
    'slug' => 'audit-merchant-' . Str::random(5),
    'commission_rate' => 10.00,
    'status' => 'active',
    'description' => 'Verified marketplace merchant account for Audit Merchant Enterprise.',
]);
assertTest($createdVendorStore && $createdVendorStore->id, "Vendor store record created in MongoDB");
assertTest($createdVendorStore->user_id == $createdVendorUser->id, "Vendor store user_id matches user id");
assertTest($createdVendorUser->vendor !== null, "User->vendor relationship resolves to created Vendor store");
assertTest($createdVendorUser->vendor->shop_name === 'Audit Merchant Enterprise', "Vendor shop_name matches input");

// -----------------------------------------------------------
// 3. LOGIN & AUTHENTICATION AUDIT
// -----------------------------------------------------------
echo "\n--- 3. Login & Authentication Audit ---\n";

// A. Login with existing migrated credentials
$attemptMigrated = Auth::attempt(['email' => 'admin@bizzhuss.com', 'password' => 'SecurePass2026!']);
assertTest($attemptMigrated === true, "Auth::attempt succeeds for migrated admin credentials");
assertTest(Auth::check() === true, "Auth::check() confirms user is authenticated");
assertTest(Auth::user()->email === 'admin@bizzhuss.com', "Auth::user() returns authenticated admin record");

// Role-based redirection verification for admin
$adminRedirect = match (Auth::user()->role) {
    'super_admin' => route('admin.dashboard'),
    'marketing_manager' => route('marketing.dashboard'),
    'vendor' => route('vendor.portal'),
    'employee' => route('employee.workspace'),
    'customer' => route('customer.dashboard'),
    default => route('storefront'),
};
assertTest(str_contains($adminRedirect, '/admin'), "Admin login routes to /admin dashboard");

// Logout
Auth::logout();
assertTest(Auth::check() === false, "Auth::logout() successfully clears the session and logs user out");

// B. Login with newly created customer credentials
$attemptCustomer = Auth::attempt(['email' => $testCustomerEmail, 'password' => 'CustomerPass2026!']);
assertTest($attemptCustomer === true, "Auth::attempt succeeds for newly registered customer");
$customerRedirect = match (Auth::user()->role) {
    'super_admin' => route('admin.dashboard'),
    'marketing_manager' => route('marketing.dashboard'),
    'vendor' => route('vendor.portal'),
    'employee' => route('employee.workspace'),
    'customer' => route('customer.dashboard'),
    default => route('storefront'),
};
assertTest(str_contains($customerRedirect, '/customer/dashboard'), "Customer login routes to /customer/dashboard");
Auth::logout();

// C. Login with newly created vendor credentials
$attemptVendor = Auth::attempt(['email' => $testVendorEmail, 'password' => 'MerchantPass2026!']);
assertTest($attemptVendor === true, "Auth::attempt succeeds for newly registered vendor");
$vendorRedirect = match (Auth::user()->role) {
    'super_admin' => route('admin.dashboard'),
    'marketing_manager' => route('marketing.dashboard'),
    'vendor' => route('vendor.portal'),
    'employee' => route('employee.workspace'),
    'customer' => route('customer.dashboard'),
    default => route('storefront'),
};
assertTest(str_contains($vendorRedirect, '/vendor'), "Vendor login routes to /vendor portal");
Auth::logout();

// D. Security: Invalid Password Handling
$invalidPassAttempt = Auth::attempt(['email' => 'admin@bizzhuss.com', 'password' => 'WRONG_PASSWORD_XYZ']);
assertTest($invalidPassAttempt === false, "Auth::attempt strictly rejects incorrect password");
assertTest(Auth::check() === false, "Session remains unauthenticated after failed login attempt");

// E. Security: Nonexistent User Handling
$nonexistentAttempt = Auth::attempt(['email' => 'nobody_' . time() . '@doesnotexist.com', 'password' => 'AnyPassword123!']);
assertTest($nonexistentAttempt === false, "Auth::attempt safely handles non-existent user accounts without leaking info");

// -----------------------------------------------------------
// 4. RBAC MIDDLEWARE SIMULATION
// -----------------------------------------------------------
echo "\n--- 4. Role-Based Access Control (RBAC) Audit ---\n";
$middleware = new \App\Http\Middleware\CheckRole();

// Test Unauthenticated Guest hitting /admin
$guestReq = \Illuminate\Http\Request::create('/admin', 'GET');
$guestResponse = $middleware->handle($guestReq, function ($r) { return response('OK'); }, 'super_admin');
assertTest($guestResponse->isRedirection() && str_contains($guestResponse->headers->get('Location'), '/login'), "Guest hitting /admin is redirected to /login");

// Test Customer hitting /admin (should trigger 403 Access Denied)
$customerReq = \Illuminate\Http\Request::create('/admin', 'GET');
$customerReq->setUserResolver(fn () => $createdCustomer);
$caught403 = false;
try {
    $middleware->handle($customerReq, function ($r) { return response('OK'); }, 'super_admin');
} catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
    if ($e->getStatusCode() === 403) {
        $caught403 = true;
    }
}
assertTest($caught403, "Customer user attempting to access /admin is blocked with 403 Forbidden");

// Test Super Admin hitting /admin (should pass)
$adminReq = \Illuminate\Http\Request::create('/admin', 'GET');
$adminReq->setUserResolver(fn () => $admin);
$adminPassed = false;
$res = $middleware->handle($adminReq, function ($r) use (&$adminPassed) {
    $adminPassed = true;
    return response('OK');
}, 'super_admin');
assertTest($adminPassed, "Super Admin user is authorized to access /admin dashboard");

// Test Vendor hitting /vendor (should pass)
$vendorReq = \Illuminate\Http\Request::create('/vendor', 'GET');
$vendorReq->setUserResolver(fn () => $createdVendorUser);
$vendorPassed = false;
$res = $middleware->handle($vendorReq, function ($r) use (&$vendorPassed) {
    $vendorPassed = true;
    return response('OK');
}, 'vendor');
assertTest($vendorPassed, "Vendor user is authorized to access /vendor portal");

// Test Customer hitting /vendor (should trigger 403)
$vendorBlocked = false;
try {
    $middleware->handle($customerReq, function ($r) { return response('OK'); }, 'vendor');
} catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
    if ($e->getStatusCode() === 403) {
        $vendorBlocked = true;
    }
}
assertTest($vendorBlocked, "Customer user attempting to access /vendor is blocked with 403 Forbidden");

// -----------------------------------------------------------
// 5. CLEANUP TEMPORARY AUDIT DATA
// -----------------------------------------------------------
echo "\n--- 5. Clean up Temporary Test Accounts ---\n";
if ($createdVendorStore) {
    $createdVendorStore->delete();
    echo "  Cleaned up temporary vendor store.\n";
}
if ($createdVendorUser) {
    $createdVendorUser->delete();
    echo "  Cleaned up temporary vendor user.\n";
}
if ($createdCustomer) {
    $createdCustomer->delete();
    echo "  Cleaned up temporary customer user.\n";
}

echo "\n=======================================================\n";
echo "AUDIT RESULTS: {$passCount} PASSED, {$failCount} FAILED\n";
echo "=======================================================\n";

if ($failCount > 0) {
    exit(1);
}
