import pool from '../config/dbConfig.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Clave secreta para firmar los tokens (En producción va en un archivo .env)
const JWT_SECRET = 'mi_clave_secreta_ultra_segura_del_spa'

export const authController = {
  // 1. REGISTRO DE NUEVOS USUARIOS (Por defecto Clientes)
  register: async (req, res) => {
    const { nombre, apellido, dni, email, password, id_rol } = req.body

    try {
      // Validar si el email ya existe
      const existeUser = await pool.query('SELECT * FROM usuario WHERE email = $1', [email])
      if (existeUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' })
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash(password, salt)

      // Si no viene id_rol en el body, por defecto le asignamos el de Cliente (ej: ID 4)
      // Ajustá este número según el ID que tenga el rol "Cliente" en tu tabla rol
      const rolAsignado = id_rol || 4 

      const query = `
        INSERT INTO usuario (nombre, apellido, dni, email, password_hash, id_rol)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_usuario, nombre, apellido, email, id_rol;
      `
      const { rows } = await pool.query(query, [nombre, apellido, dni, email, password_hash, rolAsignado])

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado con éxito',
        data: rows[0]
      })

    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error en el registro', error: error.message })
    }
  },

  // 2. LOGIN DE USUARIOS
  login: async (req, res) => {
    const { email, password } = req.body

    try {
      // Buscar el usuario y traer el NOMBRE del rol con INNER JOIN
      const query = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash, u.activo, u.id_rol, r.nombre_rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.email = $1;
      `
      const { rows } = await pool.query(query, [email])
      const usuario = rows[0]

      // Si no existe el usuario o está desactivado
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
      }

      // Comparar la contraseña ingresada con el hash de la base de datos
      const match = await bcrypt.compare(password, usuario.password_hash)
      if (!match) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
      }

      // ¡Acá está la magia para React! Metemos el id y el nombre del rol adentro del Token
      const payload = {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        id_rol: usuario.id_rol,
        rol: usuario.nombre_rol
      }

      // Firmar el token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

      // Devolvemos el token y los datos limpios para que React sepa qué pantallas mostrar
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.nombre_rol // "Administrador", "Especialista", etc.
        }
      })

    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error en el login', error: error.message })
    }
  }
}