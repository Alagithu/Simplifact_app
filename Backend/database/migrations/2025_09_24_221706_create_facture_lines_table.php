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
Schema::create('facture_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')
                  ->constrained('factures')
                  ->onDelete('cascade'); 
            $table->string('ref_produit');
            $table->string('nom_produit');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('total_ligne', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('facture_lines');
    }
};
