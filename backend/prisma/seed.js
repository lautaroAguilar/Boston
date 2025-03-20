const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  /*  // Insertar idiomas
  await prisma.languages.createMany({
    data: [{ name: 'Inglés' }, { name: 'Español' }, { name: 'Portugues' }]
  })

  // Insertar categorías profesionales
  await prisma.professionalCategory.createMany({
    data: [{ name: 'Recibido' }, { name: 'Estudiante' }, { name: 'Nativo' }]
  })

  // Insertar roles
  await prisma.roles.createMany({
    data: [
      { name: 'Administrador' },
      { name: 'Recursos Humanos' },
      { name: 'Docente' },
      { name: 'Coordinador' }
    ]
  })

  // Insertar módulos 
  await prisma.modules.createMany({
    data: [
      { name: 'A1' },
      { name: 'A2' },
      { name: 'B1' },
      { name: 'B2' },
      { name: 'LC1' },
      { name: 'LC2' },
      { name: 'MC1' },
      { name: 'MC2' },
      { name: 'MC3' },
      { name: 'HC1' },
      { name: 'HC2' },
      { name: 'HC3' },
      { name: 'LD1' },
      { name: 'LD2' },
      { name: 'LD3' },
      { name: 'Advanced Learner' }
    ]
  })
*/
  // Crear usuario admin
  await prisma.users.create({
    data: {
      first_name: 'Administrador',
      last_name: 'Boston',
      email: 'admin@example.com',
      password: '$2a$10$L3NoPhe9qiTyB002UCVd/.Xy.0CB0olJaBHdMK4EgXZcqfjv.CzVi',
      role_id: 1 // ID del rol ADMIN
      // ... otros campos necesarios
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
