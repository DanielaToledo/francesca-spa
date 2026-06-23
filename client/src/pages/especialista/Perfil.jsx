//Perfil (Perfil.jsx): Es la Configuración Estructural. 
// Aquí el especialista define su "regla de oro": "Yo trabajo de lunes a viernes de 9:00 a 18:00 y 
// no trabajo los feriados ni mi cumpleaños". 
// Es lo que alimenta la base del calendario del cliente.

import { useAuth } from '../../context/AuthContext';
import { hookUsePerfil } from '../../hooks/hookUsePerfil'; // Importamos el hook
import ConfiguracionAgenda from '../../components/especialistas/ConfiguracionAgenda';

export default function Perfil() {
    const { user } = useAuth();
    const id_especialista = user?.id_especialista;
    
    // Aquí "enchufamos" el hook
    const { config, loading, saveConfig } = hookUsePerfil(id_especialista);

    // 3. Validaciones de carga (la vista sigue controlando esto)
    if (!id_especialista) return <div className="p-8 text-center">Cargando datos de sesión...</div>;
    if (!config) return <div className="p-8 text-center">Cargando perfil...</div>;

    // 4. Renderizado
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#A87379]">Mi Perfil</h1>
            <ConfiguracionAgenda 
                key={JSON.stringify(config)} 
                initialConfig={config} 
                onSave={saveConfig} // Pasamos la función del hook
                loading={loading} 
            />
        </div>
    );
}