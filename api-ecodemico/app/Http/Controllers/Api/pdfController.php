<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use Dompdf\Dompdf;
use Dompdf\Options;
use App\Models\PeriodoAcademico;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\Inscripcion;

class PDFController extends Controller
{
    // Array asociativo para mapear nombres de tablas con sus modelos
    private const TABLE_MODELS = [
        'periodos' => PeriodoAcademico::class,
        'cursos' => Curso::class,
        'estudiantes' => Estudiante::class,
        'inscripciones' => Inscripcion::class
    ];

    /**
     * Genera un PDF basado en los datos de una tabla específica
     *
     * @param string $tablename
     * @return \Illuminate\Http\Response
     */
    public function generatePDF(string $tablename)
    {
        // Validar si la tabla existe en nuestro mapeo
        if (!array_key_exists($tablename, self::TABLE_MODELS)) {
            return response()->json([
                'message' => "Tabla '$tablename' no encontrada"
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            // Obtener los datos del modelo correspondiente
            $modelClass = self::TABLE_MODELS[$tablename];
            $data = $modelClass::all()->toArray();

            // Verificar si hay datos
            if (empty($data)) {
                return response()->json([
                    'message' => 'No hay datos disponibles para generar el PDF'
                ], Response::HTTP_NOT_FOUND);
            }

            $html = $this->generateHTML($data, $tablename);
            $pdfOutput = $this->createPDF($html);
            
            // Generar nombre de archivo
            $filename = sprintf(
                'reporte_%s_%s.pdf',
                $tablename,
                now()->format('Ymd_His')
            );

            // Convertir el PDF a base64 para enviar al frontend
            $base64 = base64_encode($pdfOutput);
            
            return response()->json([
                'status' => 'success',
                'filename' => $filename,
                'pdf' => $base64
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al generar el PDF',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Genera el HTML para el PDF
     *
     * @param array $data
     * @param string $tablename
     * @return string
     */
    private function generateHTML(array $data, string $tablename): string
    {
        $headers = array_keys($data[0]);
        
        $tableRows = collect($data)->map(function ($item) {
            return '<tr>' . collect($item)
                ->map(fn($value) => '<td>' . htmlspecialchars($value ?? '') . '</td>')
                ->join('') . '</tr>';
        })->join('');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte - {$tablename}</title>
            <style>
                body { font-family: 'DejaVu Sans', sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Reporte de {$tablename}</h1>
            <table>
                <thead>
                    <tr>
                        {$this->generateTableHeaders($headers)}
                    </tr>
                </thead>
                <tbody>
                    {$tableRows}
                </tbody>
            </table>
        </body>
        </html>
        HTML;
    }

    /**
     * Genera los encabezados de la tabla
     *
     * @param array $headers
     * @return string
     */
    private function generateTableHeaders(array $headers): string
    {
        return collect($headers)
            ->map(fn($header) => '<th>' . htmlspecialchars($header) . '</th>')
            ->join('');
    }

    /**
     * Crea el PDF a partir del HTML
     *
     * @param string $html
     * @return string
     */
    private function createPDF(string $html): string
    {
        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
 * Genera un PDF con el reporte detallado de un estudiante
 *
 * @param int $estudianteId
 * @return \Illuminate\Http\Response
 */
public function generateEstudianteReport(int $estudianteId)
{
    try {
        // Obtener estudiante con sus inscripciones y cursos relacionados
        $estudiante = Estudiante::with(['inscripciones.curso'])
            ->find($estudianteId);

        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }

        // Generar HTML para el reporte
        $html = $this->generateEstudianteHTML($estudiante);
        $pdfOutput = $this->createPDF($html);
        
        // Generar nombre de archivo
        $filename = sprintf(
            'reporte_estudiante_%s_%s.pdf',
            $estudiante->matricula,
            now()->format('Ymd_His')
        );

        // Convertir el PDF a base64
        $base64 = base64_encode($pdfOutput);
        
        return response()->json([
            'status' => 'success',
            'filename' => $filename,
            'pdf' => $base64
        ]);

    } catch (Exception $e) {
        return response()->json([
            'message' => 'Error al generar el PDF del estudiante',
            'error' => $e->getMessage()
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

/**
 * Genera el HTML para el reporte de estudiante
 *
 * @param Estudiante $estudiante
 * @return string
 */
private function generateEstudianteHTML(Estudiante $estudiante): string
{
    // Generar filas de la tabla de cursos
    $cursosRows = $estudiante->inscripciones->map(function ($inscripcion) {
        $curso = $inscripcion->curso;
        $horario = "{$curso->dia} {$curso->hora_inicio} - {$curso->hora_fin}";
        return <<<HTML
            <tr>
                <td>{$curso->nombre}</td>
                <td>{$curso->codigo}</td>
                <td>{$curso->aula}</td>
                <td>{$horario}</td>
                <td>{$curso->docente}</td>
            </tr>
        HTML;
    })->join('');

    $totalCursos = $estudiante->inscripciones->count();

    return <<<HTML
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Estudiante</title>
        <style>
            body { 
                font-family: 'DejaVu Sans', sans-serif;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .estudiante-info {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                font-size: 12px;
            }
            th {
                background-color: #f2f2f2;
            }
            .total {
                text-align: right;
                font-weight: bold;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            h1 { color: #333; }
            h2 { color: #666; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Reporte de Estudiante</h1>
        </div>
        
        <div class="estudiante-info">
            <h2>Información del Estudiante</h2>
            <p><strong>Nombre:</strong> {$estudiante->nombre}</p>
            <p><strong>Matrícula:</strong> {$estudiante->matricula}</p>
            <p><strong>Correo:</strong> {$estudiante->correo}</p>
        </div>

        <h2>Cursos Inscritos</h2>
        <table>
            <thead>
                <tr>
                    <th>Curso</th>
                    <th>Código</th>
                    <th>Aula</th>
                    <th>Horario</th>
                    <th>Docente</th>
                </tr>
            </thead>
            <tbody>
                {$cursosRows}
            </tbody>
        </table>

        <div class="total">
            <p>Total de cursos inscritos: {$totalCursos}</p>
        </div>
    </body>
    </html>
    HTML;
}
}