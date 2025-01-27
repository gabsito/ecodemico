<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Response;
use App\Models\PeriodoAcademico;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\Inscripcion;
use App\Exports\DataExport;

class ExcelController extends Controller
{
    private const TABLE_MODELS = [
        'periodos' => PeriodoAcademico::class,
        'cursos' => Curso::class,
        'estudiantes' => Estudiante::class,
        'inscripciones' => Inscripcion::class
    ];

    public function export($tablename)
    {
        if (!array_key_exists($tablename, self::TABLE_MODELS)) {
            return response()->json([
                'message' => "Tabla '$tablename' no encontrada"
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $export = new DataExport(self::TABLE_MODELS[$tablename]);
            return Excel::download($export, "{$tablename}_" . now()->format('Y-m-d_His') . '.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar el Excel',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}