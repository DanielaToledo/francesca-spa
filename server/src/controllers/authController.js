import pool from '../config/dbConfig.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const JWT_SECRET = process.env.JWT_SECRET

export const authController = {
    register: async (req, res) => {
        // Recibimos 'especialidad' desde el frontend
        const { nombre, apellido, dni, email, password, id_rol, serviciosIds, especialidad } = req.body;

        try {
            const existeUser = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
            if (existeUser.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'El email ya está registrado' });
            }

            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            await pool.query('BEGIN');

            // 1. Insertar Usuario
            const userQuery = `
                INSERT INTO usuario (nombre, apellido, dni, email, password_hash, id_rol)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario, nombre, apellido, id_rol;
            `;
            const userRes = await pool.query(userQuery, [nombre, apellido, dni, email, password_hash, id_rol]);
            const nuevoUsuario = userRes.rows[0];

            // 2. Si el rol es Especialista (ID 3)
            if (id_rol === 3) {
                // Insertamos la especialidad aquí
                const espQuery = `INSERT INTO especialista (id_usuario, especialidad) VALUES ($1, $2) RETURNING id_especialista;`;
                const espRes = await pool.query(espQuery, [nuevoUsuario.id_usuario, especialidad || 'General']);
                const id_especialista = espRes.rows[0].id_especialista;

                // 3. Insertar relación de servicios
                if (serviciosIds && serviciosIds.length > 0) {
                    for (let id_servicio of serviciosIds) {
                        await pool.query('INSERT INTO especialista_servicio (id_especialista, id_servicio) VALUES ($1, $2)', [id_especialista, id_servicio]);
                    }
                }
            }

            await pool.query('COMMIT');

            return res.status(201).json({ 
                success: true, 
                message: 'Usuario registrado con éxito',
                data: {
                    id_usuario: nuevoUsuario.id_usuario,
                    nombre: nuevoUsuario.nombre,
                    apellido: nuevoUsuario.apellido,
                    nombre_rol: id_rol === 3 ? 'Especialista' : (id_rol === 2 ? 'Recepcionista' : 'Administrador')
                }
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error("ERROR DETECTADO EN BACKEND:", error);
            return res.status(500).json({ success: false, message: 'Error en el registro', error: error.message });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body

        try {
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

            const match = await bcrypt.compare(password, usuario.password_hash)
            if (!match) {
                return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
            }

            let id_especifico = null
            let llave_id = 'id_usuario'

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

            const payload = {
                id_usuario: usuario.id_usuario,
                id_rol: usuario.id_rol,
                rol: usuario.nombre_rol,
                id_operativo: id_especifico || usuario.id_usuario,
                tipo_id: llave_id
            }

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

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