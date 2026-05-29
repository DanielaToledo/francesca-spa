import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/dbConfig.js'; // <-- ¡Acordate de poner siempre el .js al final!

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "¡Hola Daniela! Backend moderno con IMPORT y EXPORT funcionando 🚀" });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🟢 Servidor Moderno corriendo en el puerto ${PORT}`);
    console.log(`=================================================`);
});