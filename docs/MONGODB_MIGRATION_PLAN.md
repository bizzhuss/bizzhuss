# MongoDB Migration & Architecture Plan
**Project:** Bizzhuss Multi-Vendor Marketplace  
**Framework:** Laravel 11 (PHP 8.2+) with Inertia.js (React)  
**Target Database:** MongoDB (Atlas Cloud or Self-Hosted)  
**Date Prepared:** 2026-10-19

---

## 1. Overview & Objectives

The Bizzhuss application has been decoupled from MySQL/MariaDB to prepare for a document-based MongoDB architecture. This document outlines:
- The recommended driver and Object-Document Mapper (ODM) for Laravel 11.
- Required environment configuration and settings.
- Document modeling strategy (relational-to-document mapping).
- Step-by-step migration process from the verified MySQL backup (`database-backups/mysql_backup_2026-10-19_15-09-10.sql`).

---

## 2. Recommended Driver & ODM

### 2.1 Driver & Package
- **Official ODM Package:** [`mongodb/laravel-mongodb`](https://github.com/mongodb/laravel-mongodb) (v5.x for Laravel 11).
- **Underlying PHP Extension:** `mongodb` (v1.18+ for PHP 8.2+).

### 2.2 Prerequisites & Installation (When Ready)
1. **Enable PHP Extension:**  
   In `php.ini` (e.g., `C:\xampp\php\php.ini` or production PHP container):
   ```ini
   extension=mongodb
   ```
2. **Install Composer Package:**
   ```bash
   composer require mongodb/laravel-mongodb:^5.0
   ```
3. **Service Provider Registration:**  
   Laravel 11 auto-discovers `MongoDB\Laravel\MongoDBServiceProvider`.

---

## 3. Recommended Connection Configuration

### 3.1 `config/database.php`
The connection block is already prepared in `config/database.php`:
```php
'connections' => [
    'mongodb' => [
        'driver'   => 'mongodb',
        'dsn'      => env('MONGODB_URI', 'mongodb://127.0.0.1:27017'),
        'database' => env('MONGODB_DATABASE', 'bizzhuss'),
        'options'  => [
            'database' => env('MONGODB_DATABASE', 'bizzhuss'),
        ],
    ],
    // ...
],
```

### 3.2 Environment Variables
Add to `.env` and deployment secrets (e.g. Vercel / Cloud):
```env
# MongoDB Connection
DB_CONNECTION=mongodb
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=bizzhuss
```

---

## 4. Relational to Document Mapping Architecture

In MySQL, Bizzhuss maintained 29 relational tables with foreign keys. In MongoDB, document embedding optimizes performance, reduces multi-table joins, and leverages atomic document writes.

### 4.1 Collection & Document Schema Mapping

| MySQL Tables | MongoDB Collection | Modeling Strategy | Rationale |
| :--- | :--- | :--- | :--- |
| `users`, `password_reset_tokens`, `model_has_roles`, `model_has_permissions` | `users` | **Hybrid Embedded**<br>`roles: []`<br>`permissions: []`<br>`profile: {}` | Eliminates expensive joins for RBAC checks on every authenticated request. |
| `vendors`, `vendor_payouts` | `vendors` | **Hybrid Embedded**<br>Vendor profile with embedded `bank_details`, `payouts` array (recent), and summary counters. | Fast retrieval of vendor store pages and payout history. |
| `categories` | `categories` | **Embedded Hierarchy**<br>`subcategories: [...]` embedded inside parent categories. | Storefront navigation renders in 1 query without recursive SQL joins. |
| `products` | `products` | **Referenced + Snapshot**<br>References `vendor_id`, `category_id`. Embeds vendor snapshot `{ shop_name, logo }` and `specifications: []`. | Enables millisecond storefront listing without joining vendors or categories table. |
| `orders`, `order_items` | `orders` | **Fully Embedded**<br>`items: [{ product_id, title, price, quantity, vendor_id, subtotal }]` | Ensures atomic order placement; changes to product catalog in the future do not mutate historical order data. |
| `coupons` | `coupons` | **Standalone Collection** | Fast indexed lookup by `code`. |
| `promotional_banners`, `promotional_campaigns` | `promotions` | **Polymorphic / Embedded** | Fast storefront banner fetching. |
| `departments`, `designations`, `employees` | `employees` | **Embedded Objects**<br>Embeds `department: { id, name }`, `designation: { id, title }`. | Workforce portal single-document queries. |
| `tasks`, `task_activities` | `tasks` | **Fully Embedded**<br>`activities: [{ action, note, author, timestamp }]` | Complete task log stored in a single document. |

---

## 5. Model Conversion Guidelines

When transitioning models from MySQL Eloquent to MongoDB Eloquent:

1. **Base Class Change:**
   Replace:
   ```php
   use Illuminate\Database\Eloquent\Model;
   ```
   with:
   ```php
   use MongoDB\Laravel\Eloquent\Model;
   ```
2. **Primary Key:**
   MongoDB uses `_id` (ObjectId). `mongodb/laravel-mongodb` seamlessly maps `$model->id` to `(string) $model->_id`.
3. **Relationships:**
   - Use `embedsMany` / `embedsOne` for nested data (e.g. `Order::embedsMany(OrderItem::class)`).
   - Use `belongsTo` / `hasMany` for cross-collection references.

---

## 6. Migration Execution Strategy (ETL Blueprint)

When ready to migrate data from the MySQL backup to MongoDB:

1. **Step 1 - Restore Backup to Staging MySQL Instance:**
   Restore `database-backups/mysql_backup_2026-10-19_15-09-10.sql` to a temporary MySQL instance or staging database.
2. **Step 2 - Run Laravel Migration Command:**
   Create an Artisan command `php artisan bizzhuss:migrate-to-mongo` that reads from the `mysql_staging` connection and writes to the `mongodb` connection.
   ```php
   // Pseudo-code migration logic:
   $orders = DB::connection('mysql_staging')->table('orders')->get();
   foreach ($orders as $order) {
       $items = DB::connection('mysql_staging')->table('order_items')->where('order_id', $order->id)->get();
       MongoDBOrder::create([
           'mysql_id'      => $order->id,
           'order_number'  => $order->order_number,
           'total_amount'  => $order->total_amount,
           'status'        => $order->status,
           'customer'      => [ ... ],
           'items'         => $items->toArray(),
           'created_at'    => $order->created_at,
       ]);
   }
   ```
3. **Step 3 - Verify Record Integrity:**
   Validate that document counts and financial totals match the MySQL source data.
4. **Step 4 - Switch Production Environment:**
   Set `DB_CONNECTION=mongodb` and supply `MONGODB_URI` in production.
