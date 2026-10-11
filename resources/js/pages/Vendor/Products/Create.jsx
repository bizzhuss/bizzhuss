import React from 'react';
import { Head } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductForm } from '@/components/vendor/ProductForm';

export default function ProductCreate({ vendor = {}, categories = [], allCategories = [] }) {
    return (
        <MainLayout>
            <Head title={`Add New Product - ${vendor.shop_name || 'Vendor Portal'} | Bizzhuss`} />
            <ProductForm
                vendor={vendor}
                categories={categories}
                allCategories={allCategories}
                isEdit={false}
            />
        </MainLayout>
    );
}
