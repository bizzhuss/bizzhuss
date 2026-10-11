<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Multi-Vendor System: vendors
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('shop_name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->text('description')->nullable();
            $table->decimal('commission_rate', 5, 2)->default(10.00);
            $table->json('bank_details')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending');
            $table->timestamps();
        });

        // 2. Multi-Vendor System: vendor_payouts
        Schema::create('vendor_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('payment_method');
            $table->string('transaction_reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Department & Employee Task Management: departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Department & Employee Task Management: designations
        Schema::create('designations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('title');
            $table->timestamps();
        });

        // 5. Department & Employee Task Management: employees
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('designation_id')->constrained('designations')->cascadeOnDelete();
            $table->string('employee_code')->unique();
            $table->date('joining_date');
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->timestamps();
        });

        // 6. Department & Employee Task Management: tasks
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->cascadeOnDelete();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['todo', 'in_progress', 'review', 'completed'])->default('todo');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // 7. E-Commerce Engine: categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        // 8. E-Commerce Engine: products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->json('images')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['pending_review', 'published', 'draft'])->default('published');
            $table->timestamps();
        });

        // 9. E-Commerce Engine: orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 12, 2);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('paid');
            $table->json('shipping_address')->nullable();
            $table->json('billing_address')->nullable();
            $table->timestamps();
        });

        // 10. E-Commerce Engine: order_items (vendor sub-orders)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('platform_fee', 10, 2)->default(0.00);
            $table->decimal('vendor_earning', 10, 2)->default(0.00);
            $table->enum('delivery_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('processing');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('designations');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('vendor_payouts');
        Schema::dropIfExists('vendors');
    }
};
