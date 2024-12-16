require('dotenv').config(); // Cargar variables de entorno


const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const estudianteRoutes = require('./routes/estudiantes'); // Importar rutas

const app = express();

// Middleware Procesan la solicitud del servidor
app.use(bodyParser.json());
app.use(cors());

// Rutas de la API
app.use('/api', estudianteRoutes); // Montar las rutas de estudiantes

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores: si hay errores en las rutas se pasan aca
app.use(errorHandler);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

