<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\EstudianteController;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\InscripcionController;
use App\Http\Controllers\Api\PeriodoController;
use App\Http\Controllers\Api\pdfController;

Route::get('/estudiantes', [EstudianteController::class, 'index']);
Route::get('/estudiantes/{id}', [EstudianteController::class, 'show']);
Route::post('/estudiantes', [EstudianteController::class, 'store']);
Route::put('/estudiantes/{id}', [EstudianteController::class, 'update']);
Route::patch('/estudiantes/{id}', [EstudianteController::class, 'updatePartial']);
Route::delete('/estudiantes/{id}', [EstudianteController::class, 'destroy']);

Route::get('/estudiantes/{id}/inscripciones', [InscripcionController::class, 'inscripcionesPorEstudiante']);
Route::get('/PDF/{tablename}', [pdfController::class, 'generatePDF']);

Route::get('/cursos', [CursoController::class, 'index']);
Route::get('/cursos/{id}', [CursoController::class, 'show']);
Route::post('/cursos', [CursoController::class, 'store']);
Route::put('/cursos/{id}', [CursoController::class, 'update']);
Route::patch('/cursos/{id}', [CursoController::class, 'updatePartial']);
Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);

Route::get('/inscripciones', [InscripcionController::class, 'index']);
Route::get('/inscripciones/{id}', [InscripcionController::class, 'show']);
Route::post('/inscripciones', [InscripcionController::class, 'store']);
Route::put('/inscripciones/{id}', [InscripcionController::class, 'update']);
Route::patch('/inscripciones/{id}', [InscripcionController::class, 'updatePartial']);
Route::delete('/inscripciones/{id}', [InscripcionController::class, 'destroy']);

Route::get('/periodos', [PeriodoController::class, 'index']);
Route::get('/periodos/activo', [PeriodoController::class, 'activo']);
Route::put('/periodos/{id}/activar', [PeriodoController::class, 'activar']);
Route::put('/periodos/{id}/desactivar', [PeriodoController::class, 'desactivar']);
Route::get('/periodos/{id}', [PeriodoController::class, 'show']);
Route::post('/periodos', [PeriodoController::class, 'store']);
Route::put('/periodos/{id}', [PeriodoController::class, 'update']);
Route::patch('/periodos/{id}', [PeriodoController::class, 'updatePartial']);
Route::delete('/periodos/{id}', [PeriodoController::class, 'destroy']);

