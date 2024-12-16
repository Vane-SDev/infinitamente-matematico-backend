require('dotenv').config();
const mysql = require('mysql2/promise');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10, // Límite máximo de conexiones simultáneas
});

// Probar la conexión
(async () => {
  try {
    const connection = await pool.getConnection(); // Obtener una conexión del pool
    console.log('Conexión a la base de datos exitosa.');
    connection.release(); // Liberar la conexión al pool
  } catch (err) {
    switch (err.code) {
      case 'PROTOCOL_CONNECTION_LOST':
        console.error('Conexión con la base de datos perdida.');
        break;
      case 'ER_CON_COUNT_ERROR':
        console.error('Demasiadas conexiones con la base de datos.');
        break;
      case 'ECONNREFUSED':
        console.error('Conexión rechazada por la base de datos.');
        break;
      default:
        console.error('Error al conectar a la base de datos:', err);
    }
  }
})();

module.exports = pool;
