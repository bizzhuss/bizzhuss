import React from 'react';
import { Head } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductForm } from '@/components/vendor/ProductForm';

export default function ProductEdit({ vendor = {}, product = {}, categories = [], allCategories = [] }) {
    return (
        <MainLayout>
            <Head title={`Edit Product: ${product.title || ''} - ${vendor.shop_name || 'Vendor Portal'} | Bizzhuss`} />
            <ProductForm
                vendor={vendor}
                initialData={product}
                categories={categories}
                allCategories={allCategories}
                isEdit={true}
            />
        </MainLayout>
    );
}
