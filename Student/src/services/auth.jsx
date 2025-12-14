import { authAPI, studentAPI } from './api'

export const loginStudent = async (studentId, password) => {
  try {
    const response = await authAPI.studentLogin(studentId, password)
    if (response.success) {
      localStorage.setItem('student_token', response.data.token)
      localStorage.setItem('student_id', response.data.student._id)
      localStorage.setItem('student_name', response.data.student.Std_Name)
      localStorage.setItem('loginAllowed', 'true')
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
  localStorage.removeItem('student_name')
  localStorage.removeItem('loginAllowed')
}

export const getCurrentStudent = () => {
  const studentId = localStorage.getItem('student_id')
  const token = localStorage.getItem('student_token')
  const loginAllowed = localStorage.getItem('loginAllowed') === 'true'
  return { studentId, token, loginAllowed }
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('student_token')
}

// ✅ SAXI: Use the correct API method (getProfile instead of .get())
export const checkTokenValidity = async () => {
  try {
    const token = localStorage.getItem('student_token')
    if (!token) return false
    
    // Use the existing getProfile method to validate the token
    const response = await studentAPI.getProfile()
    // Adjust based on your actual API response structure
    return response.success || !!response.data
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

let tokenCheckInterval = null

export const startTokenValidation = () => {
  if (tokenCheckInterval) clearInterval(tokenCheckInterval)
  
  // Only start if user is logged in AND not on login page
  const token = localStorage.getItem('student_token')
  if (!token || window.location.pathname === '/login') return
  
  tokenCheckInterval = setInterval(async () => {
    const isValid = await checkTokenValidity()
    if (!isValid && window.location.pathname !== '/login') {
      logoutStudent()
      window.location.href = '/login'
    }
  }, 300000) // Check every 5 minutes
}

export const stopTokenValidation = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
    tokenCheckInterval = null
  }
}