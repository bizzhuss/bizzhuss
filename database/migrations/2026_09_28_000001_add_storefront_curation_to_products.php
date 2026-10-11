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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->index()->after('status');
            }
            if (!Schema::hasColumn('products', 'is_on_special_sale')) {
                $table->boolean('is_on_special_sale')->default(false)->index()->after('is_featured');
            }
            if (!Schema::hasColumn('products', 'special_sale_title')) {
                $table->string('special_sale_title')->nullable()->after('is_on_special_sale');
            }
            if (!Schema::hasColumn('products', 'total_sold_count')) {
                $table->integer('total_sold_count')->default(0)->index()->after('special_sale_title');
            }
            if (!Schema::hasColumn('products', 'featured_order')) {
                $table->integer('featured_order')->default(0)->after('total_sold_count');
            }
            if (!Schema::hasColumn('products', 'compare_price')) {
                $table->decimal('compare_price', 10, 2)->nullable()->after('price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_featured',
                'is_on_special_sale',
                'special_sale_title',
                'total_sold_count',
                'featured_order',
            ]);
        });
    }
};
