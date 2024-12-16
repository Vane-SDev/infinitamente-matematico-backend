const sendEmail = require('./utils/email'); // Ajusta la ruta según tu estructura

const testEmail = async () => {
    try {
        await sendEmail(
            'infinitamentematematico@gmail.com', // Cambia por tu correo o el de prueba
            'Prueba de correo',
            'Este es un correo de prueba desde la app Infinitamente Matemático.'
        );
        console.log('Correo enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

testEmail();