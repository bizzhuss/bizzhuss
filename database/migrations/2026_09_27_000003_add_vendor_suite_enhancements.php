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
        // 1. Add enhanced catalog attributes to products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable()->after('category_id');
            }
            if (!Schema::hasColumn('products', 'cost_per_item')) {
                $table->decimal('cost_per_item', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'barcode')) {
                $table->string('barcode')->nullable()->after('sku');
            }
            if (!Schema::hasColumn('products', 'low_stock_threshold')) {
                $table->integer('low_stock_threshold')->default(5)->after('stock_quantity');
            }
            if (!Schema::hasColumn('products', 'variants')) {
                $table->json('variants')->nullable()->after('description');
            }
        });

        // 2. Add support contact and return policy to vendors
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'support_phone')) {
                $table->string('support_phone')->nullable()->after('banner');
            }
            if (!Schema::hasColumn('vendors', 'return_policy')) {
                $table->text('return_policy')->nullable()->after('description');
            }
        });

        // 3. Create coupons table for vendor discount engine
        if (!Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
                $table->string('code')->index();
                $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
                $table->decimal('discount_value', 10, 2);
                $table->decimal('min_spend', 10, 2)->default(0.00);
                $table->integer('usage_limit')->nullable();
                $table->integer('times_used')->default(0);
                $table->decimal('revenue_generated', 12, 2)->default(0.00);
                $table->boolean('is_active')->default(true);
                $table->date('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // 4. Add tracking number to order items for fulfillment
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'tracking_number')) {
                $table->string('tracking_number')->nullable()->after('delivery_status');
            }
            if (!Schema::hasColumn('order_items', 'carrier')) {
                $table->string('carrier')->nullable()->after('tracking_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['brand', 'cost_per_item', 'barcode', 'low_stock_threshold', 'variants']);
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['support_phone', 'return_policy']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'carrier']);
        });
    }
};
