import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Token automatic ku dar headerska
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('student_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.status)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('student_token')
      localStorage.removeItem('student_id')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  // ✅ SAXO: /student (singular) - sida backend-kaagu
  studentLogin: (studentId, password) => 
    api.post('/student/login', { studentId, password }),
}

export const studentAPI = {
  // ✅ SAXO: /student (singular) - sida backend-kaagu
  getProfile: () => api.get('/student/profile'),
  
  changePassword: (data) => api.put('/student/change-password', data),
  
  getExamResults: () => api.get('/student/exam-results'),
  
  getAttendance: (params = {}) => api.get('/student/attendance', { params }),
  
  getDashboard: () => api.get('/student/dashboard'),
}

export default api