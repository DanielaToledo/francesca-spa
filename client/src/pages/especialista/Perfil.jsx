//Perfil (Perfil.jsx): Es la Configuración Estructural. 
// Aquí el especialista define su "regla de oro": "Yo trabajo de lunes a viernes de 9:00 a 18:00 y 
// no trabajo los feriados ni mi cumpleaños". 
// Es lo que alimenta la base del calendario del cliente.

import { useState, useEffect } from 'react';
import { especialistaService } from '../../services/especialistaService';
import ConfiguracionAgenda from '../../components/especialistas/ConfiguracionAgenda';
import { useAuth } from '../../context/AuthContext';

export default function Perfil() {
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const id_especialista = user?.id_especialista;

    // 1. Lógica de carga única
    useEffect(() => {
        if (!id_especialista) return;

        const cargarConfig = async () => {
            try {
                const res = await especialistaService.getConfig(id_especialista);
                const dataBackend = res.data?.configuracion_agenda;
                
                // Aseguramos estructura mínima incluso si viene vacío
                const configDefault = { 
                    horarios: {}, 
                    bloqueos: [], 
                    duracion_turno: 60 
                };
                
                setConfig(dataBackend || configDefault);
            } catch (error) {
                console.error("Error al cargar configuración:", error);
                setConfig({ horarios: {}, bloqueos: [], duracion_turno: 60 });
            }
        };
        cargarConfig();
    }, [id_especialista]);

    // 2. Manejador de guardado que actualiza el estado padre
    const handleSave = async (nuevaConfig) => {
        setLoading(true);
        try {
            await especialistaService.updateConfig(id_especialista, nuevaConfig);
            // Actualizamos el estado local para que la UI se refresque instantáneamente
            setConfig(nuevaConfig); 
            alert('¡Configuración guardada correctamente!');
        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Hubo un error al intentar guardar.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Validaciones de carga segura
    if (!id_especialista) return <div className="p-8 text-center">Cargando datos de sesión...</div>;
    if (!config) return <div className="p-8 text-center">Cargando perfil...</div>;

    // 4. Renderizado
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#A87379]">Mi Perfil</h1>
            {/* El key={JSON.stringify} es vital para que el hijo se entere del cambio de estado */}
            <ConfiguracionAgenda 
                key={JSON.stringify(config)} 
                initialConfig={config} 
                onSave={handleSave} 
                loading={loading} 
            />
        </div>
    );
}