import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
    ShoppingBag, 
    MapPin, 
    Tag, 
    User, 
    Store, 
    ArrowRight, 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    Copy, 
    Plus, 
    Trash2, 
    Edit2, 
    X, 
    AlertCircle, 
    Sparkles, 
    Building2,
    Calendar,
    ChevronRight,
    Lock,
    Camera,
    Upload
} from 'lucide-react';

export default function CustomerDashboard({ user = {}, orders = [], addresses = [], vouchers = [] }) {
    const { showNotification } = useApp();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'vouchers', 'profile'
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

    // Avatar Upload State
    const fileInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

    const handleAvatarFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image size exceeds 2MB limit. Please choose a smaller image.', 'error');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = () => {
        if (!avatarFile) return;

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        setIsUploadingAvatar(true);
        router.post('/customer/profile/avatar', formData, {
            onSuccess: () => {
                showNotification('Profile picture updated successfully!', 'success');
                setAvatarFile(null);
                setAvatarPreview(null);
            },
            onError: (errors) => {
                showNotification(errors.avatar || 'Failed to upload photo.', 'error');
            },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    const handleRemoveAvatar = () => {
        if (avatarPreview && !user?.avatar) {
            setAvatarFile(null);
            setAvatarPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsRemovingAvatar(true);
        router.post('/customer/profile/avatar/remove', {}, {
            onSuccess: () => {
                showNotification('Profile picture removed.', 'success');
                setAvatarFile(null);
                setAvatarPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onFinish: () => setIsRemovingAvatar(false),
        });
    };

    // Profile Settings Form
    const profileForm = useForm({
        name: user?.name || '',
        phone: user?.phone || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Upgrade to Vendor Form
    const upgradeForm = useForm({
        shop_name: `${user?.name || 'My'} Commercial Depot`,
        phone: user?.phone || '+1 (555) 019-8822',
        description: 'Certified supplier of industrial hardware, electronics, and precision equipment.',
        bank_name: 'JPMorgan Chase Commercial',
        account_number: '****4921',
        routing_number: '021000021',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.post('/customer/profile', {
            onSuccess: () => {
                showNotification('Profile updated successfully!', 'success');
                profileForm.reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const handleUpgradeSubmit = (e) => {
        e.preventDefault();
        upgradeForm.post('/customer/upgrade-vendor', {
            onSuccess: () => {
                setIsUpgradeModalOpen(false);
                showNotification('Vendor merchant store provisioned successfully!', 'success');
            },
        });
    };

    const handleCopyVoucher = (code) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code);
            showNotification(`Voucher code "${code}" copied to clipboard!`, 'success');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <Truck className="w-3 h-3" /> In Transit
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <X className="w-3 h-3" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Processing
                    </span>
                );
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Customer Account Center | Bizzhuss" />

            <div className="space-y-6 mb-12">
                {/* 1. Header Profile Banner */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
                                ) : user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.slice(0, 2).toUpperCase() || 'CU'
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        {user?.name || 'Customer Account'}
                                    </h1>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Verified Buyer
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {user?.email} • {user?.phone || 'No phone registered'}
                                </p>
                            </div>
                        </div>

                        {/* Upgrade CTA Button in Header */}
                        <button
                            type="button"
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <Store className="w-4 h-4" />
                            <span>Upgrade to Vendor Shop</span>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                        {[
                            { id: 'orders', label: 'Order History', icon: ShoppingBag, count: orders.length },
                            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, count: addresses.length },
                            { id: 'vouchers', label: 'Vouchers & Discounts', icon: Tag, count: vouchers.length },
                            { id: 'profile', label: 'Profile Settings', icon: User },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. "Become a Seller / Upgrade to Vendor" Prominent Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-8 shadow-lg">
                    <div className="relative z-10 max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                            <span>Zero Setup Fee • Instant Activation</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                            Expand Your Business with Bizzhuss Multi-Vendor Network
                        </h2>
                        <p className="text-xs text-amber-100 leading-relaxed">
                            Upgrade your current customer login to a certified merchant store. List certified equipment, receive split orders, and automate direct ACH/wire payouts without creating a second account.
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-transform hover:scale-102 flex items-center gap-2 cursor-pointer"
                            >
                                <span>Upgrade Account to Vendor Now</span>
                                <ArrowRight className="w-4 h-4 text-amber-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Tab Content Area */}

                {/* TAB 1: ORDER HISTORY */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">Past Orders & Active Shipments</h2>
                            <span className="text-xs text-slate-500">Showing {orders.length} orders</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
                                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-sm font-bold text-slate-800">No Orders Found Yet</h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Browse our marketplace catalog and place your first multi-vendor order.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const items = order.items || [];
                                    const firstItem = items[0];
                                    const deliveryStatus = firstItem?.delivery_status || 'processing';

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
                                        >
                                            {/* Order Header */}
                                            <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                                            Order Number
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900">
                                                            {order.order_number || `#BZH-00${order.id}`}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                                            Date Placed
                                                        </span>
                                                        <span className="text-slate-700 font-medium">
                                                            {order.created_at ? formatDate(order.created_at) : 'Sep 26, 2026'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                                            Total Amount
                                                        </span>
                                                        <span className="font-bold text-slate-900">
                                                            {formatCurrency(order.total_amount)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(deliveryStatus)}
                                                    <button
                                                        type="button"
                                                        onClick={() => setTrackingOrder({ ...order, deliveryStatus })}
                                                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                    >
                                                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>Track Order</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Items List in Order */}
                                            <div className="p-4 sm:p-5 divide-y divide-slate-100">
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                                <img
                                                                    src={item.product?.image || (Array.isArray(item.product?.images) && item.product?.images[0]) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200'}
                                                                    alt={item.product?.title || 'Product'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Link 
                                                                    href={`/product/${item.product?.slug || item.product?.id || ''}`}
                                                                    className="font-bold text-slate-900 hover:text-amber-600 line-clamp-1 transition-colors"
                                                                >
                                                                    {item.product?.title || item.product_name || 'Order Item'}
                                                                </Link>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                                    Vendor: <strong className="text-slate-600">{item.vendor?.shop_name || 'Verified Merchant'}</strong> • Qty: {item.quantity || 1}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            <span className="font-bold text-slate-900">
                                                                {formatCurrency(item.unit_price || 1249)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DELIVERY ADDRESSES */}
                {activeTab === 'addresses' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Saved Shipping & Consignee Addresses</h2>
                                <p className="text-xs text-slate-500">Carrier dispatch destinations for multi-vendor freight.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddAddressOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5 text-amber-400" />
                                <span>Add New Address</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    className={`bg-white rounded-3xl border p-5 space-y-3 relative shadow-xs ${
                                        addr.is_default ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold text-slate-900">{addr.title}</h3>
                                            {addr.is_default && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-600 space-y-1">
                                        <p className="font-semibold text-slate-900">{addr.recipient}</p>
                                        <p>{addr.street}</p>
                                        <p>{addr.city}, {addr.state} {addr.zip}</p>
                                        <p className="text-slate-400">{addr.country}</p>
                                        <p className="pt-1 font-mono text-[11px] text-slate-500">Phone: {addr.phone}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: VOUCHERS & DISCOUNTS */}
                {activeTab === 'vouchers' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Active Coupons & Discounts</h2>
                                <p className="text-xs text-slate-500">Apply these voucher codes during checkout for instant savings.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vouchers.map((vouch) => (
                                <div
                                    key={vouch.id}
                                    className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-xl font-black text-amber-600">
                                            {vouch.discount}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                            Active
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {vouch.description}
                                    </p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">Voucher Code:</span>
                                            <span className="font-mono font-bold text-xs text-slate-900">{vouch.code}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleCopyVoucher(vouch.code)}
                                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Copy className="w-3 h-3" />
                                            <span>Copy</span>
                                        </button>
                                    </div>

                                    <div className="text-[10px] text-slate-400">
                                        Expires: {vouch.valid_until} • Min spend: {formatCurrency(vouch.min_spend)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: PROFILE SETTINGS */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 max-w-2xl">
                        <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
                            Edit Profile & Security Credentials
                        </h2>

                        {/* Profile Picture Upload Section */}
                        <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-black text-3xl">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : user?.avatar ? (
                                        <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.slice(0, 2).toUpperCase() || 'CU'
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-md border-2 border-white cursor-pointer"
                                    title="Choose new photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">Profile Picture</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Upload a square JPG, PNG, or WebP photo (max 2MB). This photo will be displayed across your order logs and reviews.
                                </p>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarFileSelect}
                                />

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {avatarFile ? (
                                        <button
                                            type="button"
                                            onClick={handleAvatarUpload}
                                            disabled={isUploadingAvatar}
                                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>{isUploadingAvatar ? 'Uploading...' : 'Save New Photo'}</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Camera className="w-3.5 h-3.5 text-slate-600" />
                                            <span>Upload New Photo</span>
                                        </button>
                                    )}

                                    {(user?.avatar || avatarPreview) && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            disabled={isRemovingAvatar}
                                            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            Remove Photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4 pt-6 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                {profileForm.errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1">{profileForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                                <span className="text-[10px] text-slate-400">Email address cannot be changed directly.</span>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                <h3 className="font-bold text-slate-800 text-xs">Change Password (Optional)</h3>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={profileForm.data.current_password}
                                        onChange={(e) => profileForm.setData('current_password', e.target.value)}
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                    {profileForm.errors.current_password && (
                                        <p className="text-rose-500 text-[11px] mt-1">{profileForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={profileForm.data.password}
                                            onChange={(e) => profileForm.setData('password', e.target.value)}
                                            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={profileForm.data.password_confirmation}
                                            onChange={(e) => profileForm.setData('password_confirmation', e.target.value)}
                                            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {profileForm.processing ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* TRACK ORDER MODAL */}
            {trackingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Tracking Order {trackingOrder.order_number || `#BZH-00${trackingOrder.id}`}
                                </h3>
                                <p className="text-xs text-slate-500">Carrier: FedEx Freight SLA Priority (Tracking #FDX-99812401)</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTrackingOrder(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="space-y-6 pl-2">
                            {[
                                { title: 'Order Verified & Split', desc: 'Sub-orders routed to respective merchant warehouses.', done: true, time: 'Sep 26 - 10:14 AM' },
                                { title: 'Package Dispatched from Hub', desc: 'Transferred to Austin TX Regional Sort Facility.', done: true, time: 'Sep 26 - 02:40 PM' },
                                { title: 'Out for Courier Delivery', desc: 'Dock delivery scheduled with vehicle #TRK-8812.', done: trackingOrder.deliveryStatus === 'delivered' || trackingOrder.deliveryStatus === 'shipped', time: 'Sep 27 - 08:30 AM' },
                                { title: 'Final Consignee Receipt', desc: 'Signed confirmation at customer delivery address.', done: trackingOrder.deliveryStatus === 'delivered', time: 'Estimated by 04:00 PM' },
                            ].map((step, idx) => (
                                <div key={idx} className="relative flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                                        step.done ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <div className="flex-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-900">{step.title}</h4>
                                            <span className="text-[10px] text-slate-400">{step.time}</span>
                                        </div>
                                        <p className="text-slate-500 mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setTrackingOrder(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                            >
                                Close Tracking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPGRADE TO VENDOR MODAL */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Upgrade to Verified Marketplace Vendor
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Switch from Customer to Vendor with immediate portal access.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsUpgradeModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpgradeSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Official Merchant Shop Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={upgradeForm.data.shop_name}
                                    onChange={(e) => upgradeForm.setData('shop_name', e.target.value)}
                                    placeholder="e.g. Apex Industrial Supplies"
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                {upgradeForm.errors.shop_name && (
                                    <p className="text-rose-500 text-[11px] mt-1">{upgradeForm.errors.shop_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Merchant Contact Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={upgradeForm.data.phone}
                                    onChange={(e) => upgradeForm.setData('phone', e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Shop Description / Categories</label>
                                <textarea
                                    rows="2"
                                    value={upgradeForm.data.description}
                                    onChange={(e) => upgradeForm.setData('description', e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">
                                    Disbursement Banking Coordinates
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[11px] text-slate-500 mb-0.5">Bank Name</label>
                                        <input
                                            type="text"
                                            value={upgradeForm.data.bank_name}
                                            onChange={(e) => upgradeForm.setData('bank_name', e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-500 mb-0.5">Account Number</label>
                                        <input
                                            type="text"
                                            value={upgradeForm.data.account_number}
                                            onChange={(e) => upgradeForm.setData('account_number', e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-500 mb-0.5">Routing (ABA)</label>
                                        <input
                                            type="text"
                                            value={upgradeForm.data.routing_number}
                                            onChange={(e) => upgradeForm.setData('routing_number', e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                                <strong>Platform Terms:</strong> Upon submission, your role updates to <code>vendor</code> with immediate catalog listing privileges and a 10% platform fee on completed sub-orders.
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={upgradeForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {upgradeForm.processing ? 'Activating Store...' : 'Confirm Upgrade & Launch Portal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
