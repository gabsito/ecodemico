<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class DataExport implements 
    FromCollection,
    WithHeadings,
    WithStyles,
    ShouldAutoSize,
    WithMapping,
    WithEvents,
    WithColumnFormatting
{
    protected $model;
    protected $headers;
    protected $title;
    protected $rowCount;

    public function __construct($modelClass)
    {
        $this->model = $modelClass;
        $tempInstance = new $modelClass;
        $this->headers = $tempInstance->getConnection()
            ->getSchemaBuilder()
            ->getColumnListing($tempInstance->getTable());
        
        // Obtener el nombre de la tabla para el título
        $this->title = ucwords(str_replace('_', ' ', $tempInstance->getTable()));
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $data = $this->model::all();
        $this->rowCount = $data->count();
        return $data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return array_map(function($header) {
            return ucwords(str_replace('_', ' ', $header));
        }, $this->headers);
    }

    /**
     * @param mixed $row
     * @return array
     */
    public function map($row): array
    {
        return collect($this->headers)->map(function($header) use ($row) {
            $value = $row->$header;
            
            // Manejo especial para diferentes tipos de datos
            if ($value instanceof \DateTime || $value instanceof Carbon) {
                return $value->format('Y-m-d H:i:s');
            }
            
            if (is_bool($value)) {
                return $value ? 'Sí' : 'No';
            }
            
            if (is_null($value)) {
                return '';
            }
            
            return $value;
        })->toArray();
    }

    /**
     * @return array
     */
    public function columnFormats(): array
    {
        $formats = [];
        foreach ($this->headers as $index => $header) {
            // Detectar columnas de fecha por nombre
            if (str_contains($header, 'fecha') || str_contains($header, 'date')) {
                $formats[chr(65 + $index)] = NumberFormat::FORMAT_DATE_DDMMYYYY;
            }
            // Detectar columnas numéricas
            elseif (str_contains($header, 'monto') || str_contains($header, 'precio')) {
                $formats[chr(65 + $index)] = NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1;
            }
        }
        return $formats;
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        // Agregar título
        $sheet->mergeCells('A1:' . chr(64 + count($this->headers)) . '1');
        $sheet->setCellValue('A1', $this->title . ' - Generado el ' . now()->format('d/m/Y H:i:s'));
        
        return [
            // Estilo del título
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 14
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER
                ]
            ],
            // Estilo de los encabezados
            2 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER
                ]
            ]
        ];
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet;
                $lastColumn = chr(64 + count($this->headers));
                $lastRow = $this->rowCount + 2; // +2 por el título y encabezados

                // Agregar bordes a toda la tabla
                $sheet->getStyle('A1:' . $lastColumn . $lastRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000'],
                        ],
                    ],
                ]);

                // Congelar panel de encabezados
                $sheet->freezePane('A3');

                // Aplicar filtros automáticos
                $sheet->setAutoFilter('A2:' . $lastColumn . $lastRow);

                // Ajustar el zoom de la hoja
                $sheet->getSheetView()->setZoomScale(85);
            },
        ];
    }
}