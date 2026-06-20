import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/dbConfig.js'; 
import { authMiddleware } from './middleware/authMiddleware.js';

// Importación de Rutas
import clientRoute from './routes/clientRoute.js';
import usuarioRoute from './routes/usuarioRoute.js';
import rolRoute from './routes/rolRoute.js';
import especialistaRoute from './routes/especialistaRoute.js';
import servicioRoute from './routes/servicioRoute.js';
import authRoute from './routes/authRoute.js';
import turnoRoute from './routes/turnoRoute.js';
import evolucionRoute from './routes/evolucionRoute.js';
import pagoRoute from './routes/pagoRoute.js';
import facturaRoute from './routes/facturaRoute.js';
import bloqueoAgendaRoutes from './routes/bloqueoAgendaRoute.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: "¡Hola Daniela! Backend moderno con seguridad activa 🚀" });
});

// --- RUTAS PÚBLICAS ---
app.use('/api/auth', authRoute); // Login y Registro (No llevan middleware)

// --- RUTAS PROTEGIDAS (Requieren Token) ---
app.use('/api/clientes', authMiddleware, clientRoute);
app.use('/api/usuarios', authMiddleware, usuarioRoute);
app.use('/api/roles', authMiddleware, rolRoute);
app.use('/api/especialistas', authMiddleware, especialistaRoute);
app.use('/api/servicios', authMiddleware, servicioRoute);
app.use('/api/turnos', authMiddleware, turnoRoute);
app.use('/api/evoluciones', authMiddleware, evolucionRoute);
app.use('/api/pagos', authMiddleware, pagoRoute);
app.use('/api/facturas', authMiddleware, facturaRoute);
app.use('/api/bloqueos', authMiddleware, bloqueoAgendaRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🟢 Servidor Moderno corriendo en el puerto ${PORT}`);
    console.log(`=================================================`);
});