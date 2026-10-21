/**
 * Official Bizzhuss SEO Constants & Structured Schema Generators
 * Brand Identity: Built for Buyers | Powered by Sellers
 */

export const SEO_CONSTANTS = {
    BRAND_NAME: 'Bizzhuss',
    TAGLINE: 'Built for Buyers | Powered by Sellers',
    CANONICAL_DOMAIN: 'https://www.bizzhuss.com',
    DEFAULT_DESCRIPTION: "Bizzhuss is Pakistan's premier multi-vendor e-commerce marketplace connecting verified local sellers with smart shoppers. Built for Buyers | Powered by Sellers.",
    DEFAULT_OG_IMAGE: 'https://www.bizzhuss.com/og-image.jpg',
    LOGO_URL: 'https://www.bizzhuss.com/images/bizzhuss-logo.png',
    SUPPORT_EMAIL: 'bizzhuss@gmail.com',
    SUPPORT_PHONE: '+92 335 7895884',
    SOCIAL_LINKS: [
        'https://www.instagram.com/bizzhuss/',
        'https://www.facebook.com/share/1C2sHrcVQM/',
    ],
};

/**
 * Format page title with official brand suffix
 */
export function buildTitle(pageTitle) {
    if (!pageTitle) {
        return `${SEO_CONSTANTS.BRAND_NAME} | ${SEO_CONSTANTS.TAGLINE}`;
    }
    return `${pageTitle} | ${SEO_CONSTANTS.BRAND_NAME} - ${SEO_CONSTANTS.TAGLINE}`;
}

/**
 * Build canonical absolute URL
 */
export function buildCanonicalUrl(path = '') {
    if (!path || path === '/') {
        return SEO_CONSTANTS.CANONICAL_DOMAIN;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SEO_CONSTANTS.CANONICAL_DOMAIN}${cleanPath}`;
}

/**
 * Organization Schema for Homepage & Global Footer
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SEO_CONSTANTS.BRAND_NAME,
        url: SEO_CONSTANTS.CANONICAL_DOMAIN,
        logo: SEO_CONSTANTS.LOGO_URL,
        slogan: SEO_CONSTANTS.TAGLINE,
        description: SEO_CONSTANTS.DEFAULT_DESCRIPTION,
        email: SEO_CONSTANTS.SUPPORT_EMAIL,
        telephone: SEO_CONSTANTS.SUPPORT_PHONE,
        sameAs: SEO_CONSTANTS.SOCIAL_LINKS,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: SEO_CONSTANTS.SUPPORT_PHONE,
                contactType: 'customer support',
                availableLanguage: ['English', 'Urdu'],
                areaServed: 'PK',
            },
        ],
    };
}

/**
 * WebSite Schema with Google Sitelinks SearchBox
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SEO_CONSTANTS.BRAND_NAME,
        alternateName: ['Bizzhuss Pakistan', 'Bizzhuss Marketplace'],
        url: SEO_CONSTANTS.CANONICAL_DOMAIN,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SEO_CONSTANTS.CANONICAL_DOMAIN}/shop?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Google Rich Results Product Schema
 */
export function generateProductSchema(product, primaryImageUrl = null) {
    if (!product) return null;

    const title = product.title || product.name || 'Bizzhuss Product';
    const price = Number(product.price || 0);
    const sku = product.sku || `SKU-${product.id}`;
    const productUrl = buildCanonicalUrl(`/product/${product.slug || product.id}`);
    const isAvailable = (product.stock_quantity ?? product.stock ?? 1) > 0;

    let image = primaryImageUrl || product.image || product.featured_image || product.thumbnail;
    if (!image && Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images[0];
        image = typeof first === 'string' ? first : first?.url;
    }
    if (!image || image === '/placeholder-product.svg') {
        image = SEO_CONSTANTS.DEFAULT_OG_IMAGE;
    } else if (image.startsWith('/')) {
        image = `${SEO_CONSTANTS.CANONICAL_DOMAIN}${image}`;
    }

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        image: [image],
        description: product.description ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 300) : SEO_CONSTANTS.DEFAULT_DESCRIPTION,
        sku: sku,
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'PKR',
            price: price.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            itemCondition: 'https://schema.org/NewCondition',
            availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: product.vendor?.shop_name || SEO_CONSTANTS.BRAND_NAME,
            },
        },
    };

    if (product.brand) {
        schema.brand = {
            '@type': 'Brand',
            name: product.brand,
        };
    }

    return schema;
}

/**
 * BreadcrumbList Schema
 * @param {Array<{ name: string, url: string }>} crumbs
 */
export function generateBreadcrumbSchema(crumbs = []) {
    if (!Array.isArray(crumbs) || crumbs.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url.startsWith('http') ? crumb.url : buildCanonicalUrl(crumb.url),
        })),
    };
}
