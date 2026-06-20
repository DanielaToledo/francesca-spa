import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function MainLayout() {
  return (
    // 'h-screen' fija el layout a la altura total de la ventana, 'overflow-hidden' evita el scroll doble
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-100">
        <Outlet />
      </main>
    </div>
  );
}