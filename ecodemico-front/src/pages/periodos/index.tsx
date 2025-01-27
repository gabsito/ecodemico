import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useEffect, useState, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Periodo } from '@/types/periodo';
import Head from 'next/head';


export default function Periodos() {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visiblePUT, setVisiblePUT] = useState(false);
    const [nuevoPeriodo, setNuevoPeriodo] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    const [putPeriodo, setPutPeriodo] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);

    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/periodos')
            .then(response => response.json())
            .then(data => {
                setPeriodos(data.data);
                setLoading(false);
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNuevoPeriodo({ ...nuevoPeriodo, [id]: value });
    };

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        console.log(putPeriodo);
        setPutPeriodo({ ...putPeriodo,[id]: value });
    };

    const handleGuardarPeriodo = () => {
        // Realizar la solicitud POST
        fetch('http://localhost:8000/api/periodos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoPeriodo)
        })
            .then(response => response.json())
            .then(data => {
                // Agregar el nuevo periodo a la tabla
                console.log(data);
                setPeriodos([...periodos, data.data]);
                // Limpiar el formulario
                setNuevoPeriodo({ nombre: '', fecha_inicio: '', fecha_fin: '' });
                // Cerrar el diálogo
                setVisible(false);
                showSuccess('Periodo guardado correctamente');
            })
            .catch(error => console.error('Error al guardar el periodo:', error));
    };

    const handlePutPeriodo = async () => {
        console.log(selectedPeriodo);
        // Realizar la solicitud PUT
        try {
            // clean empty fields
            for (const key in putPeriodo) {
                if (putPeriodo[key as keyof typeof putPeriodo] === '') {
                    delete putPeriodo[key as keyof typeof putPeriodo];
                }
            }

            const response = await fetch(`http://localhost:8000/api/periodos/${selectedPeriodo?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putPeriodo)
            });
        
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Actualizar el periodo en la tabla
            setPeriodos(periodos.map(periodo => periodo.id === selectedPeriodo?.id ? data.data : periodo));
            // Limpiar el formulario
            setPutPeriodo({ nombre: '', fecha_inicio: '', fecha_fin: '' });
            // Cerrar el diálogo
            setVisiblePUT(false);
            showSuccess('Periodo actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar el periodo:', error);
            showError('Error al actualizar el periodo');
        }
    };

    const handleEliminarPeriodo = async (id: number) => {
        // Realizar la solicitud DELETE
        try {
            const response = await fetch(`http://localhost:8000/api/periodos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }
            
            const data = await response.json();

            // Eliminar el periodo de la tabla
            console.log(data);
            setPeriodos(periodos.filter(periodo => periodo.id !== id));
            setSelectedPeriodo(null);
            showSuccess('Periodo eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el periodo:', error);
            showError('Error al eliminar el periodo');
        }
    };


    if (isLoading) {
        return (
            <div className='p-4'>
                <h1 className='text-2xl font-bold my-4'>Periodos</h1>
                <div className='text-center'>
                    <i className='pi pi-spin pi-spinner text-4xl'></i>
                </div>
            </div>
        );
    }

    const accionesTemplate = () => (
        <div className='flex flex-row gap-1'>
            <Button icon='pi pi-pencil' className='p-button-rounded p-button-success p-mr-2' disabled={!selectedPeriodo} onClick={() => setVisiblePUT(true)}></Button>
            <Button icon='pi pi-trash' className='p-button-rounded p-button-danger' onClick={() => confirmEliminarPeriodo()} disabled={!selectedPeriodo}></Button>
        </div>
    );

    const agregarTemplate = () => (
        <Button label='Nuevo periodo' icon='pi pi-plus' onClick={() => setVisible(true)}></Button>
    );


    const confirmEliminarPeriodo = () => {
        confirmDialog({
            message: '¿Estás seguro que deseas eliminar este periodo?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí',
            accept: () => handleEliminarPeriodo(selectedPeriodo!.id)
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
            <Head>
                <title>Periodos - Ecodemico</title>
            </Head>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Periodos</h1>
                </div>
                <Toolbar start= {accionesTemplate} end={agregarTemplate}></Toolbar>
                <DataTable value={periodos} selectionMode={'single'} selection={selectedPeriodo}
                    onSelectionChange={e => setSelectedPeriodo(e.value as Periodo)}
                    dataKey='id' className='p-datatable-striped'
                    paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column field='id' header='ID'></Column>
                    <Column field='nombre' header='Nombre'></Column>
                    <Column field='fecha_inicio' header='Fecha de inicio'></Column>
                    <Column field='fecha_fin' header='Fecha de fin'></Column>
                </DataTable>
            </div>
            <Dialog header='Nuevo periodo' visible={visible} onHide={() => setVisible(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={nuevoPeriodo.nombre}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='fecha_inicio'>Fecha de inicio</label>
                        <input
                            type='date'
                            id='fecha_inicio'
                            value={nuevoPeriodo.fecha_inicio}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='fecha_fin'>Fecha de fin</label>
                        <input
                            type='date'
                            id='fecha_fin'
                            value={nuevoPeriodo.fecha_fin}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handleGuardarPeriodo}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog header='Editar periodo' visible={visiblePUT} onHide={() => setVisiblePUT(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={putPeriodo?.nombre}
                            onChange={handlePutInputChange}
                            placeholder={selectedPeriodo?.nombre}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='fecha_inicio'>Fecha de inicio</label>
                        <input
                            type='date'
                            id='fecha_inicio'
                            value={putPeriodo?.fecha_inicio}
                            onChange={handlePutInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='fecha_fin'>Fecha de fin</label>
                        <input
                            type='date'
                            id='fecha_fin'
                            value={putPeriodo?.fecha_fin}
                            onChange={handlePutInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handlePutPeriodo}
                        />
                    </div>
                </div>
            </Dialog>
            <ConfirmDialog/>
            <Toast ref={toast}/>
        </>
    );
}
