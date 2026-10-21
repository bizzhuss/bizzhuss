<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic Google-compliant XML sitemap.
     */
    public function sitemap(): Response
    {
        $domain = 'https://www.bizzhuss.com';

        // 1. Static high-priority pages
        $staticPages = [
            ['url' => "{$domain}/", 'changefreq' => 'daily', 'priority' => '1.0'],
            ['url' => "{$domain}/shop", 'changefreq' => 'daily', 'priority' => '0.9'],
            ['url' => "{$domain}/help", 'changefreq' => 'monthly', 'priority' => '0.5'],
            ['url' => "{$domain}/order/track", 'changefreq' => 'monthly', 'priority' => '0.5'],
            ['url' => "{$domain}/terms", 'changefreq' => 'yearly', 'priority' => '0.3'],
            ['url' => "{$domain}/privacy", 'changefreq' => 'yearly', 'priority' => '0.3'],
        ];

        // 2. Dynamic Categories
        $categories = Category::all(['slug', 'updated_at']);
        $categoryUrls = [];
        foreach ($categories as $cat) {
            if (!empty($cat->slug)) {
                $categoryUrls[] = [
                    'url' => "{$domain}/shop?category={$cat->slug}",
                    'lastmod' => $cat->updated_at ? $cat->updated_at->toAtomString() : now()->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            }
        }

        // 3. Dynamic Published Products
        $products = Product::where('status', 'published')->get(['slug', 'updated_at']);
        $productUrls = [];
        foreach ($products as $prod) {
            if (!empty($prod->slug)) {
                $productUrls[] = [
                    'url' => "{$domain}/product/{$prod->slug}",
                    'lastmod' => $prod->updated_at ? $prod->updated_at->toAtomString() : now()->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            }
        }

        $allUrls = array_merge($staticPages, $categoryUrls, $productUrls);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($allUrls as $entry) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>' . htmlspecialchars($entry['url'], ENT_XML1, 'UTF-8') . "</loc>\n";
            if (!empty($entry['lastmod'])) {
                $xml .= '    <lastmod>' . $entry['lastmod'] . "</lastmod>\n";
            }
            if (!empty($entry['changefreq'])) {
                $xml .= '    <changefreq>' . $entry['changefreq'] . "</changefreq>\n";
            }
            if (!empty($entry['priority'])) {
                $xml .= '    <priority>' . $entry['priority'] . "</priority>\n";
            }
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Generate dynamic robots.txt file.
     */
    public function robots(): Response
    {
        $content = "User-agent: *\n";
        $content .= "Disallow: /admin/\n";
        $content .= "Disallow: /employee/\n";
        $content .= "Disallow: /vendor/\n";
        $content .= "Disallow: /marketing/\n";
        $content .= "Disallow: /customer/\n";
        $content .= "Disallow: /cart\n";
        $content .= "Disallow: /checkout\n";
        $content .= "Disallow: /checkout/\n";
        $content .= "Disallow: /wishlist\n";
        $content .= "Allow: /\n\n";
        $content .= "Sitemap: https://www.bizzhuss.com/sitemap.xml\n";

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }
}
