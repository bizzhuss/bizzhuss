<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "=======================================================\n";
echo "      BIZZHUSS MONGODB RBAC & PERMISSIONS AUDIT SUITE    \n";
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

// 1. User Trait Methods Test
echo "--- 1. HasMongoPermissions Trait Unit Tests ---\n";

$user = new App\Models\User([
    'name' => 'Test RBAC User',
    'email' => 'rbac_test_' . time() . '@test.com',
    'role' => 'employee',
    'permissions' => ['tier.employee_desk', 'module.kanban'],
]);

// Test hasRole
check($user->hasRole('employee'), "hasRole('employee') returns true for employee");
check(!$user->hasRole('vendor'), "hasRole('vendor') returns false for employee");
check($user->hasRole(['employee', 'vendor']), "hasRole(['employee', 'vendor']) returns true (array check)");
check(!$user->hasRole(['super_admin', 'vendor']), "hasRole(['super_admin', 'vendor']) returns false");

// Test hasPermission
check($user->hasPermission('tier.employee_desk'), "hasPermission('tier.employee_desk') returns true");
check($user->hasPermission('module.kanban'), "hasPermission('module.kanban') returns true");
check(!$user->hasPermission('module.platform_settings'), "hasPermission('module.platform_settings') returns false");
check($user->hasPermissionTo('tier.employee_desk'), "hasPermissionTo('tier.employee_desk') alias works");

// Test hasAnyPermission & hasAllPermissions
check($user->hasAnyPermission('module.kanban', 'module.platform_settings'), "hasAnyPermission() returns true when 1 matches");
check(!$user->hasAnyPermission('module.platform_settings', 'module.vendor_oversight'), "hasAnyPermission() returns false when none match");
check($user->hasAllPermissions('tier.employee_desk', 'module.kanban'), "hasAllPermissions() returns true when all match");
check(!$user->hasAllPermissions('tier.employee_desk', 'module.platform_settings'), "hasAllPermissions() returns false when one missing");

// Test Super Admin Overrides
$superAdmin = new App\Models\User([
    'name' => 'Super Admin User',
    'email' => 'superadmin_test@test.com',
    'role' => 'super_admin',
    'permissions' => ['*'],
]);

check($superAdmin->hasRole('any_role_imaginable'), "Super Admin hasRole() returns true for any role");
check($superAdmin->hasRole(['vendor', 'customer']), "Super Admin hasRole(array) returns true");
check($superAdmin->hasPermission('module.platform_settings'), "Super Admin hasPermission() returns true for any permission");
check($superAdmin->hasPermission('non_existent_permission'), "Super Admin hasPermission() returns true for non-existent permission");
check($superAdmin->hasAnyPermission('random_perm'), "Super Admin hasAnyPermission() returns true");
check($superAdmin->hasAllPermissions('random1', 'random2'), "Super Admin hasAllPermissions() returns true");

// 2. BSON Array fromJson Safety Test
echo "\n--- 2. MongoDB BSON Array Deserialization Safety ---\n";
try {
    $arrayVal = ['module.kanban', 'tier.employee_desk'];
    $decodedArray = $user->fromJson($arrayVal);
    check(is_array($decodedArray) && count($decodedArray) === 2, "fromJson() handles native PHP/BSON array without TypeError");

    $jsonStringVal = json_encode(['tier.vendor_portal']);
    $decodedString = $user->fromJson($jsonStringVal);
    check(is_array($decodedString) && in_array('tier.vendor_portal', $decodedString), "fromJson() handles JSON string properly");

    $nullVal = $user->fromJson(null);
    check($nullVal === null, "fromJson() handles null properly");
} catch (\Throwable $e) {
    check(false, "fromJson safety exception: " . $e->getMessage());
}

// 3. Permissions Sync & Grant Lifecycle in MongoDB
echo "\n--- 3. MongoDB Persistence & Mutation Lifecycle ---\n";
try {
    $persistedUser = App\Models\User::create([
        'name' => 'Mongo RBAC Test User',
        'email' => 'mongo_rbac_' . time() . '@example.com',
        'role' => 'employee',
        'permissions' => ['tier.employee_desk'],
        'password' => bcrypt('Secret123!'),
    ]);

    check($persistedUser && $persistedUser->id, "Persisted test employee to MongoDB");
    check($persistedUser->hasPermission('tier.employee_desk'), "Persisted user has tier.employee_desk");

    // Give permission
    $persistedUser->givePermissionTo('module.kanban', 'module.workforce');
    $reloaded = App\Models\User::find((string)$persistedUser->id);
    check($reloaded->hasPermission('module.kanban'), "givePermissionTo() added module.kanban to MongoDB document");
    check($reloaded->hasPermission('module.workforce'), "givePermissionTo() added module.workforce to MongoDB document");

    // Revoke permission
    $reloaded->revokePermissionTo('module.workforce');
    $reloaded2 = App\Models\User::find((string)$persistedUser->id);
    check(!$reloaded2->hasPermission('module.workforce'), "revokePermissionTo() removed module.workforce");
    check($reloaded2->hasPermission('module.kanban'), "revokePermissionTo() preserved module.kanban");

    // Sync permissions
    $reloaded2->syncPermissions(['tier.employee_desk', 'module.departments']);
    $reloaded3 = App\Models\User::find((string)$persistedUser->id);
    check($reloaded3->hasPermission('module.departments'), "syncPermissions() synchronized new permissions");
    check(!$reloaded3->hasPermission('module.kanban'), "syncPermissions() removed unsynced permissions");

    // Clean up
    $persistedUser->delete();
    check(!App\Models\User::find((string)$persistedUser->id), "Cleaned up test user from MongoDB");
} catch (\Throwable $e) {
    check(false, "MongoDB mutation lifecycle exception: " . $e->getMessage());
}

// 4. Gate::allows Integration Test
echo "\n--- 4. Laravel Gate Integration ---\n";
try {
    $gateUser = new App\Models\User([
        'name' => 'Gate User',
        'email' => 'gate_test@test.com',
        'role' => 'employee',
        'permissions' => ['module.kanban'],
    ]);

    check(Illuminate\Support\Facades\Gate::forUser($gateUser)->allows('module.kanban'), "Gate::allows('module.kanban') evaluates to true");
    check(!Illuminate\Support\Facades\Gate::forUser($gateUser)->allows('module.platform_settings'), "Gate::allows('module.platform_settings') evaluates to false");
    check(Illuminate\Support\Facades\Gate::forUser($superAdmin)->allows('any_ability'), "Gate::allows() evaluates to true for Super Admin");
} catch (\Throwable $e) {
    check(false, "Gate integration exception: " . $e->getMessage());
}

// 5. Middleware HTTP Simulation
echo "\n--- 5. Middleware Role & Permission Enforcement (HTTP) ---\n";
try {
    // 5A. Unauthenticated request to /admin -> 302
    $req = Illuminate\Http\Request::create('/admin', 'GET');
    $resp = $kernel->handle($req);
    check($resp->getStatusCode() === 302, "Guest access to /admin redirects to login (302)");

    // 5B. Super Admin access via CheckRole Middleware -> 200 OK
    $primaryAdmin = App\Models\User::where('email', 'haseebkhanuddin44@gmail.com')->first();
    $adminReq = Illuminate\Http\Request::create('/admin', 'GET');
    $adminReq->setUserResolver(fn() => $primaryAdmin);
    Illuminate\Support\Facades\Auth::login($primaryAdmin);
    
    $checkRole = new App\Http\Middleware\CheckRole();
    $adminResp = $checkRole->handle($adminReq, fn() => response('Admin Authorized', 200), 'super_admin');
    check($adminResp->getStatusCode() === 200, "Super Admin access to /admin allowed (200)");

    // 5C. Customer access to /admin -> 403 Forbidden
    $custUser = App\Models\User::where('role', 'customer')->first();
    if ($custUser) {
        $custReq = Illuminate\Http\Request::create('/admin', 'GET');
        $custReq->setUserResolver(fn() => $custUser);
        Illuminate\Support\Facades\Auth::login($custUser);
        
        try {
            $custResp = $checkRole->handle($custReq, fn() => response('OK', 200), 'super_admin');
            check($custResp->getStatusCode() === 403, "Customer access to /admin forbidden (403)");
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            check($e->getStatusCode() === 403, "Customer access to /admin forbidden (403 abort caught)");
        }
    } else {
        check(true, "Customer access check skipped (no customer)");
    }
} catch (\Throwable $e) {
    check(false, "Middleware simulation exception: " . $e->getMessage());
}

echo "\n=======================================================\n";
echo "SUMMARY: {$passCount} PASSED, {$failCount} FAILED\n";
echo "=======================================================\n";

exit($failCount > 0 ? 1 : 0);
