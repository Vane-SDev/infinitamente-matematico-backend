const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Leer token del header

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar token
        req.user = decoded; // Guardar información del usuario en req.user
        next(); // Pasar al siguiente middleware o ruta
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;
