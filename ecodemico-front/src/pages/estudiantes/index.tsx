import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useEffect, useState, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Estudiante } from '@/types/estudiante';


export default function Estudiantes() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visiblePUT, setVisiblePUT] = useState(false);
    const [nuevoEstudiante, setNuevoEstudiante] = useState({ matricula: '', nombre: '', correo: '' });
    const [putEstudiante, setPutEstudiante] = useState({ matricula: '', nombre: '', correo: '' });
    const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/estudiantes')
            .then(response => response.json())
            .then(data => {
                setEstudiantes(data.data);
                setLoading(false);
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNuevoEstudiante({ ...nuevoEstudiante, [id]: value });
        console.log(nuevoEstudiante);
    };

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPutEstudiante({ ...putEstudiante,[id]: value });
        console.log(putEstudiante);
    };

    const handleGuardarEstudiante = async () => {
        // Realizar la solicitud POST
        try {
            const response = await fetch('http://localhost:8000/api/estudiantes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoEstudiante)
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Agregar el estudiante a la tabla
            setEstudiantes([...estudiantes, data.data]);
            // Limpiar el formulario
            setNuevoEstudiante({ matricula: '', nombre: '', correo: '' });
            setVisible(false);
            showSuccess('Estudiante guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el estudiante:', error);
            showError('Error al guardar el estudiante');
        }
    };

    const handlePutEstudiante = async () => {
        console.log(selectedEstudiante);
        // Realizar la solicitud PUT
        try {
            console.log("estudiante: ", putEstudiante);
            // clean empty fields
            for (const key in putEstudiante) {
                if (putEstudiante[key as keyof typeof putEstudiante] === '') {
                    delete putEstudiante[key as keyof typeof putEstudiante];
                }
            }
            console.log(putEstudiante);

            const response = await fetch(`http://localhost:8000/api/estudiantes/${selectedEstudiante?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putEstudiante)
            });
        
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Actualizar el estudiante en la tabla
            setEstudiantes(estudiantes.map(estudiante => estudiante.id === selectedEstudiante?.id ? data.data : estudiante));
            // Limpiar el formulario
            setPutEstudiante({ matricula: '', nombre: '', correo: '' });
            // Cerrar el diálogo
            setVisiblePUT(false);
            showSuccess('Estudiante actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar el estudiante:', error);
            showError('Error al actualizar el estudiante');
        }
    };

    const handleEliminarEstudiante = async (id: number) => {
        // Realizar la solicitud DELETE
        try {
            const response = await fetch(`http://localhost:8000/api/estudiantes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }
            
            const data = await response.json();

            // Eliminar el estudiante de la tabla
            console.log(data);
            setEstudiantes(estudiantes.filter(estudiante => estudiante.id !== id));
            setSelectedEstudiante(null);
            showSuccess('Estudiante eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el estudiante:', error);
            showError('Error al eliminar el estudiante');
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
            <Button icon='pi pi-pencil' className='p-button-rounded p-button-success p-mr-2' disabled={!selectedEstudiante} onClick={() => setVisiblePUT(true)}></Button>
            <Button icon='pi pi-trash' className='p-button-rounded p-button-danger' onClick={() => confirmEliminarEstudiante()} disabled={!selectedEstudiante}></Button>
        </div>
    );

    const agregarTemplate = () => (
        <Button label='Nuevo estudiante' icon='pi pi-plus' onClick={() => setVisible(true)}></Button>
    );


    const confirmEliminarEstudiante = () => {
        confirmDialog({
            message: '¿Estás seguro que deseas eliminar este estudiante? Se eliminarán todas las inscripciones asociadas.',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí',
            accept: () => handleEliminarEstudiante(selectedEstudiante!.id)
        });
    };

    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: message });
    };

    const showError = (error: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error });
    };

    return (
        <>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Estudiantes</h1>
                </div>
                <Toolbar start= {accionesTemplate} end={agregarTemplate}></Toolbar>
                <DataTable value={estudiantes} selectionMode={'single'} selection={selectedEstudiante}
                    onSelectionChange={e => setSelectedEstudiante(e.value as Estudiante)}
                    dataKey='id' className='p-datatable-striped'
                >
                    <Column field='matricula' header='Matricula'></Column>
                    <Column field='nombre' header='Nombre'></Column>
                    <Column field='correo' header='Correo'></Column>
                </DataTable>
            </div>
            <Dialog header='Nuevo estudiante' visible={visible} onHide={() => setVisible(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='codigo'>Matricula</label>
                        <input
                            type='text'
                            id='matricula'
                            value={nuevoEstudiante.matricula}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={nuevoEstudiante.nombre}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='docente'>Correo</label>
                        <input
                            type='text'
                            id='correo'
                            value={nuevoEstudiante.correo}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handleGuardarEstudiante}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog header='Editar estudiante' visible={visiblePUT} onHide={() => setVisiblePUT(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='codigo'>Matricula</label>
                        <input
                            type='text'
                            id='matricula'
                            value={putEstudiante?.matricula}
                            onChange={handlePutInputChange}
                            placeholder={selectedEstudiante?.matricula}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={putEstudiante?.nombre}
                            onChange={handlePutInputChange}
                            placeholder={selectedEstudiante?.nombre}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='docente'>Correo</label>
                        <input
                            type='text'
                            id='correo'
                            value={putEstudiante?.correo}
                            onChange={handlePutInputChange}
                            placeholder={selectedEstudiante?.correo}
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
            <ConfirmDialog/>
            <Toast ref={toast}/>
        </>
    );
}
