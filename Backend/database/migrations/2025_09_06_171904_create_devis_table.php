<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('devis', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('id_user'); // utilisateur qui crée le devis
        $table->string('ref_devis');
        $table->string('categorie');
        $table->decimal('total', 10, 2)->default(0);
        $table->timestamps();

        $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
