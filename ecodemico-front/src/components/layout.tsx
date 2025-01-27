import { Menu } from 'primereact/menu';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const routes = [
    {template : () => <h1 className='text-center text-2xl font-bold my-4'>Ecodemico</h1>},
    {label: 'Dashboard', icon: 'pi pi-fw pi-home', url: '/'},
    {label: 'Periodos', icon: 'pi pi-fw pi-calendar', url: '/periodos'},
  ]

  return (
    <div className='flex flex-row h-screen'>
        <Menu model={routes} className='w-1/6 h-full'/>
        <main className='w-5/6 p-4'>
            {children}
        </main>
    </div>
  );
}