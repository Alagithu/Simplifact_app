<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable=[
        'nom_produit',
        'ref_produit',
        'type',
        'prix',
        'id_user'
    ];
      public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
