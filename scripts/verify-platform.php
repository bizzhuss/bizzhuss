<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "=======================================================\n";
echo "       BIZZHUSS END-TO-END PLATFORM HEALTH CHECK        \n";
echo "=======================================================\n\n";

$passCount = 0;
$failCount = 0;

function check($condition, $label) {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [PASS] ✅ $label\n";
        $passCount++;
    } else {
        echo "  [FAIL] ❌ $label\n";
        $failCount++;
    }
}

// 1. Database Read / Write Test
echo "--- 1. MongoDB Atlas Read / Write / Delete Lifecycle ---\n";
try {
    $testKey = 'audit_test_' . time();
    $cat = App\Models\Category::create([
        'name' => 'Test Health Category',
        'slug' => 'test-health-' . time(),
        'is_active' => true,
    ]);
    check($cat && $cat->id, "MongoDB Category insert successful (ID: {$cat->id})");

    $found = App\Models\Category::find((string)$cat->id);
    check($found && $found->name === 'Test Health Category', "MongoDB Category read by string ID successful");

    $found->update(['name' => 'Updated Health Category']);
    $updated = App\Models\Category::find((string)$cat->id);
    check($updated && $updated->name === 'Updated Health Category', "MongoDB Category update successful");

    $cat->delete();
    $deleted = App\Models\Category::find((string)$cat->id);
    check(!$deleted, "MongoDB Category cleanup/delete successful");
} catch (\Throwable $e) {
    check(false, "MongoDB Read/Write exception: " . $e->getMessage());
}

// 2. Primary Route Checks (Guest)
echo "\n--- 2. Route Checks (Unauthenticated) ---\n";
$routesToTest = [
    '/' => [200],
    '/shop' => [200],
    '/login' => [200],
    '/register' => [200],
    '/maintenance' => [200],
    '/admin' => [302], // redirect to login
    '/vendor' => [302], // redirect to login
];

foreach ($routesToTest as $uri => $expectedCodes) {
    try {
        $req = Illuminate\Http\Request::create($uri, 'GET');
        $resp = $kernel->handle($req);
        $status = $resp->getStatusCode();
        check(in_array($status, $expectedCodes), "GET {$uri} returned HTTP {$status} (expected " . implode(',', $expectedCodes) . ")");
    } catch (\Throwable $e) {
        check(false, "GET {$uri} error: " . $e->getMessage());
    }
}

// 3. Super Admin RBAC Check
echo "\n--- 3. Super Admin RBAC Master Bypass Test ---\n";
try {
    $superAdmin = App\Models\User::where('email', 'haseebkhanuddin44@gmail.com')->first();
    if (!$superAdmin) {
        $superAdmin = App\Models\User::where('role', 'super_admin')->first();
    }
    check($superAdmin !== null, "Super Admin user exists in MongoDB");
    check($superAdmin && $superAdmin->hasPermissionTo('anything'), "Super Admin has universal permission bypass");
    check($superAdmin && $superAdmin->hasRole('super_admin'), "Super Admin role check passes");

    if ($superAdmin) {
        Illuminate\Support\Facades\Auth::login($superAdmin);
        $adminReq = Illuminate\Http\Request::create('/admin', 'GET');
        $adminReq->setUserResolver(fn() => $superAdmin);
        $adminResp = $kernel->handle($adminReq);
        $adminStatus = $adminResp->getStatusCode();
        check($adminStatus === 200, "Super Admin authorized access to /admin returned HTTP {$adminStatus}");
    }
} catch (\Throwable $e) {
    check(false, "Super Admin RBAC test error: " . $e->getMessage());
}

// 4. Model Inheritance Check
echo "\n--- 4. Model MongoDB Inheritance Normalization ---\n";
$allModels = [
    'User', 'Product', 'Category', 'Order', 'OrderItem', 'Review', 
    'Store', 'VendorProfile', 'Vendor', 'Setting', 'Coupon', 
    'Department', 'Designation', 'Employee', 'EmployeeTask', 
    'Commission', 'Payout', 'SubOrder', 'Task', 'TaskActivity'
];

foreach ($allModels as $modelName) {
    $class = "App\\Models\\$modelName";
    if (class_exists($class)) {
        $inst = new $class;
        $isMongo = is_subclass_of($class, 'MongoDB\\Laravel\\Eloquent\\Model') || is_subclass_of($class, 'MongoDB\\Laravel\\Auth\\User');
        check($isMongo && $inst->getConnectionName() === 'mongodb', "$modelName extends MongoDB model with mongodb connection");
    } else {
        check(false, "Class $class does not exist");
    }
}

echo "\n=======================================================\n";
echo "SUMMARY: {$passCount} PASSED, {$failCount} FAILED\n";
echo "=======================================================\n";

exit($failCount > 0 ? 1 : 0);
