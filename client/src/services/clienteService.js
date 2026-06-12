import api from './api'; // Asegurate de importar tu instancia de axios aquí

export const clienteService = {
    buscar: async (termino) => {
        try {
            const res = await api.get(`/clientes/buscar?q=${termino}`);
            return res.data;
        } catch (error) {
            console.error("Error al buscar cliente:", error);
            return { success: false, data: [] };
        }
    }
};