<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\Inscripcion;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            PeriodoSeeder::class,
        ]);

        Estudiante::factory(10)->create();
        Curso::factory(10)->create();

        $estudiantes = Estudiante::all();
        $cursos = Curso::all();

        foreach ($estudiantes as $estudiante) {
            foreach ($cursos as $curso) {
                Inscripcion::factory()->create([
                    'estudiantes_id' => $estudiante->id,
                    'cursos_id' => $curso->id,
                ]);
            }
        }


    }
}
