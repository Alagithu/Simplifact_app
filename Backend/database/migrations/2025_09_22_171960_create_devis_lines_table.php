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
Schema::create('devis_lines', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('devis_id');
        $table->string('ref_produit');
        $table->string('nom_produit');
        $table->integer('quantite');
        $table->decimal('prix_unitaire', 10, 2);
        $table->decimal('total_ligne', 10, 2);
        $table->timestamps();

        $table->foreign('devis_id')->references('id')->on('devis')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis_lines');
    }
};
