import { useState } from 'react';
import { hookUseGestionServicios } from '../../hooks/hookUseGestionServicios';

export default function GestionServicios() {
    const { servicios, loading, error, guardarServicio, eliminarServicio } = hookUseGestionServicios();
    
    // Estado único para el formulario
    const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '' });
    const [editandoId, setEditandoId] = useState(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!form.nombre || !form.precio || !form.duracion) {
            setFormError('Nombre, Precio y Duración son obligatorios.');
            return;
        }

        setBtnLoading(true);
        try {
            await guardarServicio(editandoId, {
                nombre_servicio: form.nombre,
                descripcion: form.descripcion,
                precio_base: Number(form.precio),
                duracion_minutos: Number(form.duracion)
            });
            cancelarEdicion();
        } catch (err) {
            setFormError(err.message || 'Error al procesar la solicitud.');
        } finally {
            setBtnLoading(false);
        }
    };

    const activarEdicion = (srv) => {
        setEditandoId(srv.id_servicio);
        setForm({ 
            nombre: srv.nombre_servicio, 
            descripcion: srv.descripcion || '', 
            precio: srv.precio_base, 
            duracion: srv.duracion_minutos 
        });
        setFormError(null);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setForm({ nombre: '', descripcion: '', precio: '', duracion: '' });
        setFormError(null);
    };

    return (
        <div className="space-y-8 bg-[#FBF9F8] p-6 rounded-2xl">
            <div>
                <h2 className="text-3xl font-extrabold text-[#A87379] tracking-tight">Gestión de Servicios</h2>
                <p className="text-slate-500 mt-1">Configura el menú de tratamientos, precios y duraciones del Spa.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="bg-[#F4CFCC]/40 p-6 rounded-2xl shadow-sm border border-[#F4CFCC]/60 h-fit">
                    <h3 className="text-lg font-bold text-[#A87379] mb-4">
                        {editandoId ? '📝 Editar Tratamiento' : ' Nuevo Tratamiento'}
                    </h3>

                    {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">{formError}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre</label>
                            <input className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Masaje Descontracturante" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descripción</label>
                            <textarea className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows="2" placeholder="Breve detalle..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Precio ($)</label>
                                <input type="number" className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="4500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duración (Min)</label>
                                <input type="number" className="w-full px-4 py-2 bg-white/90 border border-[#F4CFCC] rounded-lg text-sm" value={form.duracion} onChange={e => setForm({...form, duracion: e.target.value})} placeholder="60" />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" disabled={btnLoading} className={`flex-1 text-white font-medium py-2 rounded-lg text-sm transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#A87379] hover:bg-[#A87379]/90'}`}>
                                {btnLoading ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Crear Servicio'}
                            </button>
                            {editandoId && <button type="button" onClick={cancelarEdicion} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg text-sm">Cancelar</button>}
                        </div>
                    </form>
                </div>

                {/* Tabla */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-[#A87379] text-lg">Tratamientos Activos</h3>
                    </div>
                    {loading ? <div className="p-12 text-center text-slate-500">Cargando...</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FBF9F8]/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                        <th className="p-4 pl-6">Servicio</th>
                                        <th className="p-4">Precio</th>
                                        <th className="p-4">Duración</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {servicios.map((srv) => (
                                        <tr key={srv.id_servicio} className="hover:bg-[#FBF9F8]/50">
                                            <td className="p-4 pl-6">
                                                <p className="font-semibold text-slate-800">{srv.nombre_servicio}</p>
                                                <p className="text-xs text-slate-400">{srv.descripcion}</p>
                                            </td>
                                            <td className="p-4 font-bold">${Math.round(srv.precio_base)}</td>
                                            <td className="p-4 text-slate-600">{srv.duracion_minutos} min</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => activarEdicion(srv)} className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg">Editar</button>
                                                    <button onClick={() => eliminarServicio(srv.id_servicio)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-lg">Baja</button>
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
    );
}