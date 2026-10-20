import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useApp, AppProvider } from '@/context/AppContext';
import { ApplicationLogo } from '@/components/ApplicationLogo';
import { CartDrawer } from './CartDrawer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { 
    Search, 
    ShoppingCart, 
    Heart, 
    User, 
    ChevronDown, 
    ChevronRight,
    Menu, 
    Sparkles, 
    Store, 
    HelpCircle, 
    Truck, 
    ShieldCheck, 
    Headphones, 
    RotateCcw,
    X,
    CheckCircle2,
    AlertCircle,
    Layers,
    LogOut,
    Package,
    Shield,
    Flame,
    Zap,
    Tag,
    Briefcase,
    Cpu,
    Wrench,
} from 'lucide-react';

const ICON_MAP = {
    Cpu,
    Layers,
    Wrench,
    Briefcase,
    Zap,
    Package,
    Shield,
    Flame,
    Tag,
};

function getCategoryIcon(iconName) {
    if (!iconName) return Package;
    if (typeof iconName !== 'string') return iconName;
    return ICON_MAP[iconName] || Package;
}

function StorefrontLayoutInner({ children }) {
    const { auth, flash, categories: globalCategories = [] } = usePage().props;
    const { cartCount, totalItems, wishlistCount, setIsCartOpen, notification, showNotification, clearNotification } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
    const departmentsRef = useRef(null);

    // Close departments dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (departmentsRef.current && !departmentsRef.current.contains(event.target)) {
                setIsDepartmentsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const user = auth?.user;
    const userAvatarRaw = user?.avatar || user?.profile_photo_url || user?.profile_picture;
    const userAvatarUrl = userAvatarRaw
        ? (userAvatarRaw.startsWith('http') || userAvatarRaw.startsWith('/storage/')
            ? userAvatarRaw
            : `/storage/${userAvatarRaw}`)
        : null;
    const userInitials = user?.name
        ? user.name.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
        : 'U';

    useEffect(() => {
        if (flash?.success) {
            showNotification(flash.success, 'success');
        }
        if (flash?.error) {
            showNotification(flash.error, 'error');
        }
    }, [flash]);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/shop', {
            search: searchQuery || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }, { preserveState: true });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const allCategories = Array.isArray(globalCategories) ? globalCategories : [];
    const rootCategories = allCategories.filter((c) => !c.parent_id);
    const navCategories = rootCategories.length > 0 ? rootCategories : allCategories;

    const departments = [
        { id: 'flash-deals', name: 'Flash Deals', href: '/#flash-deals', icon: Flame, highlight: true },
        ...navCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            href: `/category/${cat.slug}`,
            icon: getCategoryIcon(cat.icon),
            highlight: false,
        })),
    ];

    const desktopDepartments = [
        departments[0], // Flash Deals
        ...departments.slice(1, 7), // First 6 categories
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
            {/* Top Multi-Tier Utility / Dev Switcher Bar */}
            <header className="bg-slate-950 text-white text-xs border-b border-slate-800 sticky top-0 z-40">
                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between py-1.5 gap-2">
                        {/* Platform Role Switcher - Strictly for Super Admin Only */}
                        {auth?.user && auth.user.role === 'super_admin' ? (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[11px] border border-brand-500/30">
                                    <Sparkles className="w-3 h-3 text-brand-400" />
                                    <span>Platform Role Switcher:</span>
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <Link href="/" className="px-2 py-0.5 rounded font-semibold bg-emerald-600 text-white shadow-xs">
                                        Storefront
                                    </Link>
                                    <Link href="/admin" className="px-2 py-0.5 rounded font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                                        Super Admin
                                    </Link>
                                    <Link href="/vendor" className="px-2 py-0.5 rounded font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                                        Vendor Portal
                                    </Link>
                                    <Link href="/employee" className="px-2 py-0.5 rounded font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                                        Workforce
                                    </Link>
                                    <Link href="/marketing" className="px-2 py-0.5 rounded font-semibold text-slate-300 hover:text-white hover:bg-slate-800">
                                        Marketing Hub
                                    </Link>
                                </div>
                            </div>
                        ) : auth?.user?.role === 'vendor' ? (
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/vendor" 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 hover:text-white hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-[11px] transition-colors"
                                >
                                    <Store className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Back to Vendor Portal</span>
                                </Link>
                                <span className="text-slate-500 text-[11px] hidden md:inline">• Managed Merchant Workspace</span>
                            </div>
                        ) : auth?.user?.role === 'employee' ? (
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/employee" 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 hover:text-white hover:bg-sky-500/30 border border-sky-500/30 font-semibold text-[11px] transition-colors"
                                >
                                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Back to Workforce Desk</span>
                                </Link>
                                <span className="text-slate-500 text-[11px] hidden md:inline">• Enterprise Operations Desk</span>
                            </div>
                        ) : auth?.user?.role === 'marketing_manager' ? (
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/marketing" 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-500/30 border border-purple-500/30 font-semibold text-[11px] transition-colors"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Back to Marketing Hub</span>
                                </Link>
                                <span className="text-slate-500 text-[11px] hidden md:inline">• Storefront Merchandising</span>
                            </div>
                        ) : auth?.user?.role === 'customer' ? (
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Welcome, {auth.user.name.split(' ')[0]}</span>
                                </span>
                                <span className="hidden md:inline text-slate-500">• Verified Customer Account</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                <span className="hidden sm:inline">Welcome to Bizzhuss Multi-Vendor Marketplace</span>
                            </div>
                        )}

                        {/* Top Utility Links */}
                        <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                            {auth?.user?.role === 'vendor' ? (
                                <Link href="/vendor" className="hover:text-white flex items-center gap-1 text-amber-400 font-medium">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Merchant Dashboard</span>
                                </Link>
                            ) : auth?.user?.role === 'customer' ? (
                                <Link href="/customer/dashboard" className="hover:text-white flex items-center gap-1 text-amber-400 font-medium">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Become a Seller</span>
                                </Link>
                            ) : !auth?.user ? (
                                <Link href="/register?role=vendor" className="hover:text-white flex items-center gap-1 text-amber-400 font-medium">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Become a Seller</span>
                                </Link>
                            ) : null}
                            <span className="text-slate-600">|</span>
                            <Link href="/help" className="hover:text-white flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Help & Support</span>
                            </Link>
                            <span className="text-slate-600">|</span>
                            <div className="flex items-center gap-1 text-emerald-400">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Free Express Delivery over Rs. 50,000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Amazon/Daraz Style Header */}
                <div className="bg-slate-900 border-t border-slate-800 py-2.5 sm:py-3.5 px-3 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
                        {/* Hamburger toggle & Brand Logo */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                aria-label="Open mobile navigation menu"
                            >
                                <Menu className="w-5 h-5 text-brand-400" />
                            </button>
                            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
                                <ApplicationLogo asLink={false} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                                <div>
                                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                                        Bizz<span className="text-brand-400">huss</span>
                                    </span>
                                    <span className="hidden sm:block text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                                        Multi-Vendor Marketplace
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Central Full-Width Search Bar with Category Dropdown */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:flex items-center">
                            <div className="flex w-full rounded-xl overflow-hidden shadow-inner bg-white border-2 border-brand-500 focus-within:ring-2 focus-within:ring-brand-400 transition-all">
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-slate-100 text-slate-700 text-xs px-3 py-2.5 border-r border-slate-200 outline-none font-medium cursor-pointer max-w-[150px] shrink-0"
                                >
                                    <option value="all">All Departments</option>
                                    {allCategories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search 100,000+ certified products, equipment, SKUs, or vendors..."
                                    className="flex-1 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                                />

                                <button
                                    type="submit"
                                    className="bg-brand-500 hover:bg-brand-600 text-white px-6 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        {/* Right Utility: Portal Shortcut, Wishlist, User Account, Cart */}
                        <div className="hidden md:flex items-center gap-3 sm:gap-4 shrink-0">
                            {/* Direct Portal Link for Staff & Merchants */}
                            {auth?.user?.role === 'vendor' && (
                                <Link 
                                    href="/vendor" 
                                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors shadow-xs"
                                >
                                    <Store className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Vendor Portal</span>
                                </Link>
                            )}
                            {auth?.user?.role === 'employee' && (
                                <Link 
                                    href="/employee" 
                                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition-colors shadow-xs"
                                >
                                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Workforce Desk</span>
                                </Link>
                            )}
                            {auth?.user?.role === 'super_admin' && (
                                <Link 
                                    href="/admin" 
                                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 font-bold text-xs border border-brand-500/30 transition-colors shadow-xs"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                                    <span>Admin Center</span>
                                </Link>
                            )}

                            {/* Wishlist */}
                            <Link 
                                href={auth?.user ? "/wishlist" : "/login"} 
                                onClick={(e) => {
                                    if (!auth?.user) {
                                        e.preventDefault();
                                        router.visit(`/login?intended=${encodeURIComponent('/wishlist')}&message=${encodeURIComponent('Please sign in to view your wishlist.')}`);
                                    }
                                }}
                                className="hidden sm:flex flex-col items-center text-slate-300 hover:text-white transition-colors relative"
                            >
                                <div className="relative">
                                    <Heart className="w-5 h-5" />
                                    {auth?.user && wishlistCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1 rounded-full min-w-4 text-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] mt-0.5">Wishlist</span>
                            </Link>

                            {/* User Authentication / Profile Dropdown */}
                            {auth?.user ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors text-left cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-white/20 overflow-hidden shrink-0">
                                            {userAvatarUrl ? (
                                                <img src={userAvatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                userInitials
                                            )}
                                        </div>
                                        <div className="hidden lg:block">
                                            <div className="text-[11px] text-slate-400 leading-tight">Hello,</div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1">
                                                <span>{auth.user.name.split(' ')[0]}</span>
                                                <ChevronDown className="w-3 h-3 text-slate-400" />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-xs font-bold text-slate-900 truncate">{auth.user.name}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>
                                                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                                                    Role: {auth.user.role.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="py-1 text-xs">
                                                {auth.user.role === 'customer' && (
                                                    <>
                                                        <Link href="/customer/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-semibold text-emerald-600">
                                                            <User className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>My Account</span>
                                                        </Link>
                                                        <Link href="/customer/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>My Orders</span>
                                                        </Link>
                                                        <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                                                            <span>Saved Wishlist</span>
                                                        </Link>
                                                        <Link href="/cart" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                                                            <span>My Shopping Cart</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {auth.user.role === 'vendor' && (
                                                    <>
                                                        <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-semibold text-amber-700">
                                                            <Store className="w-3.5 h-3.5 text-amber-600" />
                                                            <span>Vendor Portal</span>
                                                        </Link>
                                                        <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Store Settings</span>
                                                        </Link>
                                                        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Browse Catalog</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {(auth.user.role === 'employee' || auth.user.role === 'staff' || (auth.user.permissions && auth.user.permissions.includes('tier.employee_desk'))) && (
                                                    <>
                                                        <Link href="/employee" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-semibold text-sky-700">
                                                            <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                                                            <span>Workforce Desk</span>
                                                        </Link>
                                                        <Link href="/employee" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>My Tasks</span>
                                                        </Link>
                                                        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Browse Catalog</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {auth.user.role === 'marketing_manager' && (
                                                    <>
                                                        <Link href="/marketing" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-semibold text-purple-700">
                                                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                                            <span>Marketing Hub</span>
                                                        </Link>
                                                        <Link href="/marketing/curation" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Storefront Curation</span>
                                                        </Link>
                                                        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Browse Catalog</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {(auth.user.role === 'super_admin' || auth.user.permissions?.includes('*')) && (
                                                    <>
                                                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-semibold text-brand-700">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                                                            <span>Admin Control Center</span>
                                                        </Link>
                                                        <Link href="/vendor" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Store className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Vendor Portal</span>
                                                        </Link>
                                                        <Link href="/employee" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Workforce Desk</span>
                                                        </Link>
                                                        <Link href="/marketing" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Marketing Hub</span>
                                                        </Link>
                                                        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Browse Catalog</span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            <div className="pt-1 border-t border-slate-100">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                                                >
                                                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors shadow-xs"
                                    >
                                        <User className="w-3.5 h-3.5 text-brand-400" />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Cart Icon & Live Counter */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!auth?.user) {
                                        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
                                        router.visit(`/login?intended=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please sign in to access your shopping cart.')}`);
                                        return;
                                    }
                                    setIsCartOpen(true);
                                }}
                                className="flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition-transform hover:scale-102 cursor-pointer shrink-0"
                            >
                                <div className="relative">
                                    <ShoppingCart className="w-5 h-5" />
                                    {auth?.user && totalItems > 0 && (
                                        <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center ring-2 ring-slate-900">
                                            {totalItems}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:inline">Cart</span>
                            </button>
                        </div>

                        {/* Mobile Top Row Right: User Avatar or Wishlist */}
                        <div className="md:hidden flex items-center gap-1.5 shrink-0">
                            {auth?.user ? (
                                <Link
                                    href={
                                        auth.user.role === 'customer' ? '/customer/dashboard' :
                                        auth.user.role === 'vendor' ? '/vendor' :
                                        (auth.user.role === 'employee' || auth.user.role === 'staff' || (auth.user.permissions && auth.user.permissions.includes('tier.employee_desk'))) ? '/employee' :
                                        auth.user.role === 'marketing_manager' ? '/marketing/dashboard' :
                                        '/admin'
                                    }
                                    className="p-1 rounded-xl hover:bg-slate-800 transition-colors flex items-center"
                                    aria-label="My Account"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-white/20 overflow-hidden shrink-0 shadow-xs">
                                        {userAvatarUrl ? (
                                            <img src={userAvatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    href="/wishlist"
                                    onClick={(e) => {
                                        if (!auth?.user) {
                                            e.preventDefault();
                                            router.visit(`/login?intended=${encodeURIComponent('/wishlist')}&message=${encodeURIComponent('Please sign in to view your wishlist.')}`);
                                        }
                                    }}
                                    className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative flex items-center justify-center"
                                    aria-label="Wishlist"
                                >
                                    <Heart className="w-5 h-5 text-slate-300" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Streamlined Mobile Search Bar */}
                    <div className="mt-2.5 md:hidden">
                        <form onSubmit={handleSearch} className="relative flex items-center w-full">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products, brands, or categories..."
                                className="w-full h-10 pl-10 pr-9 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Mobile Horizontal Quick Navigation Category Pills */}
                <nav className="md:hidden bg-slate-950 border-t border-slate-800/80 px-3 py-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                        <Link
                            href="/shop?tier=special_flash_sale"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/25 transition-colors shrink-0"
                        >
                            <span>🔥 Flash Deals</span>
                        </Link>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-medium hover:bg-slate-700 transition-colors shrink-0"
                        >
                            <span>📦 All Products</span>
                        </Link>
                        <Link
                            href="/shop?tier=flagship_featured"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/25 transition-colors shrink-0"
                        >
                            <span>⚡ Featured</span>
                        </Link>
                        <Link
                            href="/shop?tier=smart_value_budget"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium hover:bg-emerald-500/25 transition-colors shrink-0"
                        >
                            <span>🏷️ Budget Picks</span>
                        </Link>
                        {departments.filter(d => !d.highlight).map((dept) => (
                            <Link
                                key={`mobile-pill-${dept.id || dept.name}`}
                                href={dept.href}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                            >
                                <span>{dept.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Horizontal Mega-Menu Category Navigation Bar (Desktop) */}
                <nav className="hidden md:block bg-slate-800 text-slate-200 border-t border-slate-700/80 px-4 sm:px-6 lg:px-8 relative z-30">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-xs py-2 gap-6">
                        <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap min-w-0">
                            <Link
                                href="/shop"
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition-colors shadow-xs shrink-0"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>All Products / Shop</span>
                            </Link>

                            {/* All Departments Toggle Button & Dropdown Menu */}
                            <div className="relative shrink-0" ref={departmentsRef}>
                                <button 
                                    type="button"
                                    onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                                        isDepartmentsOpen
                                            ? 'bg-brand-600 text-white shadow-xs'
                                            : 'text-white hover:text-brand-300 hover:bg-slate-700/60'
                                    }`}
                                >
                                    <Menu className="w-4 h-4 text-brand-400" />
                                    <span>All Departments</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDepartmentsOpen ? 'rotate-180 text-brand-300' : 'text-slate-400'}`} />
                                </button>

                                {/* Floating Dropdown Menu */}
                                {isDepartmentsOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {/* Dropdown Header */}
                                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-brand-500" />
                                                All Departments
                                            </span>
                                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                                                {navCategories.length} Categories
                                            </span>
                                        </div>

                                        {/* Categories List */}
                                        <div className="max-h-96 overflow-y-auto py-1 divide-y divide-slate-50">
                                            {navCategories.length > 0 ? (
                                                navCategories.map((cat) => {
                                                    const Icon = getCategoryIcon(cat.icon);
                                                    const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
                                                    return (
                                                        <div key={cat.id || cat.slug} className="group">
                                                            <Link
                                                                href={`/category/${cat.slug}`}
                                                                onClick={() => setIsDepartmentsOpen(false)}
                                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 hover:text-brand-600"
                                                            >
                                                                <div className="flex items-center gap-3 truncate">
                                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center transition-colors shrink-0">
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <span className="block font-bold truncate">{cat.name}</span>
                                                                        {cat.products_count !== undefined && (
                                                                            <span className="text-[10px] text-slate-400 font-normal">
                                                                                {cat.products_count} {cat.products_count === 1 ? 'Product' : 'Products'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                                            </Link>
                                                            {hasSubs && (
                                                                <div className="pl-14 pr-4 pb-2 flex flex-wrap gap-1">
                                                                    {cat.subcategories.map((sub) => (
                                                                        <Link
                                                                            key={sub.id || sub.slug}
                                                                            href={`/category/${sub.slug}`}
                                                                            onClick={() => setIsDepartmentsOpen(false)}
                                                                            className="inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 rounded transition-colors"
                                                                        >
                                                                            {sub.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-4 text-center text-xs text-slate-400">
                                                    No departments found
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropdown Footer */}
                                        <div className="pt-2 px-3 border-t border-slate-100 mt-1">
                                            <Link
                                                href="/shop"
                                                onClick={() => setIsDepartmentsOpen(false)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 font-bold text-xs transition-colors border border-slate-200/80 hover:border-brand-200"
                                            >
                                                <Tag className="w-3.5 h-3.5 text-brand-500" />
                                                <span>View Full Catalog</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Department Quick Links */}
                            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
                                {desktopDepartments.map((dept) => {
                                    const Icon = dept.icon;
                                    return (
                                        <Link
                                            key={dept.id || dept.name}
                                            href={dept.href}
                                            className={`flex items-center gap-1.5 transition-colors font-medium shrink-0 ${
                                                dept.highlight 
                                                    ? 'text-accent-orange font-bold hover:brightness-110' 
                                                    : 'text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            {Icon && <Icon className={`w-3.5 h-3.5 ${dept.highlight ? 'text-accent-orange' : 'text-brand-400'}`} />}
                                            <span>{dept.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hidden xl:flex items-center gap-4 text-slate-400 text-[11px] shrink-0 whitespace-nowrap">
                            <span className="flex items-center gap-1 text-slate-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                                100% Genuine Certified Brands
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-300">
                                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                                7 Days Return Policy
                            </span>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Slide-out Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    {/* Backdrop Overlay */}
                    <div 
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Panel Container */}
                    <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs h-screen h-[100dvh] bg-[#0d1527] text-white shadow-2xl flex flex-col z-[80] border-r border-slate-800 animate-in slide-in-from-left duration-200">
                        {/* Top Drawer Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                                <ApplicationLogo asLink={false} className="w-8 h-8 rounded-lg shadow-sm" />
                                <span className="text-lg font-black text-white">
                                    Bizz<span className="text-brand-400">huss</span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                aria-label="Close mobile menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* User Profile / Auth Action */}
                        <div className="p-4 bg-slate-800/60 border-b border-slate-800 shrink-0">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    {userAvatarUrl ? (
                                        <img 
                                            src={userAvatarUrl} 
                                            alt={user.name} 
                                            className="h-12 w-12 rounded-full object-cover border-2 border-brand ring-2 ring-white/10 shadow-md shrink-0"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shrink-0 border border-white/20">
                                            {userInitials}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white text-xs truncate">{user.name}</p>
                                        <span className="inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                            {user.role ? user.role.replace('_', ' ') : 'User'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Welcome to Bizzhuss</p>
                                            <p className="text-[11px] text-slate-400">Sign in to track orders & saved items</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-center py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-center py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Menu Navigation Items */}
                        <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto text-xs">
                            {/* Department Categories */}
                            <div>
                                <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Shop Departments</h5>
                                <div className="space-y-1">
                                    <Link
                                        href="/shop"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white font-medium"
                                    >
                                        <Tag className="w-4 h-4 text-brand-400" />
                                        <span>All Products / Catalog</span>
                                    </Link>
                                    {departments.map((dept) => {
                                        const Icon = dept.icon;
                                        return (
                                            <Link
                                                key={dept.id || dept.name}
                                                href={dept.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors ${
                                                    dept.highlight
                                                        ? 'text-accent-orange font-bold bg-accent-orange/10'
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                }`}
                                            >
                                                {Icon && <Icon className="w-4 h-4 text-brand-400" />}
                                                <span>{dept.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Account / Portal Links */}
                            {auth?.user && (
                                <div className="pt-2 border-t border-slate-800">
                                    <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Workspace & Portals</h5>
                                    <div className="space-y-1">
                                        {auth.user.role === 'customer' && (
                                            <>
                                                <Link
                                                    href="/customer/dashboard"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white"
                                                >
                                                    <Package className="w-4 h-4 text-emerald-400" />
                                                    <span>My Orders</span>
                                                </Link>
                                                <Link
                                                    href="/wishlist"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white"
                                                >
                                                    <Heart className="w-4 h-4 text-rose-400" />
                                                    <span>Saved Wishlist</span>
                                                </Link>
                                            </>
                                        )}
                                        {auth.user.role === 'vendor' && (
                                            <Link
                                                href="/vendor"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:bg-slate-800 font-semibold"
                                            >
                                                <Store className="w-4 h-4 text-amber-400" />
                                                <span>Vendor Portal</span>
                                            </Link>
                                        )}
                                        {auth.user.role === 'marketing_manager' && (
                                            <Link
                                                href="/marketing/dashboard"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-pink-300 hover:bg-slate-800 font-semibold"
                                            >
                                                <Sparkles className="w-4 h-4 text-pink-400" />
                                                <span>Marketing Hub</span>
                                            </Link>
                                        )}
                                        {auth.user.role === 'employee' && (
                                            <Link
                                                href="/employee"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sky-300 hover:bg-slate-800 font-semibold"
                                            >
                                                <Briefcase className="w-4 h-4 text-sky-400" />
                                                <span>Workforce Desk</span>
                                            </Link>
                                        )}
                                        {auth.user.role === 'super_admin' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-300 hover:bg-slate-800 font-semibold"
                                            >
                                                <ShieldCheck className="w-4 h-4 text-brand-400" />
                                                <span>Admin Control Center</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Merchant & Support */}
                            <div className="pt-2 border-t border-slate-800">
                                <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Merchant & Support</h5>
                                <div className="space-y-1">
                                    <Link
                                        href="/register?role=vendor"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-400 hover:bg-slate-800 font-medium"
                                    >
                                        <Store className="w-4 h-4" />
                                        <span>Become a Seller</span>
                                    </Link>
                                    <Link
                                        href="/help"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        <span>Help & Support</span>
                                    </Link>
                                    <Link
                                        href="/track-order"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                                    >
                                        <Truck className="w-4 h-4" />
                                        <span>Track Your Order</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer / Currency & Logout */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3 shrink-0 pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                            {auth?.user && (
                                <div className="pb-1 border-b border-slate-800/80">
                                    <Link 
                                        href="/logout" 
                                        method="post" 
                                        as="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>Sign Out</span>
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Official Currency:</span>
                                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    PKR (Rs.)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5">
                    <div
                        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border ${
                            notification.type === 'error'
                                ? 'bg-rose-950 text-rose-100 border-rose-800'
                                : 'bg-slate-900 text-white border-brand-500/40 ring-1 ring-brand-500/30'
                        }`}
                    >
                        {notification.type === 'error' ? (
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                            <p className="font-bold">{notification.type === 'error' ? 'Notice' : 'Item Added!'}</p>
                            <p className="mt-0.5 text-slate-300 leading-relaxed">{notification.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={clearNotification}
                            className="text-slate-400 hover:text-white cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
                {children}
            </main>

            {/* Global Slide-over Cart Drawer */}
            <CartDrawer />

            {/* E-Commerce Marketplace Footer (Amazon / Daraz style) */}
            <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
                {/* Trust Highlights Bar */}
                <div className="border-b border-slate-800 bg-slate-950 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Nationwide Dispatch</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Automated split carrier freight tracking</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-teal-400/10 text-teal-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Verified Merchants</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Audited compliance & genuine products</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center shrink-0">
                                <RotateCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Safe & Easy Returns</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Hassle-free 7-day buyer guarantee</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">24/7 Priority Support</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Dedicated customer care assistance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Columns */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 space-y-3">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <ApplicationLogo asLink={false} className="w-9 h-9 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                            <span className="text-xl font-black text-white">
                                Bizz<span className="text-brand-400">huss</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                            Bizzhuss is the premier multi-vendor e-commerce marketplace and enterprise workforce platform connecting verified manufacturers, direct suppliers, and modern buyers worldwide.
                        </p>
                        
                        {/* Official Contact & Social Media Strip */}
                        <div className="pt-1 flex flex-wrap items-center gap-3">
                            <a
                                href="https://wa.me/923357895884"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-all border border-emerald-500/20 shadow-xs"
                                title="WhatsApp: +92 335 7895884"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/share/1C2sHrcVQM/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition-all border border-blue-500/20 shadow-xs"
                                title="Facebook: Bizzhuss"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/bizzhuss/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-gradient-to-tr hover:from-amber-600 hover:to-rose-600 text-rose-400 hover:text-white flex items-center justify-center transition-all border border-rose-500/20 shadow-xs"
                                title="Instagram: @bizzhuss"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <span className="text-[11px] text-slate-400 font-semibold ml-1">
                                +92 335 7895884
                            </span>
                        </div>

                        <div className="pt-2 flex items-center gap-3 text-slate-300">
                            <span className="text-[11px] font-semibold text-slate-400">Payment Gateways:</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-white">Visa</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-white">Mastercard</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-white">COD</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-white">Bank Wire</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Customer Care</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/help" className="hover:text-amber-400 transition-colors">Help Center & FAQ</Link></li>
                            <li><Link href="/how-to-buy" className="hover:text-amber-400 transition-colors">How to Buy Guide</Link></li>
                            <li><Link href="/track-order" className="hover:text-amber-400 transition-colors">Track Your Order</Link></li>
                            <li><Link href="/returns-refunds" className="hover:text-amber-400 transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Support</Link></li>
                            <li><a href="https://wa.me/923357895884" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors">WhatsApp Concierge</a></li>
                            <li><a href="mailto:bizzhuss@gmail.com" className="hover:text-amber-400 transition-colors">bizzhuss@gmail.com</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Bizzhuss Business</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/business/become-seller" className="hover:text-amber-400 text-amber-400 font-semibold transition-colors">Become a Seller</Link></li>
                            <li><Link href="/business/vendor-center" className="hover:text-amber-400 transition-colors">Vendor Center</Link></li>
                            <li><Link href="/business/fees-payouts" className="hover:text-amber-400 transition-colors">Fee Structure & Payouts</Link></li>
                            <li><Link href="/business/enterprise" className="hover:text-amber-400 transition-colors">Enterprise Procurement</Link></li>
                            <li><Link href="/business/affiliate" className="hover:text-amber-400 transition-colors">Affiliate Program</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Platform Operations</h4>
                        <ul className="space-y-2 text-xs">
                            {auth?.user?.role === 'super_admin' ? (
                                <>
                                    <li><Link href="/admin" className="hover:text-amber-400 font-semibold text-brand-400 transition-colors">Admin Control Center</Link></li>
                                    <li><Link href="/employee" className="hover:text-amber-400 font-semibold text-sky-400 transition-colors">Employee Workspace</Link></li>
                                    <li><Link href="/vendor" className="hover:text-amber-400 font-semibold text-amber-400 transition-colors">Vendor Portal</Link></li>
                                </>
                            ) : null}
                            <li><Link href="/operations/order-routing" className="hover:text-amber-400 transition-colors">Order Routing Service</Link></li>
                            <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Privacy & Terms</Link></li>
                            <li><Link href="/security" className="hover:text-amber-400 transition-colors">Compliance & Security</Link></li>
                            <li><Link href="/status" className="hover:text-amber-400 transition-colors">System Status</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-500">
                    <p>© 2026 Bizzhuss Multi-Vendor Marketplace Inc. Modeled for high conversion and enterprise scale.</p>
                </div>
            </footer>

            {/* Fixed Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
        </div>
    );
}

export function StorefrontLayout({ children }) {
    return (
        <StorefrontLayoutInner>
            {children}
        </StorefrontLayoutInner>
    );
}
export default StorefrontLayout;
