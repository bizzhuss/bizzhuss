import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ProductFormModal({ isOpen, onClose, vendorId }) {
    const [form, setForm] = useState({
        vendor_id: vendorId,
        title: '',
        sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
        category: 'Enterprise Hardware',
        price: '',
        compare_price: '',
        stock: '25',
        description: '',
        status: 'active',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/vendor/products', form, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Catalog Product"
            description="List a new SKU under your vendor storefront."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Product Title"
                    placeholder="e.g., Ultra-Precision Hydraulic Valve"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="SKU Identifier"
                        required
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />

                    <Select
                        label="Category"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                        <option value="Industrial IoT">Industrial IoT</option>
                        <option value="Enterprise Hardware">Enterprise Hardware</option>
                        <option value="Sensors & Telemetry">Sensors & Telemetry</option>
                        <option value="Executive Office">Executive Office</option>
                        <option value="Heavy Tooling">Heavy Tooling</option>
                        <option value="Clean Energy">Clean Energy</option>
                    </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Input
                        label="Unit Price ($)"
                        type="number"
                        step="0.01"
                        placeholder="299.00"
                        required
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />

                    <Input
                        label="MSRP ($)"
                        type="number"
                        step="0.01"
                        placeholder="349.00"
                        value={form.compare_price}
                        onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                    />

                    <Input
                        label="Initial Stock"
                        type="number"
                        required
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                </div>

                <Textarea
                    label="Technical Specs & Description"
                    placeholder="Provide industrial specifications, compliance ratings, and packaging info..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" loading={submitting}>
                        Publish Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
