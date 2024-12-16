const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/email"); // Utilidad para enviar correos
const { body, validationResult } = require("express-validator"); // Validadores
const pool = require("../config/database"); // Conexión a la base de datos

// Registrar un estudiante con validaciones
router.post(
    "/register",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("pais").notEmpty().withMessage("El país es obligatorio"),
        body("telefono")
            .isMobilePhone("any")
            .withMessage("Debe ser un número de teléfono válido"),
        body("email").isEmail().withMessage("Debe ser un correo electrónico válido"),
        body("materia").notEmpty().withMessage("La materia es obligatoria"),
        body("fecha")
            .isISO8601()
            .toDate()
            .withMessage("La fecha debe estar en formato AAAA/MM/DD"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, pais, telefono, email, materia, fecha } = req.body;
        console.log("Datos recibidos:", { nombre, pais, telefono, email, materia, fecha });

        try {
            const formattedFecha = new Date(fecha).toISOString().slice(0, 19).replace("T", " ");

            const query = `
                INSERT INTO estudiantes (nombre, pais, telefono, email, materia, fecha)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await pool.query(query, [nombre, pais, telefono, email, materia, formattedFecha]);

            // Enviar correo al administrador
            await sendEmail(
                process.env.EMAIL_USER,
                "Nuevo estudiante registrado",
                `Detalles del estudiante:\n- Nombre: ${nombre}\n- País: ${pais}\n- Teléfono: ${telefono}\n- Email: ${email}\n- Materia: ${materia}\n- Fecha: ${fecha}`
            );

            res.status(201).json({ message: "Registro exitoso y correo enviado al administrador", studentId: result.insertId });
        } catch (err) {
            console.error("Error al registrar estudiante:", err);
            res.status(500).json({ error: "Error al registrar estudiante", details: err.message });
        }
    }
);

// Crear una reserva con validaciones y evitando duplicados
router.post(
    "/reservas",
    [
        body("estudiante_id").isInt().withMessage("El ID del estudiante debe ser un número entero"),
        body("fecha_reserva").isISO8601().withMessage("La fecha debe estar en formato ISO8601"),
        body("hora_reserva").matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage("La hora debe estar en formato HH:MM:SS"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { estudiante_id, fecha_reserva, hora_reserva } = req.body;

        try {
            // Verificar si ya existe una reserva para la misma fecha y hora
            const checkQuery = `
                SELECT * FROM reservas WHERE DATE(fecha_reserva) = ? AND TIME(hora_reserva) = ?
            `;
            const [existingReservation] = await pool.query(checkQuery, [fecha_reserva, hora_reserva]);
            console.log(existingReservation)
            if (existingReservation.length > 0) {
                console.log("Reserva duplicada encontrada: ",existingReservation)
                return res.status(400).json({ error: "El horario ya está reservado. Por favor, elige otro horario." });
            }

            // Obtener detalles del estudiante
            const [estudiante] = await pool.query("SELECT nombre, email FROM estudiantes WHERE id = ?", [estudiante_id]);
            if (estudiante.length === 0) {
                return res.status(404).json({ error: "Estudiante no encontrado" });
            }

            const { nombre, email } = estudiante[0];

            // Insertar la reserva en la base de datos
            const insertQuery = `
                INSERT INTO reservas (estudiante_id, fecha_reserva, hora_reserva)
                VALUES (?, ?, ?)
            `;
            const [result] = await pool.query(insertQuery, [estudiante_id, fecha_reserva, hora_reserva]);

            // Marcar el horario como reservado en el calendario
            const updateQuery = `
                UPDATE calendario_disponible
                SET reservado = TRUE
                WHERE fecha = ? AND hora_inicio = ?
            `;
            await pool.query(updateQuery, [fecha_reserva, hora_reserva]);

            // Enviar correos
            await sendEmail(
                process.env.EMAIL_USER,
                "Nueva reserva creada",
                `Detalles de la reserva:\n- Nombre del estudiante: ${nombre}\n- Fecha: ${fecha_reserva}\n- Hora: ${hora_reserva}`
            );

            await sendEmail(
                email,
                "Confirmación de tu reserva",
                `Hola ${nombre},\nTu reserva ha sido confirmada.\n- Fecha: ${fecha_reserva}\n- Hora: ${hora_reserva}\nGracias por elegir Infinitamente Matemático.`
            );

            res.status(201).json({ message: "Reserva creada con éxito y correos enviados" });
        }  catch (err) {
            // Manejo específico para errores de duplicación
            if (err.code === "ER_DUP_ENTRY") {
                console.error("Reserva duplicada detectada:", err);
                return res.status(400).json({ error: "El horario ya está reservado. Por favor, elige otro horario." });
            }
            console.error("Error inesperado al crear reserva:", err);
            res.status(500).json({ error: "Error al crear reserva" });
        }
    }
);

// Obtener horarios disponibles
router.get("/calendario", async (req, res) => {
    try {
        const query = "SELECT * FROM calendario_disponible WHERE reservado = FALSE";
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error al obtener horarios disponibles:", err);
        res.status(500).json({ error: "Error al obtener horarios disponibles" });
    }
});

// Obtener reservas de un estudiante
router.get("/reservas/:estudiante_id", async (req, res) => {
    const { estudiante_id } = req.params;

    try {
        const query = `
            SELECT r.*, c.fecha, c.hora_inicio, c.hora_fin
            FROM reservas r
            JOIN calendario_disponible c ON r.fecha_reserva = c.fecha AND r.hora_reserva = c.hora_inicio
            WHERE r.estudiante_id = ?
        `;
        const [results] = await pool.query(query, [estudiante_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error al obtener reservas:", err);
        res.status(500).json({ error: "Error al obtener reservas" });
    }
});

module.exports = router;
