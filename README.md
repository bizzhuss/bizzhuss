# Bizzhuss
### Enterprise Multi-Vendor E-Commerce & Workforce Management Platform

Bizzhuss is a modern, modular enterprise platform built from the ground up utilizing **Laravel 11**, **Inertia.js**, **React 19**, and **Tailwind CSS 3.4**. It unifies multi-tier B2B/B2C marketplace transactions, automated multi-vendor order routing, commission ledger reconciliation, and cross-departmental workforce task management into a single cohesive architecture.

---

## 🏗️ 4-Tier Architecture Overview

Bizzhuss features a persistent top navigation bar allowing seamless, instant switching across all 4 operational tiers:

```
+-----------------------------------------------------------------------------------------+
|                  BIZZHUSS ENTERPRISE PERSISTENT PREVIEW SWITCHER BAR                    |
|  [Tier 1: Customer Storefront] [Tier 2: Super Admin] [Tier 3: Vendor Portal] [Tier 4: Employee Desk] |
+-----------------------------------------------------------------------------------------+
```

1. **Tier 1: Customer Storefront (`/` or `/storefront`)**
   - High-throughput product catalog with instant category filtering and search.
   - Dynamic SKU, specifications, and verified vendor attribution cards.
   - Global interactive slide-over cart drawer with real-time multi-vendor sub-order breakdown.
   - One-click simulated enterprise checkout with automated order creation.

2. **Tier 2: Super Admin Command Dashboard (`/admin`)**
   - Macro KPIs: Gross Merchandise Value (GMV), Platform Retained Commission, Active Vendors, and Operational Backlog.
   - Vendor onboarding governance queue with 1-click status transitions (Approve / Reject / Hold) and custom fee negotiation.
   - Cross-departmental workforce task creation and delegation center.
   - Real-time audit log of customer orders and vendor sub-orders.

3. **Tier 3: Vendor Portal (`/vendor`)**
   - Verified supplier profile showcase and store switcher.
   - Financial ledger metrics: Withdrawable Balance, Lifetime Gross Sales, and Net Earnings.
   - SKU Catalog Manager with stock level warnings and instant "Add Product" modal.
   - Sub-Order routing tracker showing fee deductions and net merchant payouts.
   - Automated disbursement ledger with bank wire / ACH payout requests.

4. **Tier 4: Employee Workforce Desk (`/employee`)**
   - Interactive Kanban Board (To Do, In Progress, Review / QA, Completed) with quick status transition actions.
   - Dual-view toggle: Switch between visual Kanban cards and high-density tabular operational views.
   - Filtering by department (Logistics, QA, Vendor Support, Billing, Platform Ops) and priority levels (Urgent 🔥, High, Medium, Low).
   - Direct duty creation and delegation tools.

---

## 🗂️ Modular Folder Structure

```
Bizzhuss/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AdminController.php       # Platform KPIs, vendor approvals, task delegation
│   │   │   ├── CustomerController.php    # Storefront catalog, search, checkout
│   │   │   ├── EmployeeController.php    # Workforce Kanban desk, status transitions
│   │   │   └── VendorController.php      # Merchant catalog CRUD, sub-orders, payouts
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php # Shared Inertia props & flash messaging
│   │   └── Requests/
│   │       ├── CheckoutRequest.php       # Customer checkout validation
│   │       ├── EmployeeTaskRequest.php   # Workforce task delegation rules
│   │       ├── ProductStoreRequest.php   # Vendor catalog SKU validation
│   │       └── VendorApprovalRequest.php # Admin approval & commission fee rules
│   ├── Models/
│   │   ├── User.php                      # Multi-role entity (admin, vendor, employee, customer)
│   │   ├── Vendor.php                    # Shop profile, balance ledger, fee agreement
│   │   ├── Product.php                   # SKU, pricing, inventory, category
│   │   ├── Order.php                     # Master customer transaction
│   │   ├── SubOrder.php                  # Vendor-specific order slice
│   │   ├── Commission.php                # Platform retained earnings ledger
│   │   ├── Payout.php                    # ACH / Wire disbursement records
│   │   └── EmployeeTask.php              # Workforce operational ticket
│   └── Services/
│       ├── OrderService.php              # Master checkout & vendor sub-order splitter
│       ├── CommissionService.php         # Platform rate calculation & balance crediting
│       └── PayoutService.php             # Vendor disbursement validation & processing
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   └── 2026_09_27_000001_create_bizzhuss_core_tables.php
│   └── seeders/
│       └── DatabaseSeeder.php            # Enterprise demo data across all 4 tiers
├── resources/
│   ├── css/
│   │   └── app.css                       # Tailwind CSS directives & scrollbar styling
│   ├── js/
│   │   ├── app.jsx                       # Inertia React client bootstrap
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   │   ├── ProductFormModal.jsx  # Vendor SKU creation modal
│   │   │   │   ├── TaskFormModal.jsx     # Employee task delegation modal
│   │   │   │   └── VendorStatusModal.jsx # Admin approval & rate modal
│   │   │   ├── layout/
│   │   │   │   ├── CartDrawer.jsx        # Slide-over multi-vendor cart
│   │   │   │   ├── MainLayout.jsx        # Root container with alerts & footer
│   │   │   │   └── TierNavbar.jsx        # Persistent 4-tier navigation shell
│   │   │   └── ui/
│   │   │       ├── Badge.jsx             # Status and role indicator badges
│   │   │       ├── Button.jsx            # Multi-variant button component
│   │   │       ├── Card.jsx              # Enterprise card family
│   │   │       ├── Input.jsx             # Input, Select, Textarea controls
│   │   │       ├── Modal.jsx             # Accessible modal backdrop & body
│   │   │       └── StatCard.jsx          # KPI metric cards with trends
│   │   ├── context/
│   │   │   └── AppContext.jsx            # Global state (Cart, role simulation, toasts)
│   │   ├── hooks/
│   │   │   ├── useCart.js                # LocalStorage persistent shopping cart
│   │   │   └── useNotification.js        # Dynamic notification toast queue
│   │   ├── lib/
│   │   │   └── utils.js                  # clsx, twMerge, currency & date formatters
│   │   └── pages/
│   │       ├── Admin/Dashboard.jsx       # Tier 2 Super Admin view
│   │       ├── Customer/Storefront.jsx   # Tier 1 Marketplace view
│   │       ├── Employee/Workspace.jsx    # Tier 4 Kanban workforce view
│   │       └── Vendor/Portal.jsx         # Tier 3 Merchant portal view
│   └── views/
│       └── app.blade.php                 # Inertia HTML mount container
├── routes/
│   └── web.php                           # Clean tier-based web routes
├── postcss.config.js                     # PostCSS with Tailwind & Autoprefixer
├── tailwind.config.js                    # Brand colors, typography, content paths
└── vite.config.js                        # Vite React + Laravel plugin config
```

---

## ⚡ Quick Start & Development Setup

### 1. Prerequisites
- **PHP** >= 8.2 with SQLite, PDO, cURL, OpenSSL extensions enabled.
- **Composer** >= 2.8.
- **Node.js** >= 18 and **npm**.

### 2. Dependency Installation
```bash
# Install PHP backend dependencies
composer install

# Install frontend JavaScript dependencies
npm install
```

### 3. Environment & Database Setup
```bash
# Generate application encryption key (if not already set)
php artisan key:generate

# Run database migrations and seed realistic multi-tier data
php artisan migrate:fresh --seed
```

### 4. Running the Development Servers
Open two terminal tabs:

**Terminal 1 (Backend API & Inertia SSR Server):**
```bash
php artisan serve
```
*Application will be available at: `http://127.0.0.1:8000`*

**Terminal 2 (Vite Hot Module Replacement Server):**
```powershell
# On Windows PowerShell:
npm.cmd run dev

# Or in standard bash:
npm run dev
```

### 5. Production Asset Compilation
To compile assets for production deployment:
```powershell
npm.cmd run build
```

---

## 🧪 Verification & Health Check

All 4 tier routes return HTTP `200 OK`:
- `GET /` -> Customer Storefront (Tier 1)
- `GET /admin` -> Super Admin Command Center (Tier 2)
- `GET /vendor` -> Vendor Portal (Tier 3)
- `GET /employee` -> Employee Kanban Desk (Tier 4)

---

## 📄 License
The Bizzhuss platform is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
