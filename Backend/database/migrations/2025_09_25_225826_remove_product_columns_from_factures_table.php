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
        Schema::table('factures', function (Blueprint $table) {
        if (Schema::hasColumn('factures', 'ref_produit')) {
            $table->dropColumn('ref_produit');
        }
        if (Schema::hasColumn('factures', 'nom_produit')) {
            $table->dropColumn('nom_produit');
        }
        if (Schema::hasColumn('factures', 'quantite')) {
            $table->dropColumn('quantite');
        }
        if (Schema::hasColumn('factures', 'prix_unitaire')) {
            $table->dropColumn('prix_unitaire');
        }
        if (Schema::hasColumn('factures', 'total_ligne')) {
            $table->dropColumn('total_ligne');
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            //
        });
    }
};
