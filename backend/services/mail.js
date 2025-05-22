const nodemailer = require('nodemailer')
const { mailConfig } = require('../config/mail')

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig)
  }

  async sendTemporaryPassword(userEmail, userName, temporaryPassword) {
    const mailOptions = {
      from: `"Sistema Boston" <${mailConfig.auth.user}>`,
      to: userEmail,
      subject: 'Bienvenido al Sistema Boston - Contraseña Temporal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Bienvenido al Sistema Boston</h2>
          <p>Hola ${userName},</p>
          <p>Tu cuenta ha sido creada exitosamente. Para ingresar al sistema, utiliza la siguiente contraseña temporal:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <code style="font-size: 18px; font-weight: bold;">${temporaryPassword}</code>
          </div>
          <p>Por razones de seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión por primera vez.</p>
          <p>Si no solicitaste esta cuenta, por favor contacta al administrador del sistema.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
      text: `Bienvenido al Sistema Boston\n\nHola ${userName},\n\nTu cuenta ha sido creada exitosamente. Para ingresar al sistema, utiliza la siguiente contraseña temporal: ${temporaryPassword}\n\nPor razones de seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión por primera vez.\n\nSi no solicitaste esta cuenta, por favor contacta al administrador del sistema.`
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email enviado: %s', info.messageId)
      return true
    } catch (error) {
      console.error('Error al enviar email:', error)
      return false
    }
  }

  async sendPasswordResetLink(userEmail, userName, resetToken) {
    // Implementación para enviar link de restablecimiento
    const mailOptions = {
      from: `"Sistema Boston" <${mailConfig.auth.user}>`,
      to: userEmail,
      subject: 'Restablecer Contraseña - Sistema Boston',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Restablecer tu contraseña</h2>
          <p>Hola ${userName},</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, haz clic en el siguiente enlace:</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p>Si tú no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
      text: `Restablecer tu contraseña\n\nHola ${userName},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, visita el siguiente enlace:\n\n${process.env.FRONTEND_URL}/reset-password?token=${resetToken}\n\nSi tú no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.\n\nEste enlace expirará en 1 hora por razones de seguridad.`
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email enviado: %s', info.messageId)
      return true
    } catch (error) {
      console.error('Error al enviar email:', error)
      return false
    }
  }

  async sendPasswordChangedNotification(userEmail, userName) {
    const mailOptions = {
      from: `"Sistema Boston" <${mailConfig.auth.user}>`,
      to: userEmail,
      subject: 'Contraseña Actualizada - Sistema Boston',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Contraseña Actualizada</h2>
          <p>Hola ${userName},</p>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <p>Si no realizaste este cambio, por favor contacta al administrador del sistema inmediatamente.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
      text: `Contraseña Actualizada\n\nHola ${userName},\n\nTu contraseña ha sido actualizada exitosamente.\n\nSi no realizaste este cambio, por favor contacta al administrador del sistema inmediatamente.`
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email enviado: %s', info.messageId)
      return true
    } catch (error) {
      console.error('Error al enviar email:', error)
      return false
    }
  }
}

module.exports = { MailService }
