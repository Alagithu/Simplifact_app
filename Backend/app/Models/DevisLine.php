<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DevisLine extends Model
{
    use HasFactory;
    protected $table = 'devis_lines';
    protected $fillable = [
        'devis_id',
        'ref_produit',
        'nom_produit',
        'quantite',
        'prix_unitaire',
        'total_ligne',
    ];

    public function devis()
    {
        return $this->belongsTo(Devis::class, 'devis_id');
    }
}
