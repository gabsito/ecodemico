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
import { useRouter } from 'next/router';

export default function PortalEstudiante() {
    const router = useRouter();
    const { id } = router.query;
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
        if (!router.isReady) return;
        if (!id) return;

        const cargarDatos = async () => {
            try {
                setLoading(true);
                
                const [estudianteRes, cursosRes, inscripcionesRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/estudiantes/${id}`),
                    fetch(`http://localhost:8000/api/cursos`),
                    fetch(`http://localhost:8000/api/estudiantes/${id}/inscripciones`)
                ]);

                const [estudianteData, cursosData, inscripcionesData] = await Promise.all([
                    estudianteRes.json(),
                    cursosRes.json(),
                    inscripcionesRes.json()
                ]);

                setEstudiante(estudianteData.data);
                setCursosDisponibles(cursosData.data);
                setInscripciones(inscripcionesData.data);

            } catch (error) {
                console.error('Error al cargar datos:', error);
                showError('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [router.isReady, id]);

    useEffect(() => {
        if (cursosDisponibles.length > 0 && inscripciones.length > 0) {
            const cursosFiltrados = cursosDisponibles.filter(curso =>
                inscripciones.some(inscripcion => inscripcion.cursos_id === curso.id)
            );
            setCursos(cursosFiltrados);
        }
    }, [cursosDisponibles, inscripciones]);

    const handlePutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEstudiante(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handlePutEstudiante = async () => {
        try {
            if (!estudiante) return;

            const updatedData = {
                ...estudiante,
                matricula: estudiante.matricula || undefined,
                nombre: estudiante.nombre || undefined,
                correo: estudiante.correo || undefined
            };

            const response = await fetch(`http://localhost:8000/api/estudiantes/${estudiante.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.message);
                return;
            }

            setEstudiante(data.data);
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
        });
    };

    const inscribirCurso = async () => {
        try {
            if (!id || !selectedCurso) {
                showError('Datos incompletos para la inscripción');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/inscripciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estudiantes_id: Number(id),
                    cursos_id: selectedCurso.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                showError(data.message);
                return;
            }

            const data = await response.json();
            setInscripciones(prev => [...prev, data.data]);
            setCursos(prev => [...prev, selectedCurso]);
            setVisible(false);
            showSuccess('Curso inscrito correctamente');
        } catch (error) {
            console.error('Error al inscribir el curso:', error);
            showError('Error al inscribir el curso');
        }
    };

    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: message });
    };

    const showError = (error: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error });
    };

    if (!router.isReady || !id) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <i className='pi pi-spin pi-spinner text-4xl'></i>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <i className='pi pi-spin pi-spinner text-4xl'></i>
                <span className='ml-2'>Cargando datos...</span>
            </div>
        );
    }

    const accionesTemplate = () => (
        <div className='flex flex-row gap-1'>
            <Button 
                icon='pi pi-pencil' 
                className='p-button-rounded p-button-success p-mr-2' 
                onClick={() => setVisiblePUT(true)}
            />
        </div>
    );

    const agregarTemplate = () => (
        <Button 
            label='Inscribirme a un curso' 
            icon='pi pi-plus' 
            onClick={() => setVisible(true)}
        />
    );

    const descargarReporte = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/PDF/estudiante/${id}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener el PDF');
            }

            const data = await response.json();

            if (data.status === 'success' && data.pdf) {
                const pdfContent = `data:application/pdf;base64,${data.pdf}`;
                setPdfUrl(pdfContent);

            } else {
                showError('Error al generar el PDF');
            }
        } catch (error) {
            console.error(error);
            showError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'reporte.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <Head>
                <title>Portal del Estudiante - Ecodemico</title>
            </Head>
            <div className='p-4'>
                <div className='flex flex-row justify-between align-items-center'>
                    <h1 className='text-2xl font-bold my-4'>Mis Cursos</h1>
                    <Button label={`Ver reporte de ${estudiante?.nombre}`} icon='pi pi-user' onClick={() => descargarReporte()}/>
                </div>
            </div>
            <Toolbar start={accionesTemplate} end={agregarTemplate} />
            <DataTable 
                value={cursos} 
                selectionMode='single' 
                selection={selectedCurso}
                onSelectionChange={e => setSelectedCurso(e.value as Curso)}
                dataKey='id' 
                className='p-datatable-striped'
                paginator 
                rows={5} 
                rowsPerPageOptions={[5, 10, 25]}
            >
                <Column field='codigo' header='Código' />
                <Column field='nombre' header='Nombre' />
                <Column field='docente' header='Docente' />
                <Column field='aula' header='Aula' />
                <Column field='dia' header='Día' />
                <Column field='hora_inicio' header='Hora de inicio' />
                <Column field='hora_fin' header='Hora de fin' />
            </DataTable>

            <Dialog 
                header='Editar estudiante' 
                visible={visiblePUT} 
                onHide={() => setVisiblePUT(false)}
            >
                <div className='flex flex-column gap-2'>
                    <div>
                        <label htmlFor='matricula'>Matrícula</label>
                        <input
                            type='text'
                            id='matricula'
                            value={estudiante?.matricula}
                            onChange={handlePutInputChange}
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
                            className='p-inputtext w-full'
                        />
                    </div>
                    <div>
                        <label htmlFor='correo'>Correo</label>
                        <input
                            type='text'
                            id='correo'
                            value={estudiante?.correo}
                            onChange={handlePutInputChange}
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

            <Dialog 
                header='Cursos disponibles' 
                visible={visible} 
                onHide={() => setVisible(false)}
            >
                <DataTable 
                    value={cursosDisponibles} 
                    selectionMode='single' 
                    selection={selectedCurso}
                    onSelectionChange={e => setSelectedCurso(e.value as Curso)}
                    dataKey='id' 
                    className='p-datatable-striped'
                    paginator 
                    rows={5} 
                    rowsPerPageOptions={[5, 10, 25]}
                >
                    <Column field='codigo' header='Código' />
                    <Column field='nombre' header='Nombre' />
                    <Column field='docente' header='Docente' />
                    <Column field='aula' header='Aula' />
                    <Column field='dia' header='Día' />
                    <Column field='hora_inicio' header='Hora de inicio' />
                    <Column field='hora_fin' header='Hora de fin' />
                </DataTable>
                <div className='flex flex-row justify-end gap-2 mt-4'>
                    <Button 
                        label='Cancelar' 
                        outlined 
                        icon='pi pi-times' 
                        onClick={() => setVisible(false)} 
                    />
                    <Button 
                        label='Inscribirme' 
                        icon='pi pi-check' 
                        onClick={confirmarRegistro} 
                        disabled={!selectedCurso}
                    />
                </div>
            </Dialog>
            <ConfirmDialog />
            <Toast ref={toast} />

            {pdfUrl && (
                <div className="mt-4 p-4">
                    <div className="flex justify-end mb-2">
                        <Button 
                            label="Descargar PDF" 
                            icon="pi pi-download" 
                            onClick={downloadPDF}
                            className="p-button-secondary"
                        />
                    </div>
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[600px] border border-gray-200 rounded-lg"
                        title="PDF Viewer"
                    />
                </div>
            )}
        </>
    );
}