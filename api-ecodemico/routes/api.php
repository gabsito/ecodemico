<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\EstudianteController;

Route::get('/estudiantes', [EstudianteController::class, 'index']);

Route::get('/estudiantes/{id}', [EstudianteController::class, 'show']);

Route::post('/estudiantes', [EstudianteController::class, 'store']);

Route::put('/estudiantes/{id}', [EstudianteController::class, 'update']);

Route::patch('/estudiantes/{id}', [EstudianteController::class, 'updatePartial']);

Route::delete('/estudiantes/{id}', [EstudianteController::class, 'destroy']);