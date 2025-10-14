<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $table = 'factures';

 protected $fillable = [
        'id_user', 'ref_facture', 'montant_ht', 'tva',
        'montant_ttc', 'mode_paiement', 'name_client'
    ];

    public function lines()
    {
        return $this->hasMany(FactureLine::class, 'facture_id');
    }
}
