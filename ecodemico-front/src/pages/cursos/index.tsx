import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useEffect, useState, useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Nullable } from 'primereact/ts-helpers';
import { Curso } from '@/types/curso';
import { Periodo } from '@/types/periodo';
import Head from 'next/head';


export default function Cursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [visiblePUT, setVisiblePUT] = useState(false);
    const [nuevoCurso, setNuevoCurso] = useState({ codigo: '', nombre: '', docente: '', aula: '', dia: '', hora_inicio: '', hora_fin: '', periodos_academicos_id: '' });
    const [putCurso, setPutCurso] = useState({ codigo: '', nombre: '', docente: '', aula: '', dia: '', hora_inicio: '', hora_fin: '', periodos_academicos_id: '' });
    const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
    const [selectedDia, setSelectedDia] = useState<string>('');
    const [selectedPeriodo, setSelectedPeriodo] = useState<Nullable<number>>(null);
    const [hora_inicio, setHoraInicio] = useState<string>('');
    const [hora_fin, setHoraFin] = useState<string>('');

    const toast = useRef<Toast>(null);
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    useEffect(() => {
        fetch('http://localhost:8000/api/cursos')
            .then(response => response.json())
            .then(data => {
                setCursos(data.data);
                setLoading(false);
            });
        fetch('http://localhost:8000/api/periodos')
            .then(response => response.json())
            .then(data => {
                setPeriodos(data.data);
                console.log(data.data);
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNuevoCurso({ ...nuevoCurso, [id]: value });
        console.log(nuevoCurso);
    };

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPutCurso({ ...putCurso,[id]: value });
        console.log(putCurso);
    };

    const handleGuardarCurso = async () => {
        // Realizar la solicitud POST
        try {
            const response = await fetch('http://localhost:8000/api/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoCurso)
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Agregar el curso a la tabla
            setCursos([...cursos, data.data]);
            // Limpiar el formulario
            setNuevoCurso({ codigo: '', nombre: '', docente: '', aula: '', dia: '', hora_inicio: '', hora_fin: '', periodos_academicos_id: '' });
            // Cerrar el diálogo
            setVisible(false);
            showSuccess('Curso guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el curso:', error);
            showError('Error al guardar el curso');
        }
    };

    const handlePutCurso = async () => {
        console.log(selectedCurso);
        // Realizar la solicitud PUT
        try {
            console.log("curso: ", putCurso);
            // clean empty fields
            for (const key in putCurso) {
                if (putCurso[key as keyof typeof putCurso] === '') {
                    delete putCurso[key as keyof typeof putCurso];
                }
            }
            console.log(putCurso);

            const response = await fetch(`http://localhost:8000/api/cursos/${selectedCurso?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putCurso)
            });
        
            if (!response.ok) {
                const data = await response.json();
                console.log(data.errors);
                showError(data.message);
                return;
            }

            const data = await response.json();
            console.log(data);
            // Actualizar el curso en la tabla
            setCursos(cursos.map(curso => curso.id === selectedCurso?.id ? data.data : curso));
            // Limpiar el formulario
            setPutCurso({ codigo: '', nombre: '', docente: '', aula: '', dia: '', hora_inicio: '', hora_fin: '', periodos_academicos_id: '' });
            // Cerrar el diálogo
            setVisiblePUT(false);
            showSuccess('Curso actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar el curso:', error);
            showError('Error al actualizar el curso');
        }
    };

    const handleEliminarCurso = async (id: number) => {
        // Realizar la solicitud DELETE
        try {
            const response = await fetch(`http://localhost:8000/api/cursos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }
            
            const data = await response.json();

            // Eliminar el curso de la tabla
            console.log(data);
            setCursos(cursos.filter(curso => curso.id !== id));
            setSelectedCurso(null);
            showSuccess('Curso eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el curso:', error);
            showError('Error al eliminar el curso');
        }
    };


    if (isLoading) {
        return (
            <div className='p-4'>
                <h1 className='text-2xl font-bold my-4'>Cursos</h1>
                <div className='text-center'>
                    <i className='pi pi-spin pi-spinner text-4xl'></i>
                </div>
            </div>
        );
    }

    const accionesTemplate = () => (
        <div className='flex flex-row gap-1'>
            <Button icon='pi pi-pencil' className='p-button-rounded p-button-success p-mr-2' disabled={!selectedCurso} onClick={() => setVisiblePUT(true)}></Button>
            <Button icon='pi pi-trash' className='p-button-rounded p-button-danger' onClick={() => confirmEliminarCurso()} disabled={!selectedCurso}></Button>
        </div>
    );

    const agregarTemplate = () => (
        <Button label='Nuevo curso' icon='pi pi-plus' onClick={() => setVisible(true)}></Button>
    );


    const confirmEliminarCurso = () => {
        confirmDialog({
            message: '¿Estás seguro que deseas eliminar este curso? Se eliminarán todas las inscripciones asociadas.',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí',
            accept: () => handleEliminarCurso(selectedCurso!.id)
        });
    };

    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: message });
    };

    const showError = (error: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error });
    };

    const changeDia = (dia: string) => {
        console.log(dia);
        setSelectedDia(dia);
        handleInputChange({ target: { id: 'dia', value: dia } } as React.ChangeEvent<HTMLInputElement>);
    }

    const changeHoraInicio = (hora: string) => {
        setHoraInicio(hora as string);
        handleInputChange({ target: { id: 'hora_inicio', value: hora } } as React.ChangeEvent<HTMLInputElement>);
    }

    const changeHoraFin = (hora: string) => {
        console.log(hora);
        setHoraFin(hora as string);
        handleInputChange({ target: { id: 'hora_fin', value: hora } } as React.ChangeEvent<HTMLInputElement>);
    }

    const changePeriodo = (periodo: number) => {
        setSelectedPeriodo(periodo);
        handleInputChange({ target: { id: 'periodos_academicos_id', value: periodo.toString() } } as React.ChangeEvent<HTMLInputElement>);
    }

    const changePeriodoPut = (periodo: number) => {
        setSelectedPeriodo(periodo);
        handlePutInputChange({ target: { id: 'periodos_academicos_id', value: periodo.toString() } } as React.ChangeEvent<HTMLInputElement>);
    }

    const changeDiaPut = (dia: string) => {
        setSelectedDia(dia);
        handlePutInputChange({ target: { id: 'dia', value: dia } } as React.ChangeEvent<HTMLInputElement>);
    }


    const periodoBodyTemplate = (curso: Curso) => {
        const periodo = periodos.find(periodo => periodo.id === curso.periodos_academicos_id);
        return periodo?.nombre;
    }

    return (
        <>
            <Head>
                <title>Cursos - Ecodemico</title>
            </Head>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Cursos</h1>
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
                    <Column header='Periodo' body={periodoBodyTemplate}></Column>
                </DataTable>
            </div>
            <Dialog header='Nuevo curso' visible={visible} onHide={() => setVisible(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='codigo'>Código</label>
                        <input
                            type='text'
                            id='codigo'
                            value={nuevoCurso.codigo}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={nuevoCurso.nombre}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='docente'>Docente</label>
                        <input
                            type='text'
                            id='docente'
                            value={nuevoCurso.docente}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='aula'>Aula</label>
                        <input
                            type='text'
                            id='aula'
                            value={nuevoCurso.aula}
                            onChange={handleInputChange}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='dia'>Dia</label>
                        <Dropdown
                            id='dia'
                            value={selectedDia}
                            options={dias}
                            onChange={(e: DropdownChangeEvent) => changeDia(e.value!)}
                            className='w-full'
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='hora_inicio'>Hora de inicio</label>
                        <InputMask value={hora_inicio} onChange={(e: InputMaskChangeEvent) => (changeHoraInicio(e.target.value || ''))} mask='99:99' placeholder='00:00'/>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='hora_fin'>Hora de fin</label>
                        <InputMask value={hora_fin} onChange={(e: InputMaskChangeEvent) => (changeHoraFin(e.target.value || ''))} mask='99:99' placeholder='00:00'/>
                    </div>
                    <div>
                        <label htmlFor='periodo'>Periodo</label>
                        <Dropdown
                            id='periodo'
                            value={selectedPeriodo}
                            options={periodos}
                            optionLabel='nombre'
                            optionValue='id'
                            onChange={(e: DropdownChangeEvent) => changePeriodo(e.value!)}
                            placeholder='Seleccione un periodo'
                            className='w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handleGuardarCurso}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog header='Editar curso' visible={visiblePUT} onHide={() => setVisiblePUT(false)}>
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='codigo'>Código</label>
                        <input
                            type='text'
                            id='codigo'
                            value={putCurso?.codigo}
                            onChange={handlePutInputChange}
                            placeholder={selectedCurso?.codigo}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='nombre'>Nombre</label>
                        <input
                            type='text'
                            id='nombre'
                            value={putCurso?.nombre}
                            onChange={handlePutInputChange}
                            placeholder={selectedCurso?.nombre}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='docente'>Docente</label>
                        <input
                            type='text'
                            id='docente'
                            value={putCurso?.docente}
                            onChange={handlePutInputChange}
                            placeholder={selectedCurso?.docente}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='aula'>Aula</label>
                        <input
                            type='text'
                            id='aula'
                            value={putCurso?.aula}
                            onChange={handlePutInputChange}
                            placeholder={selectedCurso?.aula}
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='dia'>Dia</label>
                        <Dropdown
                            id='dia'
                            value={selectedDia}
                            options={dias}
                            onChange={(e: DropdownChangeEvent) => changeDiaPut(e.value!)}
                            placeholder={selectedCurso?.dia}
                            className='w-full'
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='hora_inicio'>Hora de inicio</label>
                        <InputMask value={putCurso?.hora_inicio} 
                            onChange={(e: InputMaskChangeEvent) => (handlePutInputChange({ target: { id: 'hora_inicio', value: e.target.value || '' } } as React.ChangeEvent<HTMLInputElement>))}
                            mask='99:99' placeholder={selectedCurso?.hora_inicio}/>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='hora_fin'>Hora de fin</label>
                        <InputMask value={putCurso?.hora_fin} 
                            onChange={(e: InputMaskChangeEvent) => (handlePutInputChange({ target: { id: 'hora_fin', value: e.target.value || '' } } as React.ChangeEvent<HTMLInputElement>))}
                            mask='99:99' placeholder={selectedCurso?.hora_fin}/>
                    </div>
                    <div>
                        <label htmlFor='periodo'>Periodo</label>
                        <Dropdown
                            id='periodo'
                            value={selectedPeriodo}
                            options={periodos}
                            optionLabel='nombre'
                            optionValue='id'
                            onChange={(e: DropdownChangeEvent) => changePeriodoPut(e.value!)}
                            placeholder={periodos.find(periodo => periodo.id === selectedCurso?.periodos_academicos_id)?.nombre}
                            className='w-full'
                        />
                    </div>
                    <div className='flex flex-row justify-end'>
                        <Button
                            label='Guardar'
                            icon='pi pi-save'
                            className='p-button-success'
                            onClick={handlePutCurso}
                        />
                    </div>
                </div>
            </Dialog>
            <ConfirmDialog/>
            <Toast ref={toast}/>
        </>
    );
}
