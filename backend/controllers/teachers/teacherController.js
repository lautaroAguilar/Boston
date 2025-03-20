const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los profesores
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        professionalCategory: true,
        languages: {
          include: {
            language: true
          }
        }
      }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un profesor por ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: {
        professionalCategory: true,
        languages: {
          include: {
            language: true
          }
        }
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo profesor
const createTeacher = async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      email,
      phone,
      CBU,
      CUIT,
      professionalCategoryId,
      languageIds,
      fictitiousSeniority,
      bostonSeniority,
      observations
    } = req.body;

    const teacher = await prisma.teacher.create({
      data: {
        lastName,
        firstName,
        email,
        phone,
        CBU,
        CUIT,
        professionalCategoryId: parseInt(professionalCategoryId),
        fictitiousSeniority: parseInt(fictitiousSeniority),
        bostonSeniority: parseInt(bostonSeniority),
        observations,
        languages: {
          create: languageIds.map(langId => ({
            language: {
              connect: { id: parseInt(langId) }
            }
          }))
        }
      },
      include: {
        professionalCategory: true,
        languages: {
          include: {
            language: true
          }
        }
      }
    });

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un profesor
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lastName,
      firstName,
      email,
      phone,
      CBU,
      CUIT,
      professionalCategoryId,
      languageIds,
      fictitiousSeniority,
      bostonSeniority,
      observations
    } = req.body;

    // Primero eliminamos las relaciones existentes con los idiomas
    await prisma.teacherLanguages.deleteMany({
      where: { teacherId: parseInt(id) }
    });

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        lastName,
        firstName,
        email,
        phone,
        CBU,
        CUIT,
        professionalCategoryId: parseInt(professionalCategoryId),
        fictitiousSeniority: parseInt(fictitiousSeniority),
        bostonSeniority: parseInt(bostonSeniority),
        observations,
        languages: {
          create: languageIds.map(langId => ({
            language: {
              connect: { id: parseInt(langId) }
            }
          }))
        }
      },
      include: {
        professionalCategory: true,
        languages: {
          include: {
            language: true
          }
        }
      }
    });

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un profesor
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminamos las relaciones con los idiomas
    await prisma.teacherLanguages.deleteMany({
      where: { teacherId: parseInt(id) }
    });

    // Luego eliminamos el profesor
    await prisma.teacher.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Profesor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
}; 