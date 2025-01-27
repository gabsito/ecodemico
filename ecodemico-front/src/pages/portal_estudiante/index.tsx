
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useEffect, useState, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Estudiante } from '@/types/estudiante';
import { Inscripcion } from '@/types/inscripcion';
import { Curso } from '@/types/curso';
import Head from 'next/head';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


export default function PortalEstudiante({estudiante_id = 1}: {estudiante_id: number}) {

    const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visiblePUT, setVisiblePUT] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

    const toast = useRef<Toast>(null);

    useEffect(() => {
        const fetchEstudiante = async () => {
            const response = await fetch(`http://localhost:8000/api/estudiantes/${estudiante_id}`);
            const data = await response.json();
            setEstudiante(data.data);
        };
    
        const fetchCursos = async () => {
            const response = await fetch(`http://localhost:8000/api/cursos`);
            const data = await response.json();
            setCursosDisponibles(data.data);
        };
    
        const fetchInscripciones = async () => {
            const response = await fetch(`http://localhost:8000/api/estudiantes/${estudiante_id}/inscripciones`);
            const data = await response.json();
            setInscripciones(data.data);
        };
    
        const cargarDatos = async () => {
            setLoading(true);
            await Promise.all([fetchEstudiante(), fetchCursos(), fetchInscripciones()]);
            setLoading(false);
        };
    
        cargarDatos();
    }, [estudiante_id]);
    
    useEffect(() => {
        // Actualiza la lista de cursos después de que las inscripciones y los cursos estén cargados
        if (cursosDisponibles.length > 0 && inscripciones.length > 0) {
            const cursosFiltrados = cursosDisponibles.filter(curso =>
                inscripciones.some(inscripcion => inscripcion.cursos_id === curso.id)
            );
            setCursos(cursosFiltrados);
        }
    }, [cursosDisponibles, inscripciones]);
    

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEstudiante({ ...estudiante!,[id]: value });
        console.log(estudiante);
    };


    const handlePutEstudiante = async () => {
        // Realizar la solicitud PUT
        try {
            console.log("estudiante: ", estudiante);
            // clean empty fields
            for (const key in estudiante) {
                if (estudiante[key as keyof typeof estudiante] === '') {
                    delete estudiante[key as keyof typeof estudiante];
                }
            }
            console.log(estudiante);

            const response = await fetch(`http://localhost:8000/api/estudiantes/${estudiante?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estudiante)
            });
        
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Actualizar el estudiante en la vista
            setEstudiante(data.data);
            // Cerrar el diálogo
            setVisiblePUT(false);
            showSuccess('Estudiante actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar el estudiante:', error);
            showError('Error al actualizar el estudiante');
        }
    };

    const confirmarRegistro = () => {
        confirmDialog({
            message: '¿Estás seguro de inscribirte a este curso?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await inscribirCurso();
            }
        })
    };

    const inscribirCurso = async () => {
        setVisible(false);
        try {
            const response = await fetch(`http://localhost:8000/api/inscripciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estudiantes_id: estudiante_id,
                    cursos_id: selectedCurso?.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }

            window.location.reload();
        }
        catch (error) {
            console.error('Error al inscribir el curso:', error);
            showError('Error al inscribir el curso');
        }
    };


    if (isLoading) {
        return (
            <div className='p-4'>
                <h1 className='text-2xl font-bold my-4'>Estudiantes</h1>
                <div className='text-center'>
                    <i className='pi pi-spin pi-spinner text-4xl'></i>
                </div>
            </div>
        );
    }

    const accionesTemplate = () => (
        <div className='flex flex-row gap-1'>
            <Button icon='pi pi-pencil' className='p-button-rounded p-button-success p-mr-2'  onClick={() => setVisiblePUT(true)}></Button>
        </div>
    );

    const agregarTemplate = () => (
        <Button label='Inscribirme a un curso' icon='pi pi-plus' onClick={() => setVisible(true)}></Button>
    );


    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: message });
    };

    const showError = (error: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error });
    };

    return (
        <>
            <Head>
                <title>Portal del Estudiante - Ecodemico</title>
            </Head>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Mis Cursos</h1>
                    <Button label={estudiante?.nombre} icon='pi pi-user'></Button>
                </div>
            </div>
            <Toolbar start= {accionesTemplate} end={agregarTemplate}></Toolbar>
            <DataTable value={cursos} selectionMode={'single'} selection={selectedCurso}
                    onSelectionChange={e => setSelectedCurso(e.value as Curso)}
                    dataKey='id' className='p-datatable-striped'
                    paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column field='codigo' header='Codigo'></Column>
                    <Column field='nombre' header='Nombre'></Column>
                    <Column field='docente' header='Docente'></Column>
                    <Column field='aula' header='Aula'></Column>
                    <Column field='dia' header='Dia'></Column>
                    <Column field='hora_inicio' header='Hora de inicio'></Column>
                    <Column field='hora_fin' header='Hora de fin'></Column>
                </DataTable>
            <Dialog header='Editar estudiante' visible={visiblePUT} onHide={() => setVisiblePUT(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='codigo'>Matricula</label>
                        <input
                            type='text'
                            id='matricula'
                            value={estudiante?.matricula}
                            onChange={handlePutInputChange}
                            placeholder={estudiante?.matricula}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={estudiante?.nombre}
                            onChange={handlePutInputChange}
                            placeholder={estudiante?.nombre}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='docente'>Correo</label>
                        <input
                            type='text'
                            id='correo'
                            value={estudiante?.correo}
                            onChange={handlePutInputChange}
                            placeholder={estudiante?.correo}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handlePutEstudiante}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog header='Cursos disponibles' visible={visible} onHide={() => setVisible(false)}>
                <DataTable value={cursosDisponibles} selectionMode={'single'} selection={selectedCurso}
                    onSelectionChange={e => setSelectedCurso(e.value as Curso)}
                    dataKey='id' className='p-datatable-striped'
                    paginator rows={5} rowsPerPageOptions={[5, 10, 25]}>
                    <Column field='codigo' header='Codigo'></Column>
                    <Column field='nombre' header='Nombre'></Column>
                    <Column field='docente' header='Docente'></Column>
                    <Column field='aula' header='Aula'></Column>
                    <Column field='dia' header='Dia'></Column>
                    <Column field='hora_inicio' header='Hora de inicio'></Column>
                    <Column field='hora_fin' header='Hora de fin'></Column>
                </DataTable>
                <div className='flex flex-row justify-end gap-2 mt-4'>
                    <Button label='Cancelar' outlined icon='pi pi-times' onClick={() => setVisible(false)} />
                    <Button label='Inscribirme' icon='pi pi-check' onClick={() => confirmarRegistro()} disabled={!selectedCurso}/>
                </div>
            </Dialog>
            <ConfirmDialog/>
            <Toast ref={toast}/>
        </>
    );
}
