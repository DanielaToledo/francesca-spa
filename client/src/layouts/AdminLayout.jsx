import Sidebar from '../components/common/Sidebar' 
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Insertamos nuestra barra lateral modularizada */}
      <Sidebar />

      {/* Espacio para el contenido de las páginas internas */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Aquí React Router renderiza el Dashboard que corresponda */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}