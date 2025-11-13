import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacher_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Teacher specific API calls - CORRECTED
export const teacherAPI = {
  login: (credentials) => api.post('/auth/teacher/login', credentials),
  
  // ✅ FIXED: Pass teacherId as query parameter correctly
  getDashboard: (teacherId) => api.get('/teacher/dashboard', { 
    params: { teacherId } 
  }),
  
  getClasses: (teacherId) => api.get('/teacher/classes', { 
    params: { teacherId } 
  }),
  
  getExamResults: (params) => api.get('/teacher/exam-results', { params }),
  createExamResult: (data) => api.post('/teacher/exam-results', data),
  updateExamResult: (id, data) => api.put(`/teacher/exam-results/${id}`, data),
  getAttendance: (params) => api.get('/teacher/attendance', { params }),
  createAttendance: (data) => api.post('/teacher/attendance', data),
  changePassword: (data) => api.put('/teacher/change-password', data),
  getStudentsByClass: (className) => api.get('/teacher/students', { 
    params: { class: className } 
  })
};

export default api;