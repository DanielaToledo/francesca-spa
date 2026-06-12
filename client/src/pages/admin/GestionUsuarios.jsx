import { useEffect, useState } from 'react'
import { usuariosService } from '../../services/usuarioService' // <-- Tu nuevo servicio modular

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Estados para el formulario de nuevo empleado
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [dni, setDni] = useState('') // <-- Agrega este estado nuevo
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rol, setRol] = useState('Especialista') // Rol por defecto en el select
    const [formError, setFormError] = useState(null)
    const [btnLoading, setBtnLoading] = useState(false)

    // Función para cargar los usuarios de la base de datos
    const cargarUsuarios = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await usuariosService.getAll()

            // 🛡️ FILTRO DE SEGURIDAD Y NEGOCIO:
            // Solo nos quedamos con los usuarios cuyo nombre_rol SEA DISTINTO a 'Cliente'
            const staffFiltrado = data.filter(usr => usr.nombre_rol !== 'Cliente')

            setUsuarios(staffFiltrado)
        } catch (err) {
            setError('No se pudo conectar con Supabase para listar los usuarios.')
        } finally {
            setLoading(false)
        }
    }

    // Se ejecuta al cargar la pantalla por primera vez
    useEffect(() => {
        cargarUsuarios()
    }, [])

    // Guardar un nuevo empleado desde el panel
    const handleCreateEmpleado = async (e) => {
        e.preventDefault()
        setFormError(null)

        // Validación básica
        // En la validación, sumá el dni:
        if (!nombre || !apellido || !dni || !email || !password || !rol) {
            setFormError('Por favor, completa todos los campos para registrar al empleado.')
            return
        }

        try {
            setBtnLoading(true)
            await usuariosService.createEmpleado({
                nombre,
                apellido,
                dni,
                email,
                password,
                rol
            })

            // Limpiamos los campos del formulario si salió todo bien
            setNombre('')
            setApellido('')
            setDni('') 
            setEmail('')
            setPassword('')
            setRol('Especialista')

            // Recargamos la lista en vivo para ver el nuevo empleado en la tabla
            await cargarUsuarios()
        } catch (err) {
            setFormError(err.message || 'Error al registrar el usuario.')
        } finally {
            setBtnLoading(false)
        }
    }

    // Dar de baja a un usuario
    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas dar de baja a este usuario de forma permanente?')) return

        try {
            await usuariosService.delete(id)
            // Lo sacamos del estado para que desaparezca visualmente de una
            setUsuarios(usuarios.filter(u => (u.id_usuario || u.id) !== id))
        } catch (err) {
            alert('No se pudo eliminar al usuario.')
        }
    }

    // Helper para pintar badges de colores según el rol
    const getBadgeColor = (rolTarget) => {
        switch (rolTarget) {
            case 'Administrador': case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'Recepcionista': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'Especialista': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200' // Para Clientes
        }
    }

  return (
        // 🌌 Fondo general iluminado #FBF9F8
        <div className="space-y-8 bg-[#FBF9F8] p-6 rounded-2xl">
            {/* Encabezado */}
            <div>
                <h2 className="text-3xl font-extrabold text-[#A87379] tracking-tight">Gestión del Personal </h2>
                <p className="text-slate-500 mt-1">Alta de empleados y control de permisos en Spa Francesca.</p>
            </div>

            {/* Contenedor Grid de 3 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Formulario de Alta en tu Rosa Pastel Delicado #F4CFCC */}
                <div className="bg-[#F4CFCC]/40 p-6 rounded-2xl shadow-sm border border-[#F4CFCC]/60 h-fit">
                    <h3 className="text-lg font-bold text-[#A87379] mb-4">Registrar Personal</h3>

                    {formError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleCreateEmpleado} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ana"
                                    className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    placeholder="Pérez"
                                    className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                                />
                            </div>

                            {/* Campo DNI con tus colores de foco */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Documento de Identidad (DNI)</label>
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    placeholder="Ej. 42333444"
                                    className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ejemplo@francesca.com"
                                className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Asignar Rol</label>
                            <select
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA0AB]"
                            >
                                <option value="Especialista">Especialista</option>
                                <option value="Recepcionista">Recepcionista</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </div>

                        {/* Botón de Alta usando tu Rosa Viejo sofisticado #A87379 */}
                        <button
                            type="submit"
                            disabled={btnLoading}
                            className="w-full mt-2 bg-[#A87379] hover:bg-[#A87379]/90 text-white font-medium py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:bg-[#A87379]/50"
                        >
                            {btnLoading ? 'Registrando...' : 'Dar de Alta'}
                        </button>
                    </form>
                </div>

                {/* Columna Derecha: Tabla de Listado en Blanco Puro */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-[#A87379] text-lg">Staff Registrado</h3>
                        {/* Contador de staff usando tu color de marca */}
                        <span className="px-2.5 py-1 bg-[#A87379]/10 text-[#A87379] text-xs font-bold rounded-full">
                            {usuarios.length} Activos
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500 text-sm font-medium">
                            Conectando con Supabase...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                            No hay miembros del staff registrados en la base de datos.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FBF9F8]/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4 pl-6">Nombre</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Rol</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {usuarios.map((usr) => (
                                        <tr key={usr.id_usuario || usr.id} className="hover:bg-[#FBF9F8]/50 transition-colors">
                                            <td className="p-4 pl-6 font-semibold text-slate-800">
                                                {usr.nombre} {usr.apellido}
                                            </td>
                                            <td className="p-4 text-slate-600">{usr.email}</td>
                                            <td className="p-4">
                                                {/* Se mantiene la función getBadgeColor original para tus roles */}
                                                <span className={`inline-block px-2.5 py-0.5 border text-xs font-semibold rounded-md ${getBadgeColor(usr.nombre_rol)}`}>
                                                    {usr.nombre_rol || 'Sin Rol'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(usr.id_usuario || usr.id)}
                                                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                                >
                                                    Baja
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