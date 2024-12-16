const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Mostrar el error en la consola
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message,
    });
};

module.exports = errorHandler;
