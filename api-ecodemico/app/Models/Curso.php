<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'curso';
    protected $fillable = [
        'codigo',
        'nombre',
        'docente',
        'aula',
        'dia',
        'hora_inicio',
        'hora_fin',
        'periodo_academico_id'
    ];

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }
}
