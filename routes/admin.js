const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a la base de datos
const verifyToken = require('../middlewares/auth'); // Middleware para proteger rutas

// Listar todos los estudiantes
router.get('/estudiantes', verifyToken, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM estudiantes');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener estudiantes:', err);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
});

// Crear un nuevo estudiante
router.post('/estudiantes', verifyToken, async (req, res) => {
    const { nombre, email, telefono, materia } = req.body;

    try {
        const query = `
    INSERT INTO estudiantes (nombre, pais, telefono, email, materia, fecha)
    VALUES (?, ?, ?, ?, ?, ?)
`;
const [result] = await pool.query(query, [nombre, pais, telefono, email, materia, fecha]);
        res.status(201).json({ message: 'Estudiante creado con éxito', estudianteId: result.insertId });
    } catch (err) {
        console.error('Error al crear estudiante:', err);
        res.status(500).json({ error: 'Error al crear estudiante' });
    }
});

// Actualizar un estudiante
router.put('/estudiantes/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, materia } = req.body;

    try {
        const query = `
        UPDATE estudiantes
        SET nombre = ?, email = ?, telefono = ?, materia = ?
        WHERE id = ?
    `;
        const [result] = await pool.query(query, [nombre, email, telefono, materia, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        res.json({ message: 'Estudiante actualizado con éxito' });
    } catch (err) {
        console.error('Error al actualizar estudiante:', err);
        res.status(500).json({ error: 'Error al actualizar estudiante' });
    }
});

// Eliminar un estudiante
router.delete('/estudiantes/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM estudiantes WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        res.json({ message: 'Estudiante eliminado con éxito' });
    } catch (err) {
        console.error('Error al eliminar estudiante:', err);
        res.status(500).json({ error: 'Error al eliminar estudiante' });
    }
});

// Listar todas las reservas
router.get("/reservas", verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT r.*, e.nombre AS estudiante_nombre, c.fecha, c.hora_inicio, c.hora_fin
            FROM reservas r
            JOIN estudiantes e ON r.estudiante_id = e.id
            JOIN calendario_disponible c ON r.fecha_reserva = c.fecha AND r.hora_reserva = c.hora_inicio
        `;
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error al obtener reservas:", err);
        res.status(500).json({ error: "Error al obtener reservas" });
    }
});

// Agregar horarios disponibles
router.post("/calendario", verifyToken, async (req, res) => {
    const { fecha, hora_inicio, hora_fin } = req.body;

    try {
        const query = `
            INSERT INTO calendario_disponible (fecha, hora_inicio, hora_fin)
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.query(query, [fecha, hora_inicio, hora_fin]);
        res.status(201).json({ message: "Horario agregado con éxito", calendarioId: result.insertId });
    } catch (err) {
        console.error("Error al agregar horario:", err);
        res.status(500).json({ error: "Error al agregar horario" });
    }
});
// Eliminar un horario del calendario
router.delete("/calendario/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM calendario_disponible WHERE id = ?";
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Horario no encontrado" });
        }

        res.status(200).json({ message: "Horario eliminado con éxito" });
    } catch (err) {
        console.error("Error al eliminar horario:", err);
        res.status(500).json({ error: "Error al eliminar horario" });
    }
});

// Modificar un horario existente
router.put("/calendario/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, reservado } = req.body;

    try {
        const query = `
            UPDATE calendario_disponible
            SET fecha = ?, hora_inicio = ?, hora_fin = ?, reservado = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [fecha, hora_inicio, hora_fin, reservado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Horario no encontrado" });
        }

        res.status(200).json({ message: "Horario modificado con éxito" });
    } catch (err) {
        console.error("Error al modificar horario:", err);
        res.status(500).json({ error: "Error al modificar horario" });
    }
});

// Listar horarios ocupados o disponibles
router.get("/calendario", verifyToken, async (req, res) => {
    const { estado } = req.query; // estado puede ser "ocupado" o "disponible"

    try {
        let query;
        if (estado === "ocupado") {
            query = "SELECT * FROM calendario_disponible WHERE reservado = TRUE";
        } else if (estado === "disponible") {
            query = "SELECT * FROM calendario_disponible WHERE reservado = FALSE";
        } else {
            return res.status(400).json({ error: "Estado inválido. Use 'ocupado' o 'disponible'" });
        }

        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error al obtener horarios:", err);
        res.status(500).json({ error: "Error al obtener horarios" });
    }
});



module.exports = router;