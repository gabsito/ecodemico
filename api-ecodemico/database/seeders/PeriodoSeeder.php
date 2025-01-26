<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PeriodoAcademico;

class PeriodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $periodos = [
            [
                'nombre' => '2021-1',
                'fecha_inicio' => '2021-01-01',
                'fecha_fin' => '2021-06-30',
                'activo' => true,
            ],
            [
                'nombre' => '2021-2',
                'fecha_inicio' => '2021-07-01',
                'fecha_fin' => '2021-12-31',
                'activo' => false,
            ],
        ];

        foreach ($periodos as $periodo) {
            PeriodoAcademico::create($periodo);
        }
    }
}
