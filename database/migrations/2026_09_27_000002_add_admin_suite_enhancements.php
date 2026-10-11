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
        // 1. Add fields to tasks
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'category')) {
                $table->string('category')->default('Product Approval')->after('priority');
            }
            if (!Schema::hasColumn('tasks', 'progress')) {
                $table->integer('progress')->default(0)->after('status');
            }
            if (!Schema::hasColumn('tasks', 'proof_attachment')) {
                $table->string('proof_attachment')->nullable()->after('progress');
            }
            if (!Schema::hasColumn('tasks', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('due_date');
            }
        });

        // 2. Add fields to employees
        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'monthly_target')) {
                $table->integer('monthly_target')->default(25)->after('employee_code');
            }
        });

        // 3. Add fields to categories
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'banner')) {
                $table->string('banner')->nullable()->after('icon');
            }
            if (!Schema::hasColumn('categories', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->nullable()->after('banner');
            }
        });

        // 4. Add receipt_url to vendor_payouts
        Schema::table('vendor_payouts', function (Blueprint $table) {
            if (!Schema::hasColumn('vendor_payouts', 'receipt_url')) {
                $table->string('receipt_url')->nullable()->after('transaction_reference');
            }
        });

        // 5. Create task_activities table for audit logs
        if (!Schema::hasTable('task_activities')) {
            Schema::create('task_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('action'); // e.g. created, status_change, progress_update, proof_uploaded, completed
                $table->text('note')->nullable();
                $table->timestamps();
            });
        }

        // 6. Create platform settings table
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('task_activities');

        Schema::table('vendor_payouts', function (Blueprint $table) {
            $table->dropColumn(['receipt_url']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['banner', 'commission_rate']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['monthly_target']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['category', 'progress', 'proof_attachment', 'completed_at']);
        });
    }
};
