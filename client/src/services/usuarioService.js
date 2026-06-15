import API from './api'

export const usuariosService = {
  // Obtener todos los usuarios del sistema
  getAll: async () => {
    const res = await API.get('/usuarios')
    return res.data.data
  },

  // Crear un nuevo empleado (Usuario + Perfil de Especialista si corresponde)
 createEmpleado: async (empleadoData) => {
    const roles = { 'Administrador': 1, 'Recepcionista': 2, 'Especialista': 3 };
    const idRolNumerico = roles[empleadoData.rol] || 3;

    // 1. Crear el usuario base
    const resUsuario = await API.post('/auth/register', {
        nombre: empleadoData.nombre,
        apellido: empleadoData.apellido,
        dni: empleadoData.dni,
        email: empleadoData.email,
        password: empleadoData.password,
        id_rol: idRolNumerico
    });
    
    const nuevoUsuario = resUsuario.data.data;
    const id_usuario = nuevoUsuario.id_usuario;

    // 2. Registrar como Especialista si corresponde
    if (empleadoData.rol === 'Especialista') {
        try {
            await API.post('/especialistas', {
                id_usuario: id_usuario,
                especialidad: empleadoData.especialidad || "General", 
                serviciosIds: empleadoData.serviciosIds 
            });
        } catch (error) {
            // Si el error es 409 (Conflicto/Duplicado), lo ignoramos 
            // porque probablemente el registro ya existe o hubo un reintento.
            if (error.response?.status === 409) {
                console.warn("El especialista ya existía, continuando...");
            } else {
                // Si es un error real, relanzamos para que el frontend se entere
                throw error;
            }
        }
    }

    // 3. RETORNO UNIFICADO
    return { 
        ...nuevoUsuario, 
        ...empleadoData, 
        id_usuario: id_usuario 
    };
},


  
  // Eliminar usuario (baja lógica)
  delete: async (id) => {
    const res = await API.delete(`/usuarios/${id}`)
    return res.data.message
  },

  updateEmpleado: async (id, empleadoData) => {
    // Nota: Aquí llamamos al endpoint de usuarios que ya configuramos
    // El backend se encargará de actualizar tabla 'usuario' y 'especialista'
    const res = await API.put(`/usuarios/${id}`, empleadoData);
    return res.data;
  },


  // En tu servicio (ej. usuarioService.js)
bajaEmpleado: async (id_usuario) => {
    // Usamos PATCH porque solo modificamos una parte del recurso
    const res = await API.patch(`/usuarios/${id_usuario}/baja`);
    return res.data;
}
}