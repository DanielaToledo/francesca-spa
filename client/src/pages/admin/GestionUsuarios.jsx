import { useEffect, useState } from 'react'
import { usuariosService } from '../../services/usuarioService'
import { serviciosService } from '../../services/servicioService'
import { CheckCircle2, UserPlus, Loader2, X } from 'lucide-react'
import API from '../../services/api.js'; // O la ruta donde tengas tu instancia

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [servicios, setServicios] = useState([])
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])

    // Estados del formulario
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [dni, setDni] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rol, setRol] = useState('Especialista')
    const [especialidad, setEspecialidad] = useState('General')

    // ESTADO PARA EDICIÓN
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    // Control de modales y estados de carga
    const [showConfirm, setShowConfirm] = useState(false)
    const [btnLoading, setBtnLoading] = useState(false)
    const [statusModal, setStatusModal] = useState({ show: false, type: '', message: '' })

    const cargarDatos = async () => {
        const [data, svcs] = await Promise.all([usuariosService.getAll(), serviciosService.getAll()])
        setUsuarios(data.filter(usr => usr.nombre_rol !== 'Cliente'))
        setServicios(svcs)
    }

    useEffect(() => { cargarDatos() }, [])

    const toggleServicio = (id) => {
        setServiciosSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    // Lógica para preparar la edición
    // 1. EL USEEFFECT QUE VIGILA LA EDICIÓN
    useEffect(() => {
        if (usuarioEditando) {
            setNombre(usuarioEditando.nombre || '');
            setApellido(usuarioEditando.apellido || '');
            setDni(usuarioEditando.dni || '');
            setEmail(usuarioEditando.email || '');
            setRol(usuarioEditando.nombre_rol || 'Especialista');
            setEspecialidad(usuarioEditando.especialidad || 'General');
            // Aseguramos que los servicios se carguen si existen en la respuesta del backend
            setServiciosSeleccionados(usuarioEditando.serviciosIds || []);
        } else {
            // Limpiamos el formulario si salimos del modo edición
            setNombre('');
            setApellido('');
            setDni('');
            setEmail('');
            setRol('Especialista');
            setEspecialidad('General');
            setServiciosSeleccionados([]);
        }
    }, [usuarioEditando]);



    // 2. EL INICIAR EDICIÓN SE SIMPLIFICA AL MÁXIMO
    const iniciarEdicion = (usuario) => {
        setUsuarioEditando(usuario);
        // Ya no necesitas setear los estados aquí, el useEffect de arriba lo hace por ti
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const closeAllModals = () => {
        // 1. Guardamos si fue un éxito para saber si debemos limpiar el formulario
        const fueExito = statusModal.type === 'success';

        // 2. Cerramos los modales
        setShowConfirm(false);
        setStatusModal({ show: false, type: '', message: '' });

        // 3. Si fue éxito, limpiamos todo y salimos del modo edición
        if (fueExito) {
            setNombre('');
            setApellido('');
            setDni('');
            setEmail('');
            setPassword('');
            setServiciosSeleccionados([]);
            setEspecialidad('General');
            setRol('Especialista');
            setUsuarioEditando(null); // Esto es clave para que el useEffect detecte que ya no editamos
        }
    }

const handleBaja = async (id_usuario) => {
    if (!window.confirm("¿Estás seguro de que deseas dar de baja a este usuario?")) return;

    try {
        console.log("Iniciando baja para el ID recibido:", id_usuario);
        await API.patch(`/usuarios/${id_usuario}/baja`);
        
        setUsuarios(prevUsuarios => {
            return prevUsuarios.map(u => {
                // Esto nos dirá si estamos comparando correctamente
                console.log(`Comparando usuario actual (${u.id_usuario}) con ID recibido (${id_usuario})`);
                
                if (Number(u.id_usuario) === Number(id_usuario)) {
                    console.log("¡Match encontrado! Actualizando estado a activo: false");
                    return { ...u, activo: false };
                }
                return u;
            });
        });
        
        alert("Usuario dado de baja con éxito");
    } catch (error) {
        console.error("Error al dar de baja:", error);
    }
};

const handleAlta = async (id_usuario) => {
    try {
        await API.patch(`/usuarios/${id_usuario}/alta`); 
        
        // Esta parte ya la tenías perfecta:
        setUsuarios(prevUsuarios => 
            prevUsuarios.map(u => 
                u.id_usuario === id_usuario ? { ...u, activo: true } : u
            )
        );
    } catch (error) {
        console.error("Error al reactivar:", error);
    }
};

    const handleGuardar = async () => {
        setBtnLoading(true);

        const capitalizar = (str) => {
            if (!str) return '';
            return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
        };

        const datosEmpleado = {
            nombre: capitalizar(nombre),
            apellido: capitalizar(apellido),
            dni: (dni || '').trim(),
            email: (email || '').trim().toLowerCase(),
            password: password || null, // Si está vacío, enviamos null para que el backend sepa que no debe actualizarlo
            rol: rol,
            id_rol: rol === 'Especialista' ? 3 : (rol === 'Recepcionista' ? 2 : 1),
            especialidad: rol === 'Especialista' ? especialidad : null,
            serviciosIds: rol === 'Especialista' ? serviciosSeleccionados : []
        };

        try {
            if (usuarioEditando) {
                // ACTUALIZACIÓN
                await usuariosService.updateEmpleado(usuarioEditando.id_usuario, datosEmpleado);

                // Actualizamos la tabla localmente para mejor experiencia (UX)
                setUsuarios(prev => prev.map(u =>
                    u.id_usuario === usuarioEditando.id_usuario
                        ? { ...u, ...datosEmpleado, nombre_rol: rol }
                        : u
                ));

                setStatusModal({ show: true, type: 'success', message: `¡${nombre} ha sido actualizado con éxito!` });
            } else {
                // CREACIÓN
                await usuariosService.createEmpleado(datosEmpleado);

                // RECARGA TOTAL: Traemos los datos frescos de la BD para asegurar consistencia
                await cargarDatos();

                // Limpiamos los estados después de un registro exitoso
                setNombre(''); setApellido(''); setDni(''); setEmail(''); setPassword('');
                setServiciosSeleccionados([]);

                setStatusModal({ show: true, type: 'success', message: `¡${nombre} ha sido registrado con éxito!` });
            }
            setShowConfirm(false);
        } catch (err) {
            console.error("Error al guardar:", err);
            const mensaje = err.response?.data?.message || "Ocurrió un error inesperado";
            setShowConfirm(false);
            setStatusModal({ show: true, type: 'error', message: 'Error: ' + mensaje });
        } finally {
            setBtnLoading(false);
        }


    };
    return (
        <div className="p-6">
            {/* MODAL DE CONFIRMACIÓN */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transition-all duration-300 transform scale-100">
                        <div className="flex items-center gap-3 mb-4 text-[#A87379]">
                            <UserPlus size={24} />
                            <h3 className="text-xl font-bold">{usuarioEditando ? 'Confirmar Edición' : 'Confirmar Alta'}</h3>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
                            ¿Estás seguro de {usuarioEditando ? 'guardar los cambios de' : 'registrar a'} <strong className='text-slate-800'>{nombre} {apellido}</strong>?
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-sm transition">Cancelar</button>
                            <button onClick={handleGuardar} disabled={btnLoading} className={`flex-1 py-2.5 rounded-lg text-white font-bold text-sm transition flex items-center justify-center gap-2 ${usuarioEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#A87379] hover:bg-[#96666b]'}`}>
                                {btnLoading ? <Loader2 className="animate-spin" size={16} /> : (usuarioEditando ? 'Guardar Cambios' : 'Confirmar Alta')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE ESTATUS */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={closeAllModals}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transition-all duration-300 transform scale-100 flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
                        {statusModal.type === 'success' ? (
                            <div className="bg-[#E8F5E9] text-[#2E7D32] p-5 rounded-full mb-6"><CheckCircle2 size={50} strokeWidth={2.5} /></div>
                        ) : (
                            <div className="bg-red-50 text-red-600 p-5 rounded-full mb-6"><X size={50} strokeWidth={2.5} /></div>
                        )}
                        <h3 className={`text-3xl font-extrabold mb-3 ${statusModal.type === 'success' ? 'text-[#2E7D32]' : 'text-red-600'}`}>{statusModal.type === 'success' ? '¡Éxito!' : '¡Error!'}</h3>
                        <p className="text-base text-slate-700 mb-8 leading-relaxed">{statusModal.message}</p>
                        <button onClick={closeAllModals} className={`w-full py-3.5 rounded-xl text-white font-bold text-base transition duration-150 ${statusModal.type === 'success' ? 'bg-[#2E7D32] hover:bg-[#256629]' : 'bg-red-600 hover:bg-red-700'}`}>Aceptar</button>
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-bold text-[#A87379] mb-6">Gestión del Personal</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#FDECEB] p-6 rounded-2xl border border-[#A87379]/20 h-fit">
                    <h3 className="font-bold text-[#A87379] mb-4">{usuarioEditando ? 'Editar Personal' : 'Registrar Personal'}</h3>
                    <div className="space-y-3">
                        {['Nombre', 'Apellido', 'DNI', 'Email'].map((field) => (
                            <input key={field} type={field === 'Email' ? 'email' : 'text'} placeholder={field}
                                value={field === 'Nombre' ? nombre : field === 'Apellido' ? apellido : field === 'DNI' ? dni : email}
                                onChange={e => {
                                    if (field === 'Nombre') setNombre(e.target.value);
                                    if (field === 'Apellido') setApellido(e.target.value);
                                    if (field === 'DNI') setDni(e.target.value);
                                    if (field === 'Email') setEmail(e.target.value);
                                }}
                                className="w-full p-2.5 rounded-lg border border-[#A87379]/30 bg-[#FBF9F8] focus:ring-2 focus:ring-[#A87379]/50 outline-none"
                            />
                        ))}
                        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#A87379]/30 bg-[#FBF9F8] focus:ring-2 focus:ring-[#A87379]/50 outline-none" />

                        <select value={rol} onChange={e => setRol(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#A87379]/30 bg-[#FBF9F8] focus:ring-2 focus:ring-[#A87379]/50 outline-none">
                            <option value="Especialista">Especialista</option>
                            <option value="Recepcionista">Recepcionista</option>
                            <option value="Administrador">Administrador</option>
                        </select>

                        {rol === 'Especialista' && (
                            <select value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#A87379]/30 bg-[#FBF9F8] focus:ring-2 focus:ring-[#A87379]/50 outline-none">
                                <option value="General">General</option>
                                <option value="Masajista">Masajista</option>
                                <option value="Aromaterapista">Aromaterapista</option>
                                <option value="Cosmiatra">Cosmiatra</option>
                                <option value="Esteticista">Esteticista</option>
                                <option value="Nails">Nails</option>
                            </select>
                        )}

                        {rol === 'Especialista' && (
                            <div className="bg-white p-3 rounded-lg border border-[#A87379]/20 text-sm h-40 overflow-y-auto">
                                <p className="font-bold text-gray-700 mb-2">Servicios:</p>
                                {/* Dentro del div de Servicios */}
                                {servicios.map(s => (
                                    <label key={s.id_servicio} className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={serviciosSeleccionados.includes(s.id_servicio)} // <--- ESTO ES LO QUE FALTA
                                            onChange={() => toggleServicio(s.id_servicio)}
                                            className="form-checkbox text-[#A87379] rounded focus:ring-[#A87379]"
                                        />
                                        {s.nombre_servicio}
                                    </label>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            className="w-full bg-[#A87379] text-white py-3 rounded-lg font-bold hover:bg-[#96666b] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            {usuarioEditando ? 'Guardar Cambios' : 'Dar de Alta'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#A87379]/10 p-6 shadow-sm">
                    <h3 className="font-bold text-[#A87379] mb-4">Staff Registrado</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="pb-4 pr-4">Nombre Completo</th>
                                    <th className="pb-4">Rol</th>
                                    <th className="pb-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {usuarios.map(u => {
                                    // --- ESTO TE VA A MOSTRAR QUÉ DATOS TIENE CADA USUARIO ---
                                    console.log("Datos del usuario:", u);

                                    return (
                                      <tr key={u.id_usuario} className="hover:bg-slate-50/50">
    <td className="py-4 font-semibold text-gray-800 pr-4">{u.nombre} {u.apellido}</td>
    
    {/* Columna de Rol */}
    <td className="py-4">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${u.nombre_rol === 'Especialista' ? 'bg-[#E8F5E9] text-[#2E7D32]' : u.nombre_rol === 'Recepcionista' ? 'bg-[#E3F2FD] text-[#1565C0]' : 'bg-[#F3E5F5] text-[#7B1FA2]'}`}>
            {u.nombre_rol}
        </span>
    </td>

    {/* Columna de Estado (Nuevo) */}
    <td className="py-4">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {u.activo ? "ACTIVO" : "INACTIVO"}
        </span>
    </td>

    {/* Columna de Acciones */}
    <td className="py-4 flex gap-3 justify-end items-center">
        <button 
            onClick={() => iniciarEdicion(u)} 
            className="text-[#A87379] font-bold text-xs hover:underline"
        >
            Editar
        </button>

        {u.activo ? (
            <button
                onClick={() => handleBaja(u.id_usuario)}
                className="text-red-500 font-bold text-xs hover:underline"
            >
                Baja
            </button>
        ) : (
            <button
                onClick={() => handleAlta(u.id_usuario)}
                className="text-green-600 font-bold text-xs hover:underline"
            >
                Reactivar
            </button>
        )}
    </td>
</tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}