const bcrypt = require('bcryptjs');
const { generateTemporaryPassword } = require('../../utils/passwordGenerator');
const { MailService } = require('../../services/mail.js')
const { UserModel } = require('../../models/users/users.js')

class PasswordController {
  constructor({ userAuthModel }) {
    this.userAuthModel = userAuthModel;
    this.mailService = new MailService();
  }

  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Buscar el usuario por ID usando el modelo existente
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar la contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'La contraseña actual es incorrecta'
        });
      }

      // Hashear la nueva contraseña
      const saltRounds = process.env.NODE_ENV === 'production' ? parseInt(process.env.SALT_ROUNDS) : 1;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña
      const updated = await this.userAuthModel.changePassword(userId, hashedPassword, false);
      
      if (!updated) {
        return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
      }

      // Enviar email de notificación
      const emailSent = await this.mailService.sendPasswordChangedNotification(
        user.email,
        user.first_name
      );

      if (!emailSent) {
        return res.status(500).json({ error: 'No se pudo enviar el email de notificación' });
      }

      return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      return res.status(500).json({
        error: 'Error al actualizar la contraseña',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  resetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      
      // Buscar usuario por email
      const user = await this.userAuthModel.findOne(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return res.status(200).json({ 
          message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña' 
        });
      }

      // Generar nueva contraseña temporal
      const temporaryPassword = generateTemporaryPassword();
      
      // Hashear la contraseña
      const saltRounds = process.env.NODE_ENV === 'production' ? parseInt(process.env.SALT_ROUNDS) : 1;
      const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

      // Actualizar la contraseña del usuario como temporal
      const updated = await this.userAuthModel.changePassword(user.id, hashedPassword, true);

      if (!updated) {
        return res.status(500).json({ 
          error: 'No se pudo actualizar la contraseña temporal' 
        });
      }

      // Enviar email con la contraseña temporal
      const emailSent = await this.mailService.sendTemporaryPassword(
        user.email,
        user.first_name,
        temporaryPassword
      );

      if (!emailSent) {
        return res.status(500).json({ 
          error: 'No se pudo enviar el email con la contraseña temporal' 
        });
      }

      return res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña' 
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Error al procesar la solicitud',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = { PasswordController }; 