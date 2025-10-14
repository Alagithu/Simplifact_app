<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    use HasFactory;
    protected $table = 'devis';
    protected $fillable = [
        'id_user',
        'ref_devis',
        'categorie',
        'total',
    ];

    public function lines()
    {
        return $this->hasMany(DevisLine::class, 'devis_id');
    }
      public function user()
    {
        return $this->belongsTo(User::class,'id_user');
    }
}
