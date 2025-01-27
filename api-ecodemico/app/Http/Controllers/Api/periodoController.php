<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\PeriodoAcademico;
use App\Http\Controllers\Api\cursoController;
use App\Models\Curso;

class periodoController extends Controller
{
    public function index()
    {
        $periodos = PeriodoAcademico::all();

        if ($periodos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron periodos'], 404);
        }

        return response()->json(['data' => $periodos], 200);
    }

    public function show($id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }

        return response()->json(['data' => $periodo], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        $periodo = PeriodoAcademico::create($request->all());

        if (!$periodo) {
            return response()->json(['message' => 'Ocurrio un error al registrar el periodo'], 500);
        }

        return response()->json(['data' => $periodo], 201);
    }

    public function update(Request $request, $id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        $periodo->update($request->all());

        return response()->json(['data' => $periodo], 200);
    }

    public function updatePartial(Request $request, $id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'max:255',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'activo' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('nombre')) {
            $periodo->nombre = $request->nombre;
        }

        if ($request->has('fecha_inicio')) {
            $periodo->fecha_inicio = $request->fecha_inicio;
        }

        if ($request->has('fecha_fin')) {
            $periodo->fecha_fin = $request->fecha_fin;
        }

        if ($request->has('activo')) {
            $periodo->activo = $request->activo;
        }

        $periodo->save();

        return response()->json(['data' => $periodo], 200);
    }

    public function destroy($id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }
        try {
            $periodo->delete();
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se puede eliminar un periodo con cursos registrados.'], 400);
        }

        return response()->json(['message' => 'Periodo eliminado correctamente'], 200);
    }

    public function activar($id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }

        $periodo->activo = true;

        // desactivar los otros periodos
        PeriodoAcademico::where('id', '!=', $id)->update(['activo' => false]);

        $periodo->save();

        return response()->json(['message' => 'Periodo activado correctamente'], 200);
    }

    public function desactivar($id)
    {
        $periodo = PeriodoAcademico::find($id);

        if (!$periodo) {
            return response()->json(['message' => 'Periodo no encontrado'], 404);
        }

        $periodo->activo = false;
        $periodo->save();

        return response()->json(['message' => 'Periodo desactivado correctamente'], 200);
    }

    public function activo()
    {
        $periodo = PeriodoAcademico::where('activo', true)->first();

        if (!$periodo) {
            return response()->json(['message' => 'No hay periodo activo'], 404);
        }

        return response()->json(['data' => $periodo], 200);
    }


}
