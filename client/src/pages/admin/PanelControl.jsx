import { useEffect, useState } from 'react'
import { serviciosService } from '../../services/servicioService'

export default function PanelControl() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para el formulario de nuevo servicio
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [duracion, setDuracion] = useState('')
  const [precio, setPrecio] = useState('')
  const [formError, setFormError] = useState(null)
  const [btnLoading, setBtnLoading] = useState(false)

  // Cargar servicios desde la DB al entrar a la pantalla
  const cargarServicios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await serviciosService.getAll()
      setServicios(data)
    } catch (err) {
      setError('No se pudieron sincronizar los servicios con el servidor de Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarServicios()
  }, [])

  // Guardar un servicio nuevo
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!nombre || !duracion || !precio) {
      setFormError('Por favor, completa los campos obligatorios.')
      return
    }

    try {
      setBtnLoading(true)
      await serviciosService.create({
        nombre_servicio: nombre,
        descripcion: descripcion,
        duracion_minutos: parseInt(duracion),
        precio_base: parseFloat(precio)
      })

      // Limpiamos los inputs tras el éxito
      setNombre('')
      setDescripcion('')
      setDuracion('')
      setPrecio('')
      
      // Recargamos la lista en vivo directamente de la DB
      await cargarServicios()
    } catch (err) {
      setFormError(err.message || 'Error al guardar el servicio.')
    } finally {
      setBtnLoading(false)
    }
  }

  // Eliminar un servicio
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este servicio de forma permanente?')) return

    try {
      await serviciosService.delete(id)
      // Filtramos el estado local para que desaparezca al instante de la pantalla
      setServicios(servicios.filter(s => s.id_servicio !== id))
    } catch (err) {
      alert('No se pudo eliminar el servicio.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel de Administración 👑</h2>
        <p className="text-slate-500 mt-1">Control global de servicios del Spa Francesca.</p>
      </div>

      {/* Grid Dinámico: Formulario de Alta + Tabla de Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Formulario */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4">✨ Nuevo Servicio</h3>
          
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Servicio *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Masaje Descontracturante"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve detalle del tratamiento..."
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duración (min) *</label>
                <input
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  placeholder="60"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Precio ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="4500"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:bg-indigo-400"
            >
              {btnLoading ? 'Guardando...' : 'Crear Servicio'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Catálogo en Tabla */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Catálogo Activo</h3>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {servicios.length} Items
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm font-medium">
              Sincronizando con base de datos de Supabase...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 text-sm font-medium">
              {error}
            </div>
          ) : servicios.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No hay servicios cargados en el Spa Francesca todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Servicio</th>
                    <th className="p-4">Duración</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {servicios.map((srv) => (
                    <tr key={srv.id_servicio} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-semibold text-slate-800">{srv.nombre_servicio}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{srv.descripcion || 'Sin descripción'}</p>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{srv.duracion_minutos} min</td>
                      <td className="p-4 font-semibold text-slate-900">${parseFloat(srv.precio_base).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(srv.id_servicio)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}