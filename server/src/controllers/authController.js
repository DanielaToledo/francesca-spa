import pool from '../config/dbConfig.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


// Clave secreta para firmar los tokens (En producción va en un archivo .env)
const JWT_SECRET = process.env.JWT_SECRET

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

    // 2. LOGIN DE USUARIOS OPTIMIZADO (Opción A)
    login: async (req, res) => {
        const { email, password } = req.body

        try {
            // 1. Buscar el usuario base y su rol
            const queryUser = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash, u.activo, u.id_rol, r.nombre_rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.email = $1;
      `
            const { rows } = await pool.query(queryUser, [email])
            const usuario = rows[0]

            if (!usuario || !usuario.activo) {
                return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
            }

            // 2. Verificar contraseña
            const match = await bcrypt.compare(password, usuario.password_hash)
            if (!match) {
                return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
            }

            // 3. LA MAGIA: Buscar ID específico según el rol
            let id_especifico = null
            let llave_id = 'id_usuario' // Por defecto para admin/recepcionista

            if (usuario.nombre_rol === 'Cliente') {
                const resCli = await pool.query('SELECT id_cliente FROM cliente WHERE id_usuario = $1', [usuario.id_usuario])
                if (resCli.rows.length > 0) {
                    id_especifico = resCli.rows[0].id_cliente
                    llave_id = 'id_cliente'
                }
            } else if (usuario.nombre_rol === 'Especialista') {
                const resEsp = await pool.query('SELECT id_especialista FROM especialista WHERE id_usuario = $1', [usuario.id_usuario])
                if (resEsp.rows.length > 0) {
                    id_especifico = resEsp.rows[0].id_especialista
                    llave_id = 'id_especialista'
                }
            }

            // 4. Armar el payload del Token con el ID operativo real
            const payload = {
                id_usuario: usuario.id_usuario,
                id_rol: usuario.id_rol,
                rol: usuario.nombre_rol,
                // Guardamos dinámicamente el ID que React va a necesitar para operar
                id_operativo: id_especifico || usuario.id_usuario,
                tipo_id: llave_id
            }

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

            // 5. Devolver la respuesta limpia para React
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    rol: usuario.nombre_rol,
                    id_cliente: usuario.nombre_rol === 'Cliente' ? id_especifico : undefined,
                    id_especialista: usuario.nombre_rol === 'Especialista' ? id_especifico : undefined
                }
            })

        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error en el login', error: error.message })
        }
    }
}