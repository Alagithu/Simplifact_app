<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
     protected $fillable=[
        'title',
        'description',
        'id_user'
    ];
      public function user()
    {
        return $this->belongsTo(User::class);
    }
}
