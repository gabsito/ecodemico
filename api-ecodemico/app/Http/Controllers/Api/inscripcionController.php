<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Inscripcion;

class inscripcionController extends Controller
{
    private $maxPerAula = 30;

    public function index()
    {
        $inscripciones = Inscripcion::all();

        if ($inscripciones->isEmpty()) {
            return response()->json([
                'message' => 'No hay inscripciones registradas',
                'status' => 200
            ], 200);
        }

        return response()->json([
            'data' => $inscripciones
        ], 200);
    }

    public function show($id)
    {
        $inscripcion = Inscripcion::find($id);

        if (!$inscripcion) {
            return response()->json([
                'message' => 'Inscripcion no encontrada',
                'status' => 404
            ], 404);
        }

        return response()->json([
            'data' => $inscripcion
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cursos_id' => 'required|exists:cursos,id',
            'estudiantes_id' => 'required|exists:estudiantes,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        $inscripciones = Inscripcion::where('cursos_id', $request->cursos_id)->get();

        if ($inscripciones->count() >= $this->maxPerAula) {
            return response()->json([
                'message' => 'El curso ya tiene el maximo de inscripciones',
                'status' => 400
            ], 400);
        }


        $inscripcion = Inscripcion::create($request->all());

        if (!$inscripcion) {
            return response()->json([
                'message' => 'Ocurrio un error al registrar la inscripcion',
                'status' => 500
            ], 500);
        }

        return response()->json([
            'data' => $inscripcion
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $inscripcion = Inscripcion::find($id);

        if (!$inscripcion) {
            return response()->json([
                'message' => 'Inscripcion no encontrada',
                'status' => 404
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'cursos_id' => 'exists:cursos,id',
            'estudiantes_id' => 'exists:estudiantes,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        $inscripcion->update($request->all());

        return response()->json([
            'data' => $inscripcion
        ], 200);
    }

    public function updatePartial(Request $request, $id)
    {
        $inscripcion = Inscripcion::find($id);

        if (!$inscripcion) {
            return response()->json([
                'message' => 'Inscripcion no encontrada',
                'status' => 404
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'cursos_id' => 'exists:cursos,id',
            'estudiantes_id' => 'exists:estudiantes,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        if ($request->has('cursos_id')) {
            $inscripcion->cursos_id = $request->cursos_id;
        }

        if ($request->has('estudiantes_id')) {
            $inscripcion->estudiantes_id = $request->estudiantes_id;
        }

        $inscripcion->save();

        return response()->json([
            'data' => $inscripcion
        ], 200);
    }   

    public function destroy($id)
    {
        $inscripcion = Inscripcion::find($id);

        if (!$inscripcion) {
            return response()->json([
                'message' => 'Inscripcion no encontrada',
                'status' => 404
            ], 404);
        }

        $inscripcion->delete();

        return response()->json([
            'message' => 'Inscripcion eliminada correctamente',
            'status' => 200
        ], 200);
    }

    public function inscripcionesPorEstudiante($id)
    {
        $inscripciones = Inscripcion::where('estudiantes_id', $id)->get();

        if ($inscripciones->isEmpty()) {
            return response()->json([
                'message' => 'No hay inscripciones registradas para el estudiante',
                'status' => 200
            ], 200);
        }

        return response()->json([
            'data' => $inscripciones
        ], 200);
    }

    public function inscripcionesPorCurso($id)
    {
        $inscripciones = Inscripcion::where('cursos_id', $id)->get();

        if ($inscripciones->isEmpty()) {
            return response()->json([
                'message' => 'No hay inscripciones registradas para el curso',
                'status' => 200
            ], 200);
        }

        return response()->json([
            'data' => $inscripciones
        ], 200);
    }

    public function borrarInscripcionesPorEstudiante($id)
    {
        $inscripciones = Inscripcion::where('estudiantes_id', $id)->get();

        foreach ($inscripciones as $inscripcion) {
            $inscripcion->delete();
        }
    }

    public function borrarInscripcionesPorCurso($id)
    {
        $inscripciones = Inscripcion::where('cursos_id', $id)->get();

        foreach ($inscripciones as $inscripcion) {
            $inscripcion->delete();
        }
    }
}
