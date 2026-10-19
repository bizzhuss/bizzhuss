<?php

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$uri = $_ENV['MONGODB_URI'];
echo "Testing PHP MongoDB Manager with Atlas...\n";

try {
    $manager = new MongoDB\Driver\Manager($uri);
    $command = new MongoDB\Driver\Command(['ping' => 1]);
    $cursor = $manager->executeCommand('bizzhuss', $command);
    $response = current($cursor->toArray());
    echo "✅ Native PHP MongoDB Atlas Ping SUCCESS: " . json_encode($response) . PHP_EOL;

    // Query a user
    $query = new MongoDB\Driver\Query(['email' => 'admin@bizzhuss.com']);
    $cursor = $manager->executeQuery('bizzhuss.users', $query);
    $users = $cursor->toArray();
    echo "✅ Native PHP MongoDB Query User Count: " . count($users) . PHP_EOL;
    if (count($users) > 0) {
        echo "   User Name: " . $users[0]->name . " (" . $users[0]->role . ")\n";
    }
} catch (\Throwable $e) {
    echo "❌ PHP MongoDB Error: " . $e->getMessage() . PHP_EOL;
}
