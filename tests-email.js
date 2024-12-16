const sendEmail = require('./utils/email'); 


const testEmail = async () => {
    try {
        await sendEmail(
            
           
        );
        console.log('Correo enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

testEmail();
