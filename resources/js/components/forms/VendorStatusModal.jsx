import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export function VendorStatusModal({ isOpen, onClose, vendor }) {
    if (!vendor) return null;

    const [status, setStatus] = useState(vendor.status || 'approved');
    const [commissionRate, setCommissionRate] = useState(vendor.commission_rate || '10.00');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post(
            '/admin/vendors/status',
            {
                vendor_id: vendor.id,
                status: status,
                commission_rate: commissionRate,
            },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    onClose();
                },
                onError: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Review Vendor: ${vendor.shop_name}`}
            description="Approve, reject, or adjust platform commission percentage."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1">
                    <p className="font-semibold text-slate-800">Vendor Information:</p>
                    <p className="text-slate-600">Contact: {vendor.contact_email || 'No email provided'}</p>
                    <p className="text-slate-600">Current Balance: {formatCurrency(vendor.balance)}</p>
                </div>

                <Select
                    label="Application Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="approved">Approved (Active Marketplace Merchant)</option>
                    <option value="pending">Pending Review (Hold Onboarding)</option>
                    <option value="rejected">Rejected (Deny Merchant Access)</option>
                    <option value="suspended">Suspended (Temporary Hold)</option>
                </Select>

                <Input
                    label="Platform Commission Fee (%)"
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" loading={submitting}>
                        Save Status
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
