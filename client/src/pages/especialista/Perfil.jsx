import { useState, useEffect } from 'react';
import { especialistaService } from '../../services/especialistaService';
import ConfiguracionAgenda from '../../components/especialistas/ConfiguracionAgenda';

export default function Perfil() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const id_especialista = 1; // Asegúrate de obtener esto del contexto de usuario

    useEffect(() => {
        const cargarConfig = async () => {
            try {
                const res = await especialistaService.getConfig(id_especialista);
                console.log("Respuesta del backend:", res);

                // Estructura por defecto si el backend devuelve data vacía
                const estructuraPorDefecto = {
                    lun_vie: { inicio: "09:00", fin: "18:00" },
                    sabado: { inicio: "09:00", fin: "13:00" },
                    domingo: { inicio: "00:00", fin: "00:00" }
                };

                // Si 'res.data' existe y tiene contenido, lo usamos, si no, usamos el defecto
               const dataFinal = (res.data && res.data.configuracion_agenda) 
    ? res.data.configuracion_agenda 
    : estructuraPorDefecto;

                setConfig(dataFinal);
            } catch (error) {
                console.error("Error al cargar configuración:", error);
                // Si falla el backend, cargamos al menos la estructura inicial para no romper el front
                setConfig({
                    lun_vie: { inicio: "09:00", fin: "18:00" },
                    sabado: { inicio: "09:00", fin: "13:00" },
                    domingo: { inicio: "00:00", fin: "00:00" }
                });
            }
        };
        cargarConfig();
    }, []);

    const handleSave = async (nuevaConfig) => {
        setLoading(true);
        try {
            await especialistaService.updateConfig(id_especialista, nuevaConfig);
            setConfig(nuevaConfig); // Actualizamos el estado local con lo nuevo
            alert('¡Configuración guardada correctamente!');
        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Hubo un error al intentar guardar.');
        } finally {
            setLoading(false);
        }
    };

    // Esto evita que se intente renderizar el componente hijo sin datos
    if (!config) return <div className="p-8 text-center">Cargando perfil...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#A87379]">Mi Perfil</h1>
            <ConfiguracionAgenda 
                initialConfig={config} 
                onSave={handleSave} 
                loading={loading} 
            />
        </div>
    );
}