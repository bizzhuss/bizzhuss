import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VendorHeader } from '@/components/vendor/VendorHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { 
    Store, 
    Save, 
    Image as ImageIcon, 
    Phone, 
    ShieldCheck, 
    CreditCard, 
    ExternalLink, 
    CheckCircle2, 
    Sparkles,
    Building2,
    FileText
} from 'lucide-react';

export default function VendorSettings({ vendor = {} }) {
    const safeVendor = vendor || {};
    const bankDetails = safeVendor.bank_details || {};

    const [form, setForm] = useState({
        shop_name: safeVendor.shop_name || '',
        description: safeVendor.description || '',
        support_phone: safeVendor.support_phone || '',
        return_policy: safeVendor.return_policy || '',
        logo: safeVendor.logo || '',
        banner: safeVendor.banner || '',
        bank_details: {
            bank_name: bankDetails.bank_name || '',
            account_title: bankDetails.account_title || '',
            account_number: bankDetails.account_number || '',
            branch_code: bankDetails.branch_code || '',
            easypaisa_number: bankDetails.easypaisa_number || '',
            jazzcash_number: bankDetails.jazzcash_number || '',
        },
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        router.post('/vendor/settings', form, {
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    return (
        <MainLayout>
            <Head title={`Store Profile & Settings - ${safeVendor.shop_name || 'My Store'} | Bizzhuss`} />

            <VendorHeader
                vendor={safeVendor}
                title="Storefront Branding & Configuration"
                subtitle="Customize your customer-facing merchant shopfront, return policies, and financial disbursement credentials."
            />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Live Storefront Header Preview */}
                <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                    <div 
                        className="h-36 sm:h-48 w-full bg-gradient-to-r from-slate-900 to-indigo-900 relative bg-cover bg-center"
                        style={{ backgroundImage: form.banner ? `url(${form.banner})` : undefined }}
                    >
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 backdrop-blur-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-brand-600" />
                            Live Storefront Preview
                        </span>
                    </div>

                    <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-slate-200 shrink-0">
                                <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-400">
                                    {form.logo ? (
                                        <img src={form.logo} alt={form.shop_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className="pb-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-slate-900">{form.shop_name || 'My Merchant Shop'}</h2>
                                    <StatusBadge status={safeVendor.status || 'active'} />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {form.description || 'Welcome to our verified merchant catalog.'}
                                </p>
                            </div>
                        </div>

                        <div className="pb-1">
                            <Button type="submit" variant="primary" icon={Save} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Profile Changes'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left 7 Columns: Branding & Policies */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Shop Identity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Store className="w-4 h-4 text-brand-600" />
                                    <span>Storefront Identity</span>
                                </CardTitle>
                                <CardDescription>
                                    Public details displayed across all your product listing pages.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Shop Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.shop_name}
                                        onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Shop Logo Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.logo}
                                        onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                        placeholder="https://images.unsplash.com/... or hosted square logo URL"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Hero Banner Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.banner}
                                        onChange={(e) => setForm({ ...form, banner: e.target.value })}
                                        placeholder="https://images.unsplash.com/... or hosted wide banner URL"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Storefront Bio / Merchant About Us
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Tell customers about your brand ethos, authentic sourcing, and specialty items..."
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Support & Return Policy */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Customer Support & Return Policy</span>
                                </CardTitle>
                                <CardDescription>
                                    Guidelines printed on your packing slips and order receipts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Customer Support Hotline</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.support_phone}
                                        onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
                                        placeholder="+1 (800) 555-0199 or WhatsApp helpline"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Return & Refund Policy</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={form.return_policy}
                                        onChange={(e) => setForm({ ...form, return_policy: e.target.value })}
                                        placeholder="e.g. 7-day hassle-free return for unboxed goods. Defective electronics replaced within 14 days."
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 5 Columns: Bank & Payout Accounts */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-indigo-600" />
                                    <span>Settlement Accounts</span>
                                </CardTitle>
                                <CardDescription>
                                    Verified bank accounts or mobile wallets used for processing payout disbursements.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Commercial Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.bank_details.bank_name}
                                        onChange={(e) => setForm({
                                            ...form,
                                            bank_details: { ...form.bank_details, bank_name: e.target.value }
                                        })}
                                        placeholder="e.g. Chase Bank, HBL, Meezan Bank"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Account Holder / Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.bank_details.account_title}
                                        onChange={(e) => setForm({
                                            ...form,
                                            bank_details: { ...form.bank_details, account_title: e.target.value }
                                        })}
                                        placeholder="Legal Company or Personal Name"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Account Number / IBAN
                                    </label>
                                    <input
                                        type="text"
                                        value={form.bank_details.account_number}
                                        onChange={(e) => setForm({
                                            ...form,
                                            bank_details: { ...form.bank_details, account_number: e.target.value }
                                        })}
                                        placeholder="PK36MEZN0001234567890123"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                                        Mobile Wallets (Alternative)
                                    </span>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                EasyPaisa Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                value={form.bank_details.easypaisa_number}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    bank_details: { ...form.bank_details, easypaisa_number: e.target.value }
                                                })}
                                                placeholder="0300-1234567"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                JazzCash Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                value={form.bank_details.jazzcash_number}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    bank_details: { ...form.bank_details, jazzcash_number: e.target.value }
                                                })}
                                                placeholder="0301-1234567"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full mt-4"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save All Settings'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </MainLayout>
    );
}
