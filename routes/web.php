<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminVendorController;
use App\Http\Controllers\AdminWorkforceController;
use App\Http\Controllers\AdminTaskController;
use App\Http\Controllers\AdminSettingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorProductController;
use App\Http\Controllers\VendorOrderController;
use App\Http\Controllers\VendorCouponController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\MarketingCurationController;
use App\Http\Controllers\MarketingBannerController;
use App\Http\Controllers\MarketingCampaignController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Bizzhuss Enterprise Multi-Vendor & Workforce Platform Routes
|--------------------------------------------------------------------------
| Strict Role-Based Access Control (RBAC) Architecture
| Tier 1: Customer Storefront (Public) & Customer Account (/customer/*)
| Tier 2: Super Admin Dashboard (/admin/*) -> role:super_admin
| Tier 3: Vendor Portal (/vendor/*) -> role:vendor
| Tier 4: Employee Workforce Workspace (/employee/*) -> role:employee
| Informational: Customer Care, Bizzhuss Business, Platform Operations
|--------------------------------------------------------------------------
*/

// Tier 1A: Public Customer Storefront & E-Commerce Catalog (Guests allowed to VIEW only)
Route::get('/', [CustomerController::class, 'index'])->name('storefront');
Route::get('/storefront', [CustomerController::class, 'index'])->name('storefront.alias');
Route::get('/shop', [CustomerController::class, 'shop'])->name('shop');
Route::get('/product/{slug}', [CustomerController::class, 'productDetail'])->name('product.detail');
Route::get('/category/{slug}', [CustomerController::class, 'category'])->name('category.show');

// Tier 1A Protected: Authenticated-only Customer Actions
Route::middleware(['auth'])->group(function () {
    Route::get('/cart', [CustomerController::class, 'cart'])->name('cart');
    Route::get('/wishlist', [CustomerController::class, 'wishlist'])->name('wishlist');
    Route::get('/checkout', [CustomerController::class, 'checkoutPage'])->name('checkout.page');
    Route::post('/checkout', [CustomerController::class, 'checkout'])->name('checkout');
    Route::get('/checkout/{any}', [CustomerController::class, 'checkoutPage'])->where('any', '.*');
    Route::post('/product/{slug}/review', [CustomerController::class, 'submitReview'])->name('product.review.submit');
});

// Public Informational & Customer Care Suite
Route::get('/help', [PageController::class, 'helpCenter'])->name('help');
Route::get('/how-to-buy', [PageController::class, 'howToBuy'])->name('how-to-buy');
Route::get('/track-order', [PageController::class, 'trackOrder'])->name('track-order');
Route::get('/returns-refunds', [PageController::class, 'returnsRefunds'])->name('returns-refunds');
Route::get('/contact', [PageController::class, 'contactUs'])->name('contact');
Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');

// Bizzhuss Business Suite
Route::prefix('business')->name('business.')->group(function () {
    Route::get('/become-seller', [PageController::class, 'becomeSeller'])->name('become-seller');
    Route::get('/vendor-center', [PageController::class, 'vendorCenter'])->name('vendor-center');
    Route::get('/fees-payouts', [PageController::class, 'feeStructure'])->name('fees-payouts');
    Route::get('/enterprise', [PageController::class, 'enterpriseProcurement'])->name('enterprise');
    Route::post('/enterprise', [PageController::class, 'submitEnterprise'])->name('enterprise.submit');
    Route::get('/affiliate', [PageController::class, 'affiliateProgram'])->name('affiliate');
});

// Platform Operations & Legal Suite
Route::get('/operations/order-routing', [PageController::class, 'orderRouting'])->name('operations.order-routing');
Route::get('/terms', [PageController::class, 'privacyTerms'])->name('terms');
Route::get('/privacy', [PageController::class, 'privacyTerms'])->name('privacy');

// SEO & Search Engine Indexing Architecture
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
Route::get('/security', [PageController::class, 'complianceSecurity'])->name('security');
Route::get('/status', [PageController::class, 'systemStatus'])->name('status');
Route::get('/maintenance', fn () => \Inertia\Inertia::render('Maintenance'))->name('maintenance');

// Authentication System
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Universal Image Upload Route (Cloudinary / S3 / Local fallback)
Route::middleware(['auth'])->post('/upload/image', [UploadController::class, 'upload'])->name('upload.image');

// Tier 1B: Dedicated Customer Portal (Strictly role:customer)
Route::middleware(['auth', 'role:customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::post('/upgrade-vendor', [CustomerDashboardController::class, 'upgradeToVendor'])->name('upgrade.vendor');
    Route::post('/profile', [CustomerDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/avatar', [CustomerDashboardController::class, 'uploadAvatar'])->name('profile.avatar');
    Route::post('/profile/avatar/remove', [CustomerDashboardController::class, 'removeAvatar'])->name('profile.avatar.remove');
});

// Tier 2: Super Admin Command Center (Strictly role:super_admin)
Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    // 2.0 Command Center Dashboard
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard.alias');
    Route::get('/central-command', [AdminController::class, 'index'])->name('central-command');
    Route::post('/vendors/status', [AdminController::class, 'updateVendorStatus'])->name('vendors.status');
    Route::post('/tasks', [AdminController::class, 'createTask'])->name('tasks.create');

    // 2.1 Vendor Oversight & Growth Analytics
    Route::get('/vendors', [AdminVendorController::class, 'index'])->name('vendors.index');
    Route::post('/vendors/{vendor}/status', [AdminVendorController::class, 'updateStatus'])->name('vendors.updateStatus');
    Route::post('/vendors/{vendor}/commission', [AdminVendorController::class, 'updateCommission'])->name('vendors.updateCommission');
    Route::delete('/vendors/{vendor}', [AdminVendorController::class, 'destroy'])->name('vendors.destroy');

    // 2.2 Department & Workforce Hierarchy
    Route::get('/workforce/departments', [AdminWorkforceController::class, 'departments'])->name('workforce.departments');
    Route::post('/workforce/departments', [AdminWorkforceController::class, 'storeDepartment'])->name('workforce.departments.store');
    Route::put('/workforce/departments/{department}', [AdminWorkforceController::class, 'updateDepartment'])->name('workforce.departments.update');
    Route::delete('/workforce/departments/{department}', [AdminWorkforceController::class, 'destroyDepartment'])->name('workforce.departments.destroy');
    Route::post('/workforce/designations', [AdminWorkforceController::class, 'storeDesignation'])->name('workforce.designations.store');
    Route::delete('/workforce/designations/{designation}', [AdminWorkforceController::class, 'destroyDesignation'])->name('workforce.designations.destroy');

    // 2.3 Employee Directory & Onboarding
    Route::get('/workforce/employees', [AdminWorkforceController::class, 'employees'])->name('workforce.employees');
    Route::post('/workforce/employees', [AdminWorkforceController::class, 'storeEmployee'])->name('workforce.employees.store');
    Route::put('/workforce/employees/{employee}', [AdminWorkforceController::class, 'updateEmployee'])->name('workforce.employees.update');
    Route::post('/workforce/employees/{employee}/permissions', [AdminWorkforceController::class, 'updatePermissions'])->name('workforce.employees.permissions');
    Route::delete('/workforce/employees/{employee}', [AdminWorkforceController::class, 'destroyEmployee'])->name('workforce.employees.destroy');
    Route::post('/workforce/staff', [\App\Http\Controllers\StaffController::class, 'store'])->name('workforce.staff.store');
    Route::put('/workforce/staff/{user}', [\App\Http\Controllers\StaffController::class, 'update'])->name('workforce.staff.update');

    // 2.4 Task Delegation, Kanban & Performance
    Route::get('/workforce/tasks', [AdminTaskController::class, 'index'])->name('workforce.tasks');
    Route::post('/workforce/tasks', [AdminTaskController::class, 'store'])->name('workforce.tasks.store');
    Route::patch('/workforce/tasks/{task}/status', [AdminTaskController::class, 'updateStatus'])->name('workforce.tasks.updateStatus');
    Route::patch('/workforce/tasks/{task}/progress', [AdminTaskController::class, 'updateProgress'])->name('workforce.tasks.updateProgress');
    Route::delete('/workforce/tasks/{task}', [AdminTaskController::class, 'destroy'])->name('workforce.tasks.destroy');

    // 2.5 Global Platform Controls & Settings
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings');
    Route::post('/settings/general', [AdminSettingController::class, 'updateGeneralSettings'])->name('settings.general');
    Route::post('/settings/maintenance-mode', [\App\Http\Controllers\Admin\MaintenanceController::class, 'update'])->name('settings.maintenance');
    Route::post('/settings/maintenance', [\App\Http\Controllers\Admin\MaintenanceController::class, 'update'])->name('settings.maintenance.update');
    Route::post('/settings/categories', [AdminSettingController::class, 'storeCategory'])->name('settings.categories.store');
    Route::put('/settings/categories/{category}', [AdminSettingController::class, 'updateCategory'])->name('settings.categories.update');
    Route::post('/settings/categories/{category}/toggle-featured', [AdminSettingController::class, 'toggleVerifiedFeatured'])->name('settings.categories.toggle-featured');
    Route::delete('/settings/categories/{category}', [AdminSettingController::class, 'destroyCategory'])->name('settings.categories.destroy');
    Route::post('/settings/payouts/{payout}/approve', [AdminSettingController::class, 'approvePayout'])->name('settings.payouts.approve');
    Route::post('/settings/payouts/{payout}/reject', [AdminSettingController::class, 'rejectPayout'])->name('settings.payouts.reject');

    // 2.6 Storefront Merchandising & Product Curation
    Route::get('/marketing/curation', [\App\Http\Controllers\AdminCurationController::class, 'index'])->name('curation.index');
    Route::get('/curation', [\App\Http\Controllers\AdminCurationController::class, 'index'])->name('curation.alias');
    Route::post('/marketing/curation/{product}/featured', [\App\Http\Controllers\AdminCurationController::class, 'toggleFeatured'])->name('curation.toggleFeatured');
    Route::post('/marketing/curation/{product}/special-sale', [\App\Http\Controllers\AdminCurationController::class, 'toggleSpecialSale'])->name('curation.toggleSpecialSale');
    Route::patch('/marketing/curation/{product}/order', [\App\Http\Controllers\AdminCurationController::class, 'updateOrder'])->name('curation.updateOrder');
    Route::patch('/marketing/curation/{product}/sold-count', [\App\Http\Controllers\AdminCurationController::class, 'updateSoldCount'])->name('curation.updateSoldCount');
    Route::post('/marketing/curation/{product}/tier', [\App\Http\Controllers\AdminCurationController::class, 'updateTier'])->name('curation.updateTier');
    Route::post('/marketing/curation/bulk', [\App\Http\Controllers\AdminCurationController::class, 'bulkAction'])->name('curation.bulkAction');
});

// Tier 3: Vendor Merchant Portal (Strictly role:vendor)
Route::middleware(['auth', 'role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
    // 3.0 Dashboard Central Command
    Route::get('/', [VendorController::class, 'index'])->name('portal');
    Route::get('/dashboard', [VendorController::class, 'index'])->name('dashboard');

    // 3.1 Comprehensive Product Catalog Management
    Route::get('/products', [VendorProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [VendorProductController::class, 'create'])->name('products.create');
    Route::post('/products', [VendorProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [VendorProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [VendorProductController::class, 'update'])->name('products.update');
    Route::post('/products/{product}/duplicate', [VendorProductController::class, 'duplicate'])->name('products.duplicate');
    Route::delete('/products/{product}', [VendorProductController::class, 'destroy'])->name('products.destroy');

    // 3.2 Multi-Vendor Order Management & Fulfillment
    Route::get('/orders', [VendorOrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/fulfillment', [VendorOrderController::class, 'updateFulfillment'])->name('orders.fulfillment');
    Route::get('/orders/{order}/invoice', [VendorOrderController::class, 'invoice'])->name('orders.invoice');

    // 3.3 Discounts & Coupon Engine
    Route::get('/coupons', [VendorCouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [VendorCouponController::class, 'store'])->name('coupons.store');
    Route::patch('/coupons/{coupon}/toggle', [VendorCouponController::class, 'toggle'])->name('coupons.toggle');
    Route::delete('/coupons/{coupon}', [VendorCouponController::class, 'destroy'])->name('coupons.destroy');

    // 3.4 Shop Profile & Financial Wallet
    Route::get('/settings', [VendorController::class, 'settings'])->name('settings');
    Route::post('/settings', [VendorController::class, 'updateSettings'])->name('settings.update');
    Route::get('/wallet', [VendorController::class, 'wallet'])->name('wallet');
    Route::post('/payouts', [VendorController::class, 'requestPayout'])->name('payouts.request');
});

// Tier 4: Employee Workforce Workspace (role:employee,staff)
Route::middleware(['auth', 'role:employee,staff'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/', [EmployeeController::class, 'index'])->name('workspace');
    Route::get('/dashboard', [EmployeeController::class, 'index'])->name('dashboard.alias');
    Route::get('/desk', [EmployeeController::class, 'index'])->name('desk');
    Route::patch('/tasks/{task}/status', [EmployeeController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::post('/tasks', [EmployeeController::class, 'storeTask'])->name('tasks.store');
});

// Tier 5: Marketing & Merchandising Portal (role:marketing_manager,super_admin)
Route::middleware(['auth', 'role:marketing_manager,super_admin'])->prefix('marketing')->name('marketing.')->group(function () {
    Route::get('/', [MarketingController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [MarketingController::class, 'index'])->name('dashboard.alias');
    Route::get('/hub', [MarketingController::class, 'index'])->name('hub');

    // Curation Hub
    Route::get('/curation', [MarketingCurationController::class, 'index'])->name('curation.index');
    Route::post('/curation/{product}/tier', [MarketingCurationController::class, 'updateTier'])->name('curation.updateTier');
    Route::post('/curation/bulk', [MarketingCurationController::class, 'bulkAction'])->name('curation.bulk');

    // Banner Management
    Route::get('/banners', [MarketingBannerController::class, 'index'])->name('banners.index');
    Route::post('/banners', [MarketingBannerController::class, 'store'])->name('banners.store');
    Route::post('/banners/{banner}', [MarketingBannerController::class, 'update'])->name('banners.update');
    Route::patch('/banners/{banner}/toggle', [MarketingBannerController::class, 'toggle'])->name('banners.toggle');
    Route::delete('/banners/{banner}', [MarketingBannerController::class, 'destroy'])->name('banners.destroy');
    Route::post('/banners/reorder', [MarketingBannerController::class, 'reorder'])->name('banners.reorder');

    // Campaign Scheduler
    Route::get('/campaigns', [MarketingCampaignController::class, 'index'])->name('campaigns.index');
    Route::post('/campaigns', [MarketingCampaignController::class, 'store'])->name('campaigns.store');
    Route::put('/campaigns/{campaign}', [MarketingCampaignController::class, 'update'])->name('campaigns.update');
    Route::patch('/campaigns/{campaign}/toggle', [MarketingCampaignController::class, 'toggle'])->name('campaigns.toggle');
    Route::delete('/campaigns/{campaign}', [MarketingCampaignController::class, 'destroy'])->name('campaigns.destroy');
});
