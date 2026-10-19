import React from 'react';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/lib/utils';

export default function ProductGrid({ products = [] }) {
    // Strictly read products from Inertia props, never use mock fallback
    const items = Array.isArray(products) ? products : (products?.data || []);

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>No products available in the catalog.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <Link href={`/product/${product.slug || product.id}`}>
                        <img 
                            src={Array.isArray(product.images) ? product.images[0] : (product.image || '/images/placeholder.png')} 
                            alt={product.title} 
                            className="w-full h-48 object-cover rounded-xl mb-3"
                        />
                        <h4 className="font-bold text-slate-900 truncate">{product.title}</h4>
                        <p className="text-brand-600 font-extrabold mt-1">{formatCurrency(product.price)}</p>
                    </Link>
                </div>
            ))}
        </div>
    );
}
