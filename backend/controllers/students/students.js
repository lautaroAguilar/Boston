const {
  validateStudents,
  validatePartialStudents
} = require('../../schemas/students/students.js')
const { CourseEnrollmentModel } = require('../../models/course-enrollment/courseEnrollment')
const { 
  validateCourseEnrollment,
  validatePartialCourseEnrollment,
  validateCompleteCourse
} = require('../../schemas/course-enrollment/courseEnrollment')

class StudentsController {
  constructor({ studentsModel }) {
    this.studentsModel = studentsModel
    this.courseEnrollmentModel = CourseEnrollmentModel
  }
  create = async (req, res) => {
    try {
      const result = validateStudents(req.body)
      if (!result.success) {
        console.error('Error de validación al crear estudiante:', {
          issues: result.error.issues,
          body: req.body
        })
        return res.status(400).json(result.error.issues)
      }
      const newStudent = await this.studentsModel.create(result.data)
      res.status(201).json(newStudent)
    } catch (error) {
      res.status(500).json({
        error: 'Error al crear el estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getAll = async (req, res) => {
    try {
      const { companyId } = req.query
      const students = await this.studentsModel.getAll({ companyId })
      if (!students.length) {
        return res
          .status(200)
          .json({ data: [], message: 'No se encontraron estudiantes' })
      }
      res
        .status(200)
        .json({ data: students, message: 'Estudiantes encontrados' })
    } catch (error) {
      res.status(500).json({
        error: 'Error al buscar estudiantes',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { id } = req.params
      const studentData = await this.studentsModel.getById(id)
      if (!studentData) {
        return res.status(404).json({ error: 'No se encontró el estudiante' })
      }
      return res.json(studentData)
    } catch (error) {
      return res.status(500).json({
        error: 'Error al buscar el estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  deleteById = async (req, res) => {
    try {
      const { id } = req.params
      const affectedRows = await this.studentsModel.deleteById(id)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró al estudiante que deseas eliminar' })
      }
      return res.json({ message: 'Estudiante eliminado correctamente' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al eliminar el estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  updateById = async (req, res) => {
    try {
      const result = validatePartialStudents(req.body)
      if (!result.success) {
        console.error('Error de validación al actualizar estudiante:', {
          issues: result.error.issues,
          body: req.body
        })
        return res.status(400).json(result.error.issues)
      }

      const { id } = req.params
      const affectedRows = await this.studentsModel.updateById(id, result.data)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró al estudiante que deseas actualizar' })
      }
      res.status(201).json({ message: 'Estudiante actualizado correctamente' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al actualizar el estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Nuevos métodos para gestión de inscripciones a cursos
  getEnrollments = async (req, res) => {
    try {
      const { id } = req.params
      const enrollments = await this.courseEnrollmentModel.getByStudentId(id)
      
      return res.status(200).json({ data: enrollments, message: 'Inscripciones encontradas' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al obtener inscripciones del estudiante',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  
  updateEnrollment = async (req, res) => {
    try {
      const { id, enrollmentId } = req.params
      
      // Validar datos de actualización
      const result = validatePartialCourseEnrollment(req.body)
      if (!result.success) {
        console.error('Error de validación al actualizar inscripción:', {
          issues: result.error.issues,
          body: req.body
        })
        return res.status(400).json(result.error.issues)
      }
      
      const enrollmentData = result.data
      
      // Verificar si existen campos para actualizar
      if (Object.keys(enrollmentData).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' })
      }
      
      const affectedRows = await this.courseEnrollmentModel.updateById(enrollmentId, enrollmentData)
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró la inscripción' })
      }
      
      // Obtener la inscripción actualizada
      const updatedEnrollment = await this.courseEnrollmentModel.getById(enrollmentId)
      
      return res.status(200).json({ 
        data: updatedEnrollment, 
        message: 'Inscripción actualizada correctamente' 
      })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al actualizar inscripción',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  
  completeCourse = async (req, res) => {
    try {
      const { id, enrollmentId } = req.params
      
      // Validar datos para completar el curso
      const result = validateCompleteCourse(req.body)
      if (!result.success) {
        console.error('Error de validación al completar curso:', {
          issues: result.error.issues,
          body: req.body
        })
        return res.status(400).json(result.error.issues)
      }
      
      // Datos validados para completar el curso
      const courseData = {
        ...result.data,
        status: 'completed'
      }
      
      const affectedRows = await this.courseEnrollmentModel.updateById(enrollmentId, courseData)
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró la inscripción' })
      }
      
      // Obtener la inscripción actualizada
      const updatedEnrollment = await this.courseEnrollmentModel.getById(enrollmentId)
      
      return res.status(200).json({ 
        data: updatedEnrollment, 
        message: 'Curso completado correctamente' 
      })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al completar el curso',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { StudentsController }
