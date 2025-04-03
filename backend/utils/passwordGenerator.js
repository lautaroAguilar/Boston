function generateTemporaryPassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += charset.match(/[a-z]/)[0]; // minúscula
    password += charset.match(/[A-Z]/)[0]; // mayúscula
    password += charset.match(/[0-9]/)[0]; // número
    password += charset.match(/[!@#$%^&*]/)[0]; // especial
    
    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = { generateTemporaryPassword }; 