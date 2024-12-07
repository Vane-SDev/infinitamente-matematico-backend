const mysql = require('mysql2');
require('dotenv').config(); // Carga las variables de entorno desde .env

// Crear conexión a la base de datos
const connection = mysql.createPool({
  host: process.env.DB_HOST,      // Dirección del servidor
  user: process.env.DB_USER,      // Usuario
  password: process.env.DB_PASSWORD, // Contraseña
  database: process.env.DB_NAME,  // Nombre de la base de datos
});

// Probar la conexión
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos exitosa.');
    conn.release(); // Liberar conexión del pool
  }
});

module.exports = connection;