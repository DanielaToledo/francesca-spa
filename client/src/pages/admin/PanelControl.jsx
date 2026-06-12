import { useEffect, useState } from 'react'
import { serviciosService } from '../../services/servicioService'

export default function PanelControl() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados del Formulario (se quedan igual para el manejo interno de los inputs)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [duracion, setDuracion] = useState('')
  const [formError, setFormError] = useState(null)
  const [btnLoading, setBtnLoading] = useState(false)

  // Estado para controlar qué ID estamos editando
  const [editandoId, setEditandoId] = useState(null)

  const cargarServicios = async () => {
    try {
      setLoading(true)
      const data = await serviciosService.getAll()
      setServicios(data)
    } catch (err) {
      setError('No se pudieron cargar los servicios del spa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarServicios()
  }, [])

  // 🔄 CORRECCIÓN: Al editar, leemos los nombres reales de Supabase
  const activarEdicion = (srv) => {
    setEditandoId(srv.id_servicio)
    setNombre(srv.nombre_servicio)
    setDescripcion(srv.descripcion || '')
    setPrecio(srv.precio_base)
    setDuracion(srv.duracion_minutos)
    setFormError(null)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setDuracion('')
    setFormError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!nombre || !precio || !duracion) {
      setFormError('Nombre, Precio y Duración son campos obligatorios.');
      return
    }

    try {
      setBtnLoading(true)

      // 📦 CORRECCIÓN: Mapeamos los datos con los nombres que espera tu Backend/Database
      const datosServicio = {
        nombre_servicio: nombre,
        descripcion: descripcion,
        precio_base: Number(precio),
        duracion_minutos: Number(duracion)
      }

      if (editandoId) {
        await serviciosService.update(editandoId, datosServicio)
      } else {
        await serviciosService.create(datosServicio)
      }

      cancelarEdicion()
      await cargarServicios()
    } catch (err) {
      setFormError(err.message || 'Error al procesar la solicitud.')
    } finally {
      setBtnLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return
    try {
      await serviciosService.delete(id)
      // Sacamos el servicio desactivado del estado de React para que desaparezca de la tabla al instante
      setServicios(servicios.filter(s => s.id_servicio !== id))
      if (editandoId === id) cancelarEdicion()
    } catch (err) {
      alert('No se pudo dar de baja el servicio.')
    }
  }

 return (
    // 🌌 CORRECCIÓN: Quitamos min-h-screen para que la pantalla no empuje al sidebar hacia abajo
    <div className="space-y-8 bg-[#FBF9F8] p-6 rounded-2xl">
      <div>
        {/* Título principal con el rosa viejo sofisticado #A87379 */}
        <h2 className="text-3xl font-extrabold text-[#A87379] tracking-tight">Gestión de Servicios</h2>
        <p className="text-slate-500 mt-1">Configura el menú de tratamientos, precios y duraciones del Spa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 🌸 Formulario Dinámico en tu Rosa Pastel Delicado #F4CFCC */}
        <div className="bg-[#F4CFCC]/40 p-6 rounded-2xl shadow-sm border border-[#F4CFCC]/60 h-fit">
          <h3 className="text-lg font-bold text-[#A87379] mb-4">
            {editandoId ? '📝 Editar Tratamiento' : '✨ Nuevo Tratamiento'}
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Servicio</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Masaje Descontracturante"
                className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción (Opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve detalle del tratamiento..."
                rows="2"
                className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Precio ($)</label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="4500"
                  className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duración (Min)</label>
                <input
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  placeholder="60"
                  className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={btnLoading}
                className={`flex-1 text-white font-medium py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:bg-slate-400 ${editandoId
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-[#A87379] hover:bg-[#A87379]/90 focus:ring-2 focus:ring-[#EAA0AB]'
                  }`}
              >
                {btnLoading ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-sm transition-colors cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 📑 Listado de Servicios */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-[#A87379] text-lg">Tratamientos Activos</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Cargando menú del spa...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 text-sm">{error}</div>
          ) : servicios.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No hay servicios creados aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FBF9F8]/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Servicio</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Duración</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {servicios.map((srv) => (
                    <tr key={srv.id_servicio} className="hover:bg-[#FBF9F8]/50 transition-colors">
                      <td className="p-4 pl-6 max-w-xs md:max-w-sm">
                        <p className="font-semibold text-slate-800 text-base">{srv.nombre_servicio}</p>
                        {srv.descripcion && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {srv.descripcion}
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ${Math.round(srv.precio_base)}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {srv.duracion_minutos} min
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                          <button
                            onClick={() => activarEdicion(srv)}
                            className="w-full sm:w-auto px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(srv.id_servicio)}
                            className="w-full sm:w-auto px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Baja
                          </button>
                        </div>
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
  ) // <-- Cierra el return
} // <-- Cierra la función