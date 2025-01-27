import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useEffect, useState, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Inscripcion } from '@/types/inscripcion';
import { Estudiante } from '@/types/estudiante';
import { Curso } from '@/types/curso';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Nullable } from 'primereact/ts-helpers';
import Head from 'next/head';


export default function Inscripciones() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [estudiantes, setEstudiantes ] = useState<Estudiante[]>([]);
    const [cursos, setCursos ] = useState<Curso[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visiblePUT, setVisiblePUT] = useState(false);
    const [nuevoInscripcion, setNuevaInscripcion] = useState({ estudiantes_id: '', cursos_id: '' });
    const [putInscripcion, setPutInscripcion] = useState({ estudiantes_id: '', cursos_id: '' });
    const [selectedInscripcion, setSelectedInscripcion] = useState<Inscripcion | null>(null);
    const [selectedEstudiante, setSelectedEstudiante] = useState<Nullable<number>>(null);
    const [selectedCurso, setSelectedCurso] = useState<Nullable<number>>(null);

    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/inscripciones')
            .then(response => response.json())
            .then(data => {
                setInscripciones(data.data);
                setLoading(false);
            });

        fetch('http://localhost:8000/api/estudiantes')
            .then(response => response.json())
            .then(data => {
                setEstudiantes(data.data);
                setLoading(false);
            });

        fetch('http://localhost:8000/api/cursos')
            .then(response => response.json())
            .then(data => {
                setCursos(data.data);
                setLoading(false);
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNuevaInscripcion({ ...nuevoInscripcion, [id]: value });
        console.log(nuevoInscripcion);
    };

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPutInscripcion({ ...putInscripcion,[id]: value });
        console.log(putInscripcion);
    };

    const handleGuardarInscripcion = async () => {
        // Realizar la solicitud POST
        try {
            const response = await fetch('http://localhost:8000/api/inscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoInscripcion)
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Agregar el inscripcion a la tabla
            setInscripciones([...inscripciones, data.data]);
            // Limpiar el formulario
            setNuevaInscripcion({ estudiantes_id: '', cursos_id: '' });
            setVisible(false);
            showSuccess('Inscripcion guardado correctamente');
            // refresh page
            window.location.reload();
        } catch (error) {
            console.error('Error al guardar el inscripcion:', error);
            showError('Error al guardar el inscripcion');
        }
    };

    const handlePutInscripcion = async () => {
        console.log(selectedInscripcion);
        // Realizar la solicitud PUT
        try {
            console.log("inscripcion: ", putInscripcion);
            // clean empty fields
            for (const key in putInscripcion) {
                if (putInscripcion[key as keyof typeof putInscripcion] === '') {
                    delete putInscripcion[key as keyof typeof putInscripcion];
                }
            }
            console.log(putInscripcion);

            const response = await fetch(`http://localhost:8000/api/inscripciones/${selectedInscripcion?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putInscripcion)
            });
        
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Actualizar el inscripcion en la tabla
            setInscripciones(inscripciones.map(inscripcion => inscripcion.id === selectedInscripcion!.id ? data.data : inscripcion));
            // Limpiar el formulario
            setPutInscripcion({ estudiantes_id: '', cursos_id: '' });
            // Cerrar el diálogo
            setVisiblePUT(false);
            showSuccess('Inscripcion actualizado correctamente');

            // refresh page
            window.location.reload();
        } catch (error) {
            console.error('Error al actualizar el inscripcion:', error);
            showError('Error al actualizar el inscripcion');
        }
    };

    const handleEliminarInscripcion = async (id: number) => {
        // Realizar la solicitud DELETE
        try {
            const response = await fetch(`http://localhost:8000/api/inscripciones/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }
            
            const data = await response.json();

            // Eliminar el inscripcion de la tabla
            console.log(data);
            setInscripciones(inscripciones.filter(inscripcion => inscripcion.id !== id));
            setSelectedInscripcion(null);
            showSuccess('Inscripcion eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar la inscripcion:', error);
            showError('Error al eliminar la inscripcion');
        }
    };

    const changeEstudiantePut = (estudiante_id: number) => {
        setSelectedEstudiante(estudiante_id);
        handlePutInputChange({ target: { id: 'estudiantes_id', value: estudiante_id.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };

    const ChangeCursoPut = (curso_id: number) => {
        setSelectedCurso(curso_id);
        handlePutInputChange({ target: { id: 'cursos_id', value: curso_id.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };

    const changeEstudiante = (estudiante_id: number) => {
        setSelectedEstudiante(estudiante_id);
        handleInputChange({ target: { id: 'estudiantes_id', value: estudiante_id.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };

    const changeCurso = (curso_id: number) => {
        setSelectedCurso(curso_id);
        handleInputChange({ target: { id: 'cursos_id', value: curso_id.toString() } } as React.ChangeEvent<HTMLInputElement>);
    };


    if (isLoading) {
        return (
            <div className='p-4'>
                <h1 className='text-2xl font-bold my-4'>Inscripciones</h1>
                <div className='text-center'>
                    <i className='pi pi-spin pi-spinner text-4xl'></i>
                </div>
            </div>
        );
    }

    const accionesTemplate = () => (
        <div className='flex flex-row gap-1'>
            <Button icon='pi pi-pencil' className='p-button-rounded p-button-success p-mr-2' disabled={!selectedInscripcion} onClick={() => setVisiblePUT(true)}></Button>
            <Button icon='pi pi-trash' className='p-button-rounded p-button-danger' onClick={() => confirmEliminarInscripcion()} disabled={!selectedInscripcion}></Button>
        </div>
    );

    const agregarTemplate = () => (
        <Button label='Nueva inscripcion' icon='pi pi-plus' onClick={() => setVisible(true)}></Button>
    );


    const confirmEliminarInscripcion = () => {
        confirmDialog({
            message: '¿Estás seguro que deseas eliminar esta inscripcion?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí',
            accept: () => handleEliminarInscripcion(selectedInscripcion!.id)
        });
    };

    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: message });
    };

    const showError = (error: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error });
    };

    const cursoBodyTemplate = (rowData: Inscripcion) => {
        const curso = cursos.find(curso => curso.id === rowData.cursos_id);
        return curso ? curso.nombre : 'Curso no encontrado';
    };

    const estudianteBodyTemplate = (rowData: Inscripcion) => {
        const estudiante = estudiantes.find(estudiante => estudiante.id === rowData.estudiantes_id);
        return estudiante ? estudiante.nombre : 'Estudiante no encontrado';
    };

    return (
        <>
        <Head>
            <title>Inscripciones - Ecodemico</title>
        </Head>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Inscripciones</h1>
                </div>
                <Toolbar start= {accionesTemplate} end={agregarTemplate}></Toolbar>
                <DataTable value={inscripciones} selectionMode={'single'} selection={selectedInscripcion}
                    onSelectionChange={e => setSelectedInscripcion(e.value as Inscripcion)}
                    dataKey='id' className='p-datatable-striped'
                    paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column field='id' header='ID'></Column>
                    <Column header='Curso' body={cursoBodyTemplate}></Column>
                    <Column header='Estudiante' body={estudianteBodyTemplate}></Column>
                </DataTable>
            </div>
            <Dialog header='Nueva inscripcion' visible={visible} onHide={() => setVisible(false)}>
                <div className='flex flex-column gap-2'>
                    <div className='flex flex-column gap-2'>
                        <label htmlFor='estudiante'>Estudiante</label>
                        <Dropdown id='estudiante' value={selectedEstudiante} 
                            options={estudiantes} optionLabel='nombre' 
                            optionValue='id' placeholder='Seleccione un estudiante'
                            onChange={(e: DropdownChangeEvent) => changeEstudiante(e.value!)}    
                        />
                    </div>
                    <div className='flex flex-column gap-2'>
                        <label htmlFor='curso'>Curso</label>
                        <Dropdown id='curso' value={selectedCurso}
                            options={cursos} optionLabel='nombre'
                            optionValue='id' placeholder='Seleccione un curso'
                            onChange={(e: DropdownChangeEvent) => changeCurso(e.value!)}
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handleGuardarInscripcion}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog header='Editar inscripcion' visible={visiblePUT} onHide={() => setVisiblePUT(false)}>
                <div className='flex flex-column gap-2'>
                    <div className='flex flex-column gap-2'>
                        <label htmlFor='estudiante'>Estudiante</label>
                        <Dropdown id='estudiante' value={selectedEstudiante}
                            options={estudiantes} optionLabel='nombre'
                            optionValue='id' placeholder={estudiantes.find(estudiante => estudiante.id === selectedInscripcion?.estudiantes_id)?.nombre}
                            onChange={(e: DropdownChangeEvent) => changeEstudiantePut(e.value!)}
                        />
                    </div>
                    <div className='flex flex-column gap-2'>
                        <label htmlFor='curso'>Curso</label>
                        <Dropdown id='curso' value={selectedCurso}
                            options={cursos} optionLabel='nombre'
                            optionValue='id' placeholder={cursos.find(curso => curso.id === selectedInscripcion?.cursos_id)?.nombre}
                            onChange={(e: DropdownChangeEvent) => ChangeCursoPut(e.value!)}
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handlePutInscripcion}
                        />
                    </div>
                </div>
            </Dialog>
            <ConfirmDialog/>
            <Toast ref={toast}/>
        </>
    );
}
