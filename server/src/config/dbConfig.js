import pg from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno del archivo .env
dotenv.config();

const { Pool } = pg;

// Configurar el puente de conexión hacia Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requisito obligatorio para la conexión segura con Supabase
  }
});

// Probar la conexión apenas se levante el servidor
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error al conectar a Supabase:', err.stack);
  }
  console.log('⚡ ¡Conexión exitosa a la base de datos de Supabase!');
  release();
});

export default pool;