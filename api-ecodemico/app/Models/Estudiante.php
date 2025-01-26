<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiantes';

    protected $fillable = [
        'matricula',
        'nombre',
        'correo',
    ];

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }
}
