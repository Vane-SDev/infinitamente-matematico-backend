const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./config/database'); // Conexión a la base de datos

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas de la API

// Registrar un estudiante
app.post('/api/register', (req, res) => {
  const { nombre, pais, telefono, materia, fecha } = req.body;

  const query = `
    INSERT INTO estudiantes (nombre, pais, telefono, materia, fecha) 
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [nombre, pais, telefono, materia, fecha], (err, results) => {
    if (err) {
      console.error('Error al registrar estudiante:', err);
      res.status(500).send('Error al registrar estudiante');
    } else {
      res.status(201).json({ message: 'Registro exitoso', studentId: results.insertId });
    }
  });
});

// Obtener todos los estudiantes
app.get('/api/estudiantes', (req, res) => {
  const query = 'SELECT * FROM estudiantes';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener estudiantes:', err);
      res.status(500).send('Error al obtener estudiantes');
    } else {
      res.status(200).json(results);
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));


app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});