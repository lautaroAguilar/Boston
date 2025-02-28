import {
  validateStudents,
  validatePartialStudents
} from '../../schemas/students/students.js'

export class StudentsController {
  constructor({ studentsModel }) {
    this.studentsModel = studentsModel
  }
  create = async (req, res) => {
    try {
      const result = validateStudents(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const newStudent = await this.studentsModel.create(result.data)
      res.status(201).json(newStudent)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message })
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
      res.status(200).json(students)
    } catch (error) {
      res.status(500).json({
        error: 'Error al buscar estudiantes'
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
      return res.status(500).json({ error: 'Error al buscar el estudiante' })
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
      return res.json(affectedRows)
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar el estudiante' })
    }
  }
  updateById = async (req, res) => {
    const result = validatePartialStudents(req.body)
    if (!result.success) {
      return res.status(400).json(result.error.issues)
    }
    try {
      const { id } = req.params
      const affectedRows = await this.studentsModel.updateById(id, result.data)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró al estudiante que deseas eliminar' })
      }
      res
        .status(201)
        .json({ message: 'Se actualizo correctamente al estudiante' })
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Error al actualizar el estudiante' })
    }
  }
}
