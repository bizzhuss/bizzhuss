<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

echo "--- Testing Validation Rules with MongoDB ---\n";

// 1. Test unique:users,email
$vUniqueExisting = Validator::make(
    ['email' => 'admin@bizzhuss.com'],
    ['email' => 'unique:users,email']
);
echo "1. unique:users,email on existing email: " . ($vUniqueExisting->fails() ? "PASSED (correctly detected non-unique)" : "FAILED (allowed duplicate)") . "\n";

$vUniqueNew = Validator::make(
    ['email' => 'completely_new_' . time() . '@example.com'],
    ['email' => 'unique:users,email']
);
echo "2. unique:users,email on new email: " . ($vUniqueNew->passes() ? "PASSED (allowed unique)" : "FAILED: " . json_encode($vUniqueNew->errors()->all())) . "\n";

// 2. Test exists on category
$cat = Category::first();
if ($cat) {
    echo "Found Category: name={$cat->name}, _id={$cat->_id}, id={$cat->id}\n";
    
    $vExistsId = Validator::make(
        ['category_id' => (string) $cat->id],
        ['category_id' => 'exists:categories,id']
    );
    echo "3. exists:categories,id: " . ($vExistsId->passes() ? "PASSED" : "FAILED: " . json_encode($vExistsId->errors()->all())) . "\n";

    $vExistsUnderscoreId = Validator::make(
        ['category_id' => (string) $cat->id],
        ['category_id' => 'exists:categories,_id']
    );
    echo "4. exists:categories,_id: " . ($vExistsUnderscoreId->passes() ? "PASSED" : "FAILED: " . json_encode($vExistsUnderscoreId->errors()->all())) . "\n";
} else {
    echo "No categories found in MongoDB.\n";
}

echo "Validation test completed.\n";
