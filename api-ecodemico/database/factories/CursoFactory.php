<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Curso>
 */
class CursoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'codigo' => $this->faker->unique()->numberBetween(1000, 9999),
            'nombre' => $this->faker->unique()->word(),
            'docente' => $this->faker->name(),
            'aula' => $this->faker->unique()->word(),
            'dia' => $this->faker->randomElement(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']),
            'hora_inicio' => $this->faker->dateTimeBetween('08:00', '12:00')->format('H:i'),
            'hora_fin' => $this->faker->dateTimeBetween('13:00', '18:00')->format('H:i'),
            'periodos_academicos_id' =>  $this->faker->numberBetween(1, 2)
        ];
    }
}
