<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Curso extends Model
{
    use HasFactory;

    protected $table = 'cursos';
    protected $fillable = [
        'codigo',
        'nombre',
        'docente',
        'aula',
        'dia',
        'hora_inicio',
        'hora_fin',
        'periodos_academicos_id'
    ];

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    public function inscripciones()
{
    return $this->hasMany(Inscripcion::class, 'cursos_id');
}
}
