<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
config(['app.debug' => true]);

$req = Illuminate\Http\Request::create('/admin', 'GET');
$resp = $kernel->handle($req);
echo "STATUS: " . $resp->getStatusCode() . "\n";
if (preg_match('/data-page="([^"]+)"/', $resp->getContent(), $matches)) {
    echo "PAGE DATA:\n" . html_entity_decode($matches[1]) . "\n";
} else {
    echo "CONTENT:\n" . substr($resp->getContent(), 0, 500) . "\n";
}
