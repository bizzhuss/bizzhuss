import React from 'react';
import { Head } from '@inertiajs/react';

/**
 * Universal SEO Head Provider for Bizzhuss
 * Brand: Bizzhuss | Built for Buyers | Powered by Sellers
 * Canonical Domain: https://www.bizzhuss.com
 */
export default function SEOHead({ 
    title, 
    description, 
    image = 'https://www.bizzhuss.com/og-image.jpg', 
    url = 'https://www.bizzhuss.com',
    type = 'website',
    schemaData = null,
    noindex = false,
    keywords = 'bizzhuss, pakistan ecommerce, multi-vendor marketplace, online shopping pakistan, verified sellers, wholesale electronics'
}) {
    const fullTitle = title 
        ? `${title} | Bizzhuss - Built for Buyers | Powered by Sellers`
        : `Bizzhuss | Built for Buyers | Powered by Sellers`;

    const metaDesc = description || "Bizzhuss is Pakistan's premier multi-vendor e-commerce marketplace connecting verified local sellers with smart shoppers. Built for Buyers | Powered by Sellers.";

    // Ensure absolute image and canonical URL
    const canonicalUrl = url.startsWith('http') ? url : `https://www.bizzhuss.com${url.startsWith('/') ? '' : '/'}${url}`;
    const ogImage = image.startsWith('http') ? image : `https://www.bizzhuss.com${image.startsWith('/') ? '' : '/'}${image}`;

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDesc} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Robots Directive */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            )}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="Bizzhuss" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:locale" content="en_PK" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@bizzhuss" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={ogImage} />

            {/* Schema JSON-LD for Google Rich Results */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}
        </Head>
    );
}
