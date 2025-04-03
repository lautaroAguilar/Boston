/* const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendWelcomeEmail({ to, temporaryPassword, teacherName }) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Bienvenido a Boston - Tus credenciales de acceso',
            html: `
                <h1>¡Bienvenido a Boston!</h1>
                <p>Hola ${teacherName},</p>
                <p>Tu cuenta ha sido creada exitosamente. Tus credenciales de acceso son:</p>
                <ul>
                    <li><strong>Email:</strong> ${to}</li>
                    <li><strong>Contraseña temporal:</strong> ${temporaryPassword}</li>
                </ul>
                <p>Por favor, ingresa a <a href="${process.env.FRONTEND_URL}/login">nuestro sistema</a> y cambia tu contraseña en el primer inicio de sesión.</p>
                <p>Por razones de seguridad, esta contraseña temporal expirará en 24 horas.</p>
                <br>
                <p>Saludos,<br>Equipo Boston</p>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw new Error('Error al enviar el email de bienvenida');
        }
    }
}

module.exports = new EmailService();  */