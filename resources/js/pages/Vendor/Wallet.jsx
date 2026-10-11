import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    Wallet, 
    DollarSign, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    TrendingUp, 
    CreditCard, 
    Building2, 
    AlertCircle, 
    FileText,
    Percent
} from 'lucide-react';

export default function VendorWallet({ 
    vendor = {}, 
    walletMetrics = {}, 
    payouts = [] 
}) {
    const safeVendor = vendor || {};
    const bankDetails = safeVendor.bank_details || {};

    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('100');
    const [payoutMethod, setPayoutMethod] = useState('bank_wire');
    const [accountDetails, setAccountDetails] = useState(
        bankDetails.account_number 
            ? `${bankDetails.bank_name || 'Bank'} - ${bankDetails.account_title || ''} (${bankDetails.account_number})`
            : ''
    );
    const [submittingPayout, setSubmittingPayout] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const availableBalance = walletMetrics.available_balance || 0;

    const handleRequestPayout = (e) => {
        e.preventDefault();
        setSubmittingPayout(true);
        setErrorMessage('');

        router.post('/vendor/payouts', {
            amount: payoutAmount,
            payment_method: payoutMethod,
            account_details: accountDetails,
        }, {
            onSuccess: () => {
                setSubmittingPayout(false);
                setIsPayoutModalOpen(false);
            },
            onError: (err) => {
                setSubmittingPayout(false);
                setErrorMessage(err.amount || err.error || 'Failed to submit payout request.');
            },
        });
    };

    return (
        <MainLayout>
            <Head title={`Merchant Wallet & Disbursements - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            <VendorHeader
                vendor={safeVendor}
                title="Financial Ledger & Merchant Wallet"
                subtitle="Track platform sales settlements, pending clearance balances, and initiate bank wire disbursements."
                actions={
                    <Button
                        variant="primary"
                        icon={DollarSign}
                        onClick={() => setIsPayoutModalOpen(true)}
                        disabled={availableBalance < 50}
                    >
                        Request Payout
                    </Button>
                }
            />

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Available for Withdrawal"
                    value={formatCurrency(availableBalance)}
                    subtitle="Ready for disbursement"
                    icon={Wallet}
                    color="brand"
                />
                <StatCard
                    title="Pending Clearance"
                    value={formatCurrency(walletMetrics.pending_clearance || 0)}
                    subtitle="In-transit fulfillment"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Total Disbursed"
                    value={formatCurrency(walletMetrics.total_withdrawn || 0)}
                    subtitle="Successfully withdrawn"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Platform Commission Paid"
                    value={formatCurrency(walletMetrics.platform_fee_paid || 0)}
                    subtitle={`${safeVendor.commission_rate || 10}% retained fees`}
                    icon={Percent}
                    color="sky"
                />
            </div>

            {/* Financial Overview & Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Payout Disbursements History (8 Columns) */}
                <div className="lg:col-span-8">
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand-600" />
                                    <span>Disbursement Requests Ledger</span>
                                </CardTitle>
                                <CardDescription>
                                    History of merchant withdrawal requests and clearance statuses.
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="xs"
                                icon={DollarSign}
                                onClick={() => setIsPayoutModalOpen(true)}
                                disabled={availableBalance < 50}
                            >
                                New Request
                            </Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Reference ID</th>
                                        <th className="px-4 py-3.5">Amount</th>
                                        <th className="px-4 py-3.5">Disbursement Method</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Requested Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {payouts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                                <p className="font-semibold text-slate-700 text-sm">No payout requests recorded</p>
                                                <p className="text-xs text-slate-400 mt-1">Once you fulfill orders, your available balance can be withdrawn here.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        payouts.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                                    {payout.transaction_reference || `PO-${payout.id}`}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-bold text-emerald-600 text-sm">
                                                    {formatCurrency(payout.amount)}
                                                </td>
                                                <td className="px-4 py-4 capitalize text-slate-700 font-medium">
                                                    {payout.payment_method.replace('_', ' ')}
                                                    {payout.notes && (
                                                        <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                                                            {payout.notes}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={payout.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500">
                                                    {formatDate(payout.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Settlement Profile & Summary (4 Columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                <span>Default Payout Destination</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Bank Wire Account
                                </span>
                                <div className="font-bold text-slate-900">
                                    {bankDetails.bank_name || 'No bank name set'}
                                </div>
                                <div className="text-slate-600 mt-0.5">
                                    Title: {bankDetails.account_title || 'N/A'}
                                </div>
                                <div className="font-mono text-slate-500 mt-1">
                                    Account: {bankDetails.account_number || 'Configure in settings'}
                                </div>
                            </div>

                            {(bankDetails.easypaisa_number || bankDetails.jazzcash_number) && (
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Mobile Wallets
                                    </span>
                                    {bankDetails.easypaisa_number && (
                                        <div className="text-slate-700">
                                            EasyPaisa: <span className="font-mono font-bold">{bankDetails.easypaisa_number}</span>
                                        </div>
                                    )}
                                    {bankDetails.jazzcash_number && (
                                        <div className="text-slate-700 mt-0.5">
                                            JazzCash: <span className="font-mono font-bold">{bankDetails.jazzcash_number}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2">
                                <a
                                    href="/vendor/settings"
                                    className="block w-full py-2 text-center text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                                >
                                    Update Bank Credentials →
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span>Disbursement Schedule</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600 space-y-2 leading-relaxed">
                            <p>
                                • Payout requests are audited and approved by platform finance administrators within <strong>24–48 business hours</strong>.
                            </p>
                            <p>
                                • A minimum threshold of <strong>Rs. 5,000</strong> is required to trigger a disbursement.
                            </p>
                            <p>
                                • Standard platform commission of <strong>{safeVendor.commission_rate || 10}%</strong> is automatically deducted at order placement.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Request Payout Modal */}
            {isPayoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Request Disbursement</h3>
                                    <p className="text-xs text-slate-400">Withdraw cleared net earnings.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPayoutModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleRequestPayout} className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-xs">
                                <span className="font-semibold text-emerald-900">Available Balance:</span>
                                <span className="font-mono font-black text-emerald-700 text-sm">
                                    {formatCurrency(availableBalance)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Withdrawal Amount (PKR / Rs.) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="50"
                                    max={availableBalance}
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">Minimum payout amount: Rs. 5,000</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Disbursement Method
                                </label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="bank_wire">Commercial Bank Account / IBAN</option>
                                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                                    <option value="jazzcash">JazzCash Mobile Account</option>
                                    <option value="paypal">PayPal Electronic Wire</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Beneficiary Account Details
                                </label>
                                <textarea
                                    rows={3}
                                    value={accountDetails}
                                    onChange={(e) => setAccountDetails(e.target.value)}
                                    placeholder="Account Title, Bank Name, IBAN / Account Number, or Mobile Number"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setIsPayoutModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={submittingPayout || availableBalance < 50}
                                >
                                    {submittingPayout ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
