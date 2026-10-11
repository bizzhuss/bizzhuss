import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, Store, Package, CheckCircle2 } from 'lucide-react';

export default function OrderInvoice({ invoice = {} }) {
    const { vendor = {}, order = {}, shipping = {}, sub_order_number = '', items = [], subtotal = 0, platform_fee = 0, net_earnings = 0 } = invoice;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
            <Head title={`Packing Slip - ${sub_order_number} | Bizzhuss`} />

            {/* Print action controls (Hidden when printing) */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link href="/vendor/orders">
                    <Button variant="secondary" size="sm" icon={ArrowLeft}>
                        Back to Orders
                    </Button>
                </Link>
                <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
                    Print Packing Slip / Invoice
                </Button>
            </div>

            {/* Printable Sheet */}
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0">
                {/* Invoice Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden">
                            {vendor.logo ? (
                                <img src={vendor.logo} alt={vendor.shop_name} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-7 h-7" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">{vendor.shop_name || 'Merchant Shop'}</h1>
                            <p className="text-xs text-slate-500">Official Merchant Packing Slip</p>
                            {vendor.support_phone && (
                                <p className="text-xs text-slate-400 mt-0.5">Support: {vendor.support_phone}</p>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="font-mono text-xs font-bold text-brand-600 block">
                            {sub_order_number}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            Master: #{order.order_number}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">
                            Date: {formatDate(order.created_at)}
                        </span>
                    </div>
                </div>

                {/* Customer Shipping Address & Order Details */}
                <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Ship To Recipient:
                        </span>
                        <div className="font-bold text-slate-900 text-sm">{shipping.name || 'Customer'}</div>
                        <div className="text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                            {shipping.address || shipping.full_address || 'No address provided'}
                        </div>
                        {shipping.phone && (
                            <div className="text-slate-500 mt-1">Phone: {shipping.phone}</div>
                        )}
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Fulfillment Details:
                        </span>
                        <div className="font-semibold text-slate-800">
                            Payment: <span className="uppercase font-bold text-emerald-600">{order.payment_status || 'Paid'}</span>
                        </div>
                        <div className="text-slate-500 mt-1">
                            Carrier: {items[0]?.carrier || 'Standard Merchant Dispatch'}
                        </div>
                        {items[0]?.tracking_number && (
                            <div className="font-mono text-brand-600 font-bold mt-1">
                                Tracking: {items[0].tracking_number}
                            </div>
                        )}
                    </div>
                </div>

                {/* Itemized Table */}
                <div className="py-6">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="pb-3">Item / SKU</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Unit Price</th>
                                <th className="pb-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3.5">
                                        <div className="font-bold text-slate-900">{item.product ? item.product.title : 'Item'}</div>
                                        <div className="text-[11px] font-mono text-slate-400">SKU: {item.product ? item.product.sku : 'N/A'}</div>
                                    </td>
                                    <td className="py-3.5 text-center font-mono font-bold">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3.5 text-right font-mono">
                                        {formatCurrency(item.unit_price)}
                                    </td>
                                    <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                                        {formatCurrency(item.unit_price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Subtotals & Settlement */}
                <div className="border-t border-slate-200 pt-4 flex justify-end text-xs">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                            <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>Platform Transaction Fee ({vendor.commission_rate || 10}%):</span>
                            <span className="font-mono text-rose-600">-{formatCurrency(platform_fee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                            <span>Net Merchant Settlement:</span>
                            <span className="font-mono text-emerald-600">{formatCurrency(net_earnings)}</span>
                        </div>
                    </div>
                </div>

                {/* Return Policy Footer */}
                {vendor.return_policy && (
                    <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-slate-600 block mb-0.5">Return & Exchange Policy:</strong>
                        <p>{vendor.return_policy}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
