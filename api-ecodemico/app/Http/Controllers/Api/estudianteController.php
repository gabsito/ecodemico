<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Estudiante;

class estudianteController extends Controller
{
    public function index()
    {
        $estudiantes = Estudiante::all();

        if ($estudiantes->isEmpty()) {
            return response()->json([
                'message' => 'No hay estudiantes registrados',
                'status' => 200
            ], 200);
        }

        return response()->json([
            'data' => $estudiantes
        ], 200);
    }

    public function show($id)
    {
        $estudiante = Estudiante::find($id);

        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }

        return response()->json([
            'data' => $estudiante
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matricula' => 'required',
            'nombre' => 'required',
            'correo' => 'required|email|unique:estudiante'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        $estudiante = Estudiante::create($request->all());

        if (!$estudiante) {
            return response()->json([
                'message' => 'Error al crear el estudiante',
                'status' => 500
            ], 500);
        }

        return response()->json([
            'message' => 'Estudiante creado correctamente',
            'data' => $estudiante,
            'status' => 201
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $estudiante = Estudiante::find($id);

        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'matricula' => 'required',
            'nombre' => 'required',
            'correo' => 'required|email|unique:estudiante'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ]);
        }

        $estudiante->update($request->all());

        return response()->json([
            'message' => 'Estudiante actualizado correctamente',
            'data' => $estudiante,
            'status' => 200
        ], 200);
    }

    public function updatePartial(Request $request, $id)
    {
        $estudiante = Estudiante::find($id);

        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'matricula' => 'max:10',
            'nombre' => 'max:255',
            'correo' => 'email|unique:estudiante'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ]);
        }

        if($request->has('matricula')) {
            $estudiante->matricula = $request->matricula;
        }
        if($request->has('nombre')) {
            $estudiante->nombre = $request->nombre;
        }
        if($request->has('correo')) {
            $estudiante->correo = $request->correo;
        }

        $estudiante->save();

        return response()->json([
            'message' => 'Estudiante actualizado correctamente',
            'data' => $estudiante,
            'status' => 200
        ], 200);
    }

    public function destroy($id)
    {
        $estudiante = Estudiante::find($id);

        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }

        $estudiante->delete();

        return response()->json([
            'message' => 'Estudiante eliminado correctamente'
        ]);
    }
}
