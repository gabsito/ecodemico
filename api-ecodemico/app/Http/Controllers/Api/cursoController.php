<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\inscripcionController;
use App\Models\Curso;

class cursoController extends Controller
{
    public function index()
    {
        $cursos = Curso::all();

        if ($cursos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron cursos'], 404);
        }

        return response()->json(['data' => $cursos], 200);
    }    

    public function show($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        return response()->json(['data' => $curso], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|max:255',
            'codigo' => 'required|max:10|unique:cursos,codigo',
            'docente' => 'required|max:255',
            'aula' => 'required|max:255',
            'dia' => 'required|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'periodos_academicos_id' => 'required|exists:periodos_academicos,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        // // validar que un curso no tenga el mismo horario en la misma aula
        // $curso = Curso::where('dia', $request->dia)
        //     ->where('aula', $request->aula)
        //     ->where('hora_inicio', '<', $request->hora_fin)
        //     ->where('hora_fin', '>', $request->hora_inicio)
        //     ->first();

        // validar que un curso no tenga horarios cruzados en la misma aula
        $curso = Curso::where('dia', $request->dia)
            ->where('aula', $request->aula)
            ->where(function ($query) use ($request) {
                $query->where('hora_inicio', '<', $request->hora_fin)
                    ->where('hora_fin', '>', $request->hora_inicio);
            })
            ->first();

        if ($curso) {
            return response()->json(['message' => 'Ya existe un curso en ese horario y aula'], 400);
        }

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        $curso = Curso::create($request->all());

        if (!$curso) {
            return response()->json(['message' => 'Ocurrio un error al registrar el curso'], 500);
        }

        return response()->json(['data' => $curso], 201);
    }

    public function update(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $curso->update($request->all());

        return response()->json(['data' => $curso], 200);
    }

    public function destroy($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        // borrar inscripciones
        app(inscripcionController::class)->borrarInscripcionesPorCurso($curso->id);

        $curso->delete();

        return response()->json(['message' => 'Curso eliminado'], 200);
    }

    public function updatePartial(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'max:255',
            'codigo' => 'max:10',
            'docente' => 'max:255',
            'aula' => 'max:255',
            'dia' => 'in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
            'hora_inicio' => 'date_format:H:i',
            'hora_fin' => 'date_format:H:i',
            'periodos_academicos_id' => 'exists:periodos_academicos,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos incorrectos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('nombre')) {
            $curso->nombre = $request->nombre;
        }

        if ($request->has('codigo')) {
            $curso->codigo = $request->codigo;
        }

        if ($request->has('docente')) {
            $curso->docente = $request->docente;
        }

        if ($request->has('aula')) {
            $curso->aula = $request->aula;
        }

        if ($request->has('dia')) {
            $curso->dia = $request->dia;
        }

        if ($request->has('hora_inicio')) {
            $curso->hora_inicio = $request->hora_inicio;
        }

        if ($request->has('hora_fin')) {
            $curso->hora_fin = $request->hora_fin;
        }

        if ($request->has('periodos_academicos_id')) {
            $curso->periodos_academicos_id = $request->periodos_academicos_id;
        }

        $curso->save();

        return response()->json(['data' => $curso], 200);
    }

    public function cursosPorPeriodo($id)
    {
        $cursos = Curso::where('periodos_academicos_id', $id)->get();

        if ($cursos->isEmpty()) {
            return response()->json('No se encontraron cursos para el periodo academico', 404);
        }

        return response()->json(['data' => $cursos], 200);
    }

}
