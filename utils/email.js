const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config(); // Cargar las variables de entorno desde .env

// Configuración de OAuth2 con Google
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendEmail = async (to, subject, text) => {
    try {
        // Obtener un access token válido
        const accessToken = await oAuth2Client.getAccessToken();

        // Configuración del transportador con OAuth2
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER, // Dirección del remitente
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token, // Token válido
            },
            // logger: true, // Habilita registros
            // debug: true,  // Muestra información adicional en la consola
        });

        // Opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER, // Dirección del remitente
            to, // Dirección del destinatario
            subject, // Asunto del correo
            text, // Contenido del correo
        };

        // Enviar el correo
        const result = await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito:', result);
    } catch (error) {
        console.error('Error al enviar correo:', error);
    }
};

module.exports = sendEmail;
