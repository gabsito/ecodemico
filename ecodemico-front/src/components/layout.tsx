import { Menu } from 'primereact/menu';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
const routes = [
    {template : () => <h1 className='text-center text-2xl font-bold my-4'>Ecodemico</h1>},
    {label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', url: '/'},
    {label: 'Periodos', icon: 'pi pi-fw pi-calendar', url: '/periodos'},
    {label: 'Cursos', icon: 'pi pi-fw pi-book', url: '/cursos'},
    {label: 'Estudiantes', icon: 'pi pi-fw pi-users', url: '/estudiantes'},
    {label: 'Inscripciones', icon: 'pi pi-fw pi-pencil', url: '/inscripciones'},
  ]

  return (
    <div className='flex flex-row h-screen'>
        <Menu model={routes} className='w-1/6 h-full'/>
        <main className='w-5/6 p-4 overflow-y-auto'>
            {children}
        </main>
    </div>
  );
}