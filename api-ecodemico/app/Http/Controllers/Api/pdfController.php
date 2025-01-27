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

class PDFController extends Controller  // Nombres de clases en PascalCase
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
}