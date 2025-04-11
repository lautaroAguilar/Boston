const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Insertar estados de grupos
  await prisma.groupStatus.createMany({
    data: [
      { 
        name: 'En formación',
        description: 'Grupo en proceso de formación',
        isDefault: false
      },
      { 
        name: 'Activo',
        description: 'Grupo activo y en funcionamiento',
        isDefault: true
      },
      { 
        name: 'Finalizado',
        description: 'Grupo que ha completado su ciclo',
        isDefault: false
      },
      { 
        name: 'Cancelado',
        description: 'Grupo que fue cancelado',
        isDefault: false
      }
    ]
  })

  // Insertar estados de estudiantes
  await prisma.studentStatus.createMany({
    data: [
      { 
        name: 'Activo',
        description: 'Estudiante activo en el sistema',
        isDefault: true
      },
      { 
        name: 'Inactivo',
        description: 'Estudiante inactivo temporalmente',
        isDefault: false
      },
      { 
        name: 'En pausa',
        description: 'Estudiante que ha pausado sus estudios',
        isDefault: false
      },
      { 
        name: 'Graduado',
        description: 'Estudiante que ha completado sus estudios',
        isDefault: false
      }
    ]
  })

  // Insertar modalidades
  await prisma.modality.createMany({
    data: [
      { 
        name: 'Presencial',
        description: 'Clases en modalidad presencial'
      },
      { 
        name: 'Virtual',
        description: 'Clases en modalidad virtual'
      },
      { 
        name: 'Híbrido',
        description: 'Clases en modalidad mixta'
      }
    ]
  })
  /* Comentado porque probablemente ya existe en la base de datos
  // Insertar idiomas
  await prisma.languages.createMany({
    data: [
      { name: 'Inglés' },
      { name: 'Español' },
      { name: 'Portugués' }
    ]
  })

  // Insertar categorías profesionales
  await prisma.professionalCategory.createMany({
    data: [
      { name: 'Recibido' },
      { name: 'Estudiante' },
      { name: 'Nativo' }
    ]
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

  // Crear usuario admin
  await prisma.users.create({
    data: {
      first_name: 'Administrador',
      last_name: 'Boston',
      email: 'admin@example.com',
      password: '$2a$10$L3NoPhe9qiTyB002UCVd/.Xy.0CB0olJaBHdMK4EgXZcqfjv.CzVi',
      role_id: 1 // ID del rol ADMIN
    }
  })
  */
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
