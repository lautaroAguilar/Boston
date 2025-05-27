const bcrypt = require('bcryptjs');
const { generateTemporaryPassword } = require('../../utils/passwordGenerator');
const { MailService } = require('../../services/mail.js')
const { validatePasswordChange } = require('../../schemas/auth/password.js');

class PasswordController {
  constructor({ userAuthModel }) {
    this.userAuthModel = userAuthModel;
    this.mailService = new MailService();
  }

  changePassword = async (req, res) => {
    try {
      // Validar los datos usando el schema
      const validationResult = validatePasswordChange(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Error de validación',
          details: validationResult.error.issues
        });
      }

      const { currentPassword, newPassword } = validationResult.data;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Buscar el usuario por ID
      const user = await this.userAuthModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (!user.password) {
        console.error(`Error: Usuario ${userId} no tiene contraseña almacenada`);
        return res.status(500).json({ error: 'Error en la configuración de la cuenta' });
      }

      // Verificar la contraseña actual
      try {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            error: 'La contraseña actual es incorrecta'
          });
        }
      } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return res.status(500).json({ error: 'Error al verificar la contraseña actual' });
      }

      // Hashear la nueva contraseña
      let hashedPassword;
      try {
        const saltRounds = process.env.NODE_ENV === 'production' ? parseInt(process.env.SALT_ROUNDS) : 1;
        hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        if (!hashedPassword) {
          console.error('Error: bcrypt.hash devolvió un valor nulo o indefinido');
          return res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
        }
      } catch (error) {
        console.error('Error al hashear la nueva contraseña:', error);
        return res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
      }

      // Actualizar la contraseña
      try {
        const updated = await this.userAuthModel.changePassword(userId, hashedPassword, false);
        
        if (!updated) {
          return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
        }

        // Verificar que la contraseña se guardó correctamente
        const userAfterUpdate = await this.userAuthModel.findById(userId);
        if (!userAfterUpdate?.password) {
          console.error('Error: La contraseña no se guardó correctamente');
          return res.status(500).json({ error: 'Error al guardar la nueva contraseña' });
        }
      } catch (error) {
        console.error('Error al actualizar la contraseña en la base de datos:', error);
        return res.status(500).json({ error: 'Error al guardar la nueva contraseña' });
      }

      // Enviar email de notificación
      try {
        const emailSent = await this.mailService.sendPasswordChangedNotification(
          user.email,
          user.first_name
        );

        if (!emailSent) {
          console.warn('No se pudo enviar el email de notificación de cambio de contraseña');
        }
      } catch (error) {
        console.warn('Error al enviar email de notificación:', error);
      }

      return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
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