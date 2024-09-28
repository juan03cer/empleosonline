const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const util = require('util');

// Crear el transporte de nodemailer
let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de Handlebars de manera asíncrona
(async () => {
    const { default: hbs } = await import('nodemailer-express-handlebars');

    transport.use('compile', hbs({
        viewEngine: {
            extName: '.handlebars',
            partialsDir: __dirname + '/../views/emails',
            layoutsDir: __dirname + '/../views/emails',
            defaultLayout: false,
        },
        viewPath: __dirname + '/../views/emails',
        extName: '.handlebars'
    }));
})();

exports.enviar = async (opciones) => {
    const opcionesEmail = {
        from: 'empleosonline <noreply@empleosonline.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,  // corregido de 'subjet' a 'subject'
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    };

    const sendMail = util.promisify(transport.sendMail.bind(transport));
    await sendMail(opcionesEmail);
};
