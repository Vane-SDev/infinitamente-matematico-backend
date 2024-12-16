const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const users = [
    {
        id: 1,
        username: 'admin',
        password: '123456', // Esto debe ser encriptado 
        role: 'admin',
    },
];

// Endpoint para login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verificar usuario y contraseña
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET, // Clave secreta que debe estar en tu archivo .env
        { expiresIn: '1h' } // Tiempo de expiración del token
    );

    res.json({ token });
});

module.exports = router;
