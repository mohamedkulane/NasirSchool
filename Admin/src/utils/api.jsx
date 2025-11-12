// src/utils/api.jsx - UPDATED WITH EXPORT EXPENSES
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const authAPI = {
  adminLogin: (username, password) => 
    api.post('/auth/login/admin', { username, password }),
  
  teacherLogin: (username, password) => 
    api.post('/auth/login/teacher', { username, password }),
  
  studentLogin: (stdId, password) => 
    api.post('/auth/login/student', { Std_ID: stdId, Std_Password: password }),
};

export const adminAPI = {
  // Students
  getStudents: (params) => api.get('/admin/students', { params }),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  exportStudents: (className) => 
    api.get('/admin/students/export', { 
      params: { className },
      responseType: 'blob' 
    }),
  importStudents: (formData) => 
    api.post('/admin/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // Teachers
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  exportTeachers: () => 
    api.get('/admin/teachers/export', { 
      responseType: 'blob' 
    }),

  // Expenses - UPDATED WITH EXPORT FUNCTION
  getExpenses: (params) => api.get('/admin/expenses', { params }),
  createExpense: (data) => api.post('/admin/expenses', data),
  updateExpense: (id, data) => api.put(`/admin/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/expenses/${id}`),
  getExpenseStats: () => api.get('/admin/expenses/stats'),
  // ✅ ADD THIS EXPORT EXPENSES FUNCTION
  exportExpenses: (filters = {}) => 
    api.get('/admin/expenses/export', { 
      params: filters,
      responseType: 'blob' 
    }),

  // Exam Results
  getExamResults: (params) => api.get('/admin/exam-results', { params }),
  exportExamResults: (filters) => 
    api.get('/admin/exam-results/export', { 
      params: filters,
      responseType: 'blob' 
    }),

  // Attendance
  getAttendance: (params) => api.get('/admin/attendance', { params }),
  getAbsentToday: () => api.get('/admin/attendance/absent-today'),
  exportAttendance: (params) => 
    api.get('/admin/attendance/export', { 
      params,
      responseType: 'blob' 
    }),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
};

export default api;