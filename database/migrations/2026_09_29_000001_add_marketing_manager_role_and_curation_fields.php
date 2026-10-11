<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Extend users.role enum to include 'marketing_manager'
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'vendor', 'employee', 'customer', 'marketing_manager') DEFAULT 'customer'");
        } catch (\Throwable $e) {
            // Fallback for drivers that don't support raw modify
        }

        // 2. Add curation fields to products table
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'curation_tier')) {
                $table->string('curation_tier')->default('none')->index()->after('featured_order');
            }
            if (!Schema::hasColumn('products', 'discount_percentage')) {
                $table->decimal('discount_percentage', 5, 2)->nullable()->after('curation_tier');
            }
            if (!Schema::hasColumn('products', 'flash_sale_end_time')) {
                $table->timestamp('flash_sale_end_time')->nullable()->after('discount_percentage');
            }
            if (!Schema::hasColumn('products', 'sale_badge_label')) {
                $table->string('sale_badge_label', 100)->nullable()->after('flash_sale_end_time');
            }
        });

        // 3. Create promotional_banners table
        if (!Schema::hasTable('promotional_banners')) {
            Schema::create('promotional_banners', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('subtitle')->nullable();
                $table->string('badge_text')->nullable();
                $table->string('image_path');
                $table->string('target_url')->nullable();
                $table->string('section_key')->default('hero_carousel')->index();
                $table->timestamp('start_time')->nullable();
                $table->timestamp('end_time')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 4. Create promotional_campaigns table
        if (!Schema::hasTable('promotional_campaigns')) {
            Schema::create('promotional_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('badge_label')->nullable();
                $table->decimal('discount_percentage', 5, 2)->nullable();
                $table->timestamp('start_time')->nullable();
                $table->timestamp('end_time')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotional_campaigns');
        Schema::dropIfExists('promotional_banners');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'curation_tier',
                'discount_percentage',
                'flash_sale_end_time',
                'sale_badge_label',
            ]);
        });

        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'vendor', 'employee', 'customer') DEFAULT 'customer'");
        } catch (\Throwable $e) {
            // Ignore rollback failure on enum
        }
    }
};
