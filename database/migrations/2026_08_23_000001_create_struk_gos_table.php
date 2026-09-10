<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('struk_gos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->string('merchant_name'); // Kopi Kenangan, Indomaret, Tiket TransJakarta, MRT, etc.
            $table->string('transaction_type')->default('F&B_PURCHASE'); // F&B_PURCHASE, TRANSIT_FARE
            $table->json('items_json'); // Array of items [{name, qty, price}]
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('payment_method')->default('E-Wallet / KUE');
            $table->string('status')->default('SUCCESS');
            $table->timestamp('transaction_time')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('struk_gos');
    }
};
