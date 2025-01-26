<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';
    protected $fillable = [
        'cursos_id',
        'estudiantes_id'
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }
}
