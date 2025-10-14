<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FactureLine extends Model
{
    protected $fillable = [
        'facture_id', 
        'ref_produit', 
        'nom_produit',
        'quantite', 
        'prix_unitaire', 
        'total_ligne'
    ];

    public function facture()
    {
        return $this->belongsTo(Facture::class, 'facture_id');
    }
}

