import { authAPI } from './api'

export const loginStudent = async (studentId, password) => {
  try {
    const response = await authAPI.studentLogin(studentId, password)
    if (response.success) {
      localStorage.setItem('student_token', response.data.token)
      localStorage.setItem('student_id', response.data.student._id)
      return { success: true, data: response.data }
    }
    return { success: false, error: response.error }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    }
  }
}

export const logoutStudent = () => {
  localStorage.removeItem('student_token')
  localStorage.removeItem('student_id')
}

export const getCurrentStudent = () => {
  const studentId = localStorage.getItem('student_id')
  const token = localStorage.getItem('student_token')
  return { studentId, token }
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('student_token')
}