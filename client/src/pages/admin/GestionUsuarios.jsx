import { useState, useEffect } from 'react';
import { hookUseGestionUsuarios } from '../../hooks/hookUseGestionUsuarios';
import { UserPlus, Loader2, CheckCircle2, X } from 'lucide-react';

export default function GestionUsuarios() {
    const { usuarios, servicios, usuarioEditando, setUsuarioEditando, guardarUsuario, cambiarEstado, loading } = hookUseGestionUsuarios();
    
    const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', email: '', password: '', rol: 'Especialista', especialidad: 'General', serviciosIds: [] });
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        if (usuarioEditando) {
            setForm({ 
                nombre: usuarioEditando.nombre || '', 
                apellido: usuarioEditando.apellido || '', 
                dni: usuarioEditando.dni || '', 
                email: usuarioEditando.email || '', 
                password: '', 
                rol: usuarioEditando.nombre_rol || 'Especialista', 
                especialidad: usuarioEditando.especialidad || 'General', 
                serviciosIds: usuarioEditando.serviciosIds || [] 
            });
        } else {
            setForm({ nombre: '', apellido: '', dni: '', email: '', password: '', rol: 'Especialista', especialidad: 'General', serviciosIds: [] });
        }
    }, [usuarioEditando]);

    const handleGuardar = async () => {
        const datos = {
            ...form,
            id_rol: form.rol === 'Especialista' ? 3 : (form.rol === 'Recepcionista' ? 2 : 1),
            serviciosIds: form.rol === 'Especialista' ? form.serviciosIds : []
        };
        try {
            await guardarUsuario(datos);
            setStatusModal({ show: true, type: 'success', message: `¡${form.nombre} guardado con éxito!` });
            setUsuarioEditando(null);
            setShowConfirm(false);
        } catch (err) {
            setStatusModal({ show: true, type: 'error', message: err.response?.data?.message || 'Error al guardar' });
            setShowConfirm(false);
        }
    };

    const toggleServicio = (id) => {
        setForm(prev => ({
            ...prev,
            serviciosIds: prev.serviciosIds.includes(id) ? prev.serviciosIds.filter(i => i !== id) : [...prev.serviciosIds, id]
        }));
    };

    return (
        <div className="p-6">
            {statusModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setStatusModal({ show: false })}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center">
                        {statusModal.type === 'success' ? <CheckCircle2 size={50} className="text-[#2E7D32] mb-4" /> : <X size={50} className="text-red-600 mb-4" />}
                        <h3 className="text-2xl font-bold mb-2">{statusModal.type === 'success' ? '¡Éxito!' : '¡Error!'}</h3>
                        <p className="mb-6 text-slate-600">{statusModal.message}</p>
                        <button onClick={() => setStatusModal({ show: false })} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Aceptar</button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-[#A87379]">Gestión del Personal</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#FDECEB] p-6 rounded-2xl border border-[#A87379]/20 h-fit">
                    <h3 className="font-bold text-[#A87379] mb-4">{usuarioEditando ? 'Editar Personal' : 'Registrar Personal'}</h3>
                    <div className="space-y-3">
                        <input className="w-full p-2.5 rounded-lg border border-[#A87379]/30" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                        <input className="w-full p-2.5 rounded-lg border border-[#A87379]/30" placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
                        <input className="w-full p-2.5 rounded-lg border border-[#A87379]/30" placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
                        <input className="w-full p-2.5 rounded-lg border border-[#A87379]/30" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <input type="password" className="w-full p-2.5 rounded-lg border border-[#A87379]/30" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                        
                        <select className="w-full p-2.5 rounded-lg border border-[#A87379]/30" value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
                            <option value="Especialista">Especialista</option>
                            <option value="Recepcionista">Recepcionista</option>
                            <option value="Administrador">Administrador</option>
                        </select>

                        {form.rol === 'Especialista' && (
                            <>
                                <select className="w-full p-2.5 rounded-lg border border-[#A87379]/30" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})}>
                                    {['General', 'Masajista', 'Aromaterapista', 'Cosmiatra', 'Esteticista', 'Nails'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="bg-white p-3 rounded-lg border h-32 overflow-y-auto text-sm">
                                    {servicios.map(s => (
                                        <label key={s.id_servicio} className="flex items-center gap-2 mb-1 cursor-pointer">
                                            <input type="checkbox" checked={form.serviciosIds.includes(s.id_servicio)} onChange={() => toggleServicio(s.id_servicio)} />
                                            {s.nombre_servicio}
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                        <button onClick={() => setShowConfirm(true)} className="w-full bg-[#A87379] text-white py-3 rounded-lg font-bold hover:bg-[#96666b] transition-all">
                            {usuarioEditando ? 'Guardar Cambios' : 'Registrar'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-[10px] uppercase border-b">
                                <th className="pb-4">Nombre</th>
                                <th className="pb-4">Rol</th>
                                <th className="pb-4">Estado</th>
                                <th className="pb-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {usuarios.map(u => (
                                <tr key={u.id_usuario} className="hover:bg-slate-50">
                                    <td className="py-4 font-semibold">{u.nombre} {u.apellido}</td>
                                    <td className="py-4 text-xs">{u.nombre_rol}</td>
                                    <td className="py-4 text-xs font-bold">{u.activo ? "ACTIVO" : "INACTIVO"}</td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => setUsuarioEditando(u)} className="text-slate-400 mr-3 text-xs font-bold">Editar</button>
                                        <button onClick={() => cambiarEstado(u.id_usuario, u.activo)} className={`text-xs font-bold ${u.activo ? "text-red-500" : "text-green-600"}`}>
                                            {u.activo ? "Baja" : "Reactivar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}