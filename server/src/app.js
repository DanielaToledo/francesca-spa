import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/dbConfig.js'; // <-- ¡Acordate de poner siempre el .js al final!
import clientRoute from './routes/clientRoute.js';
import usuarioRoute from './routes/usuarioRoute.js';
import rolRoute from './routes/rolRoute.js'; // <-- Importamos la ruta de roles
import especialistaRoute from './routes/especialistaRoute.js' // <-- Importación (Singular)
import servicioRoute from './routes/servicioRoute.js' // Singular
import authRoute from './routes/authRoute.js' // Importar (Singular)
import turnoRoute from './routes/turnoRoute.js' // Singular
import evolucionRoute from './routes/evolucionRoute.js' // Singular
import pagoRoute from './routes/pagoRoute.js' // Singular
import facturaRoute from './routes/facturaRoute.js' // Singular


// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🟢 Servidor Moderno corriendo en el puerto ${PORT}`);
    console.log(`=================================================`);
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Le damos permiso exclusivo a tu frontend de React
  credentials: true
}));

app.get('/', (req, res) => {
    res.json({ message: "¡Hola Daniela! Backend moderno con IMPORT y EXPORT funcionando 🚀" });
});

// 2. CONECTÁ las rutas a la URL '/api/clientes'
app.use('/api/clientes', clientRoute);
app.use('/api/usuarios', usuarioRoute);
app.use('/api/roles', rolRoute); // <-- Agregamos la ruta de roles
app.use('/api/especialistas', especialistaRoute) // <-- La colección (Plural)
app.use('/api/servicios', servicioRoute) // Plural
app.use('/api/auth', authRoute) // Ruta para autenticación (Registro y Login)
app.use('/api/turnos', turnoRoute) // Plural
app.use('/api/evoluciones', evolucionRoute) // Plural
app.use('/api/pagos', pagoRoute) // Plural
app.use('/api/facturas', facturaRoute) // Plural