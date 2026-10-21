/**
 * Safe Product Image Resolver for Bizzhuss Storefront.
 * Extracts uploaded Cloudinary/Storage images from MongoDB documents.
 * Replaces hardcoded Unsplash placeholders with reliable product images or branded SVG fallback.
 *
 * @param {Object} item
 * @returns {string}
 */
export const getProductImage = (item) => {
    if (!item) return '/placeholder-product.svg';

    // 1. Direct image string fields
    if (typeof item.image === 'string' && item.image.trim() !== '') return item.image.trim();
    if (typeof item.featured_image === 'string' && item.featured_image.trim() !== '') return item.featured_image.trim();
    if (typeof item.thumbnail === 'string' && item.thumbnail.trim() !== '') return item.thumbnail.trim();

    // 2. Images array
    if (Array.isArray(item.images) && item.images.length > 0) {
        const first = item.images[0];
        if (typeof first === 'string' && first.trim() !== '') return first.trim();
        if (first && typeof first.url === 'string' && first.url.trim() !== '') return first.url.trim();
    }

    // 3. Stringified JSON images
    if (typeof item.images === 'string' && item.images.trim() !== '') {
        try {
            const parsed = JSON.parse(item.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                if (typeof first === 'string' && first.trim() !== '') return first.trim();
                if (first && typeof first.url === 'string' && first.url.trim() !== '') return first.url.trim();
            }
        } catch {
            if (item.images.startsWith('http') || item.images.startsWith('/storage/')) {
                return item.images.trim();
            }
        }
    }

    return '/placeholder-product.svg';
};

export default getProductImage;
