import Head from "next/head";
import { Button } from "primereact/button";
import { useState } from "react";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export default function Home() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const showError = (message: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 3000
        });
    };

    const reporte = async (tablename: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8000/api/PDF/${tablename}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener el PDF');
            }

            const data = await response.json();

            if (data.status === 'success' && data.pdf) {
                // Crear URL del PDF desde base64
                const pdfContent = `data:application/pdf;base64,${data.pdf}`;
                setPdfUrl(pdfContent);

                // Opcionalmente, puedes abrir en una nueva pestaña
                // window.open(pdfContent, '_blank');
            } else {
                showError('Error al generar el PDF');
            }
        } catch (error) {
            console.error(error);
            showError('Error al conectar con el servidor');
        } finally {
            setIsLoading(false);
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
                <title>Reportes - Ecodemico</title>
            </Head>
            <Toast ref={toast} />
            <div className='p-4'>
                <div className='flex flex-row justify-between items-center'>
                    <h1 className='text-2xl font-bold my-4'>Reportes</h1>
                </div>
            </div>
            <div className="flex flex-col gap-4 items-center p-4">
                <Button 
                    label='Ver reporte Estudiantes' 
                    onClick={() => reporte("estudiantes")}
                    loading={isLoading}
                    className="w-64"
                />
                <Button 
                    label='Ver reporte Inscripciones' 
                    onClick={() => reporte("inscripciones")}
                    loading={isLoading}
                    className="w-64"
                />
                <Button 
                    label='Ver reporte Cursos' 
                    onClick={() => reporte("cursos")}
                    loading={isLoading}
                    className="w-64"
                />
                <Button 
                    label='Ver reporte Periodos Académicos' 
                    onClick={() => reporte("periodos")}
                    loading={isLoading}
                    className="w-64"
                />
            </div>

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