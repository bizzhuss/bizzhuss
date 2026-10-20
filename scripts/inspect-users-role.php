<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::all();
echo "Total Users: " . $users->count() . "\n";
foreach ($users as $u) {
    echo "ID: {$u->id} | Email: {$u->email} | Role: {$u->role} | Status: {$u->status} | Approval: {$u->approval_status} | Perms: " . json_encode($u->permissions) . "\n";
}
