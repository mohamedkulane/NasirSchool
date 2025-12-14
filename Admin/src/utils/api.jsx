import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api';

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
    api.post('/auth/teacher/login', { username, password }),
  
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

  // ✅ FIXED: ADD MISSING BULK DENY TEACHER LOGIN FUNCTION
  bulkDenyTeacherLogin: (teacherIds) => 
    api.post('/admin/teachers/bulk-deny-login', { teacherIds }),
  
  // ✅ FIXED: ADD MISSING BULK ALLOW TEACHER LOGIN FUNCTION  
  bulkAllowTeacherLogin: (teacherIds) => 
    api.post('/admin/teachers/bulk-allow-login', { teacherIds }),

  // Teacher Login Control
  getTeachersLoginStatus: () => api.get('/admin/teachers/login-status'),
  denyTeacherLogin: (id) => api.put(`/admin/teachers/${id}/deny-login`),
  allowTeacherLogin: (id) => api.put(`/admin/teachers/${id}/allow-login`),

  // Student Login Control
   // ✅ KU DAR THESE MISSING FUNCTIONS FOR STUDENT LOGIN CONTROL
  allowStudentLogin: (studentId) => 
    api.put(`/admin/students/${studentId}/allow-login`),
  
  denyStudentLogin: (studentId) => 
    api.put(`/admin/students/${studentId}/deny-login`),
  
  bulkAllowStudentLogin: (studentIds) => 
    api.post('/admin/students/bulk-allow-login', { studentIds }),
  
  bulkDenyStudentLogin: (studentIds) => 
    api.post('/admin/students/bulk-deny-login', { studentIds }),
  
  // ✅ KU DAR ALIAS FOR SHORTER NAMES (OPTIONAL)
  bulkAllowLogin: (studentIds) => 
    api.post('/admin/students/bulk-allow-login', { studentIds }),
  
  bulkDenyLogin: (studentIds) => 
    api.post('/admin/students/bulk-deny-login', { studentIds }),

  // Expenses
  getExpenses: (params) => api.get('/admin/expenses', { params }),
  createExpense: (data) => api.post('/admin/expenses', data),
  updateExpense: (id, data) => api.put(`/admin/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/expenses/${id}`),
  getExpenseStats: () => api.get('/admin/expenses/stats'),
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

  // Academic Year Management
  getAcademicYears: () => api.get('/academic/years'),
  createAcademicYear: (data) => api.post('/academic/years', data),
  setActiveAcademicYear: (id) => api.put(`/academic/years/${id}/activate`),
  completeAcademicYear: (id) => api.put(`/academic/years/${id}/complete`),

  // Student Academic Data
  getStudentsByAcademicYear: (filters) => 
    api.get('/academic/students/history', { params: filters }),
  
  getStudentAcademicHistory: (studentId) => 
    api.get(`/academic/students/${studentId}/history`),

  // Transfer Operations
  transferStudents: (data) => api.post('/academic/transfer/individual', data),
  bulkTransferClass: (data) => api.post('/academic/transfer/bulk', data),
  initializeAcademicYear: (data) => api.post('/academic/initialize', data),
  
  // Academic History
  getAllAcademicHistories: (filters) => 
    api.get('/academic/students/history', { params: filters }),
  populateBaseAcademicYear: (data) => api.post('/academic/populate-base-year', data),
  
  exportAcademicHistories: (filters) => 
    api.get('/academic/students/history/export', { 
      params: filters,
      responseType: 'blob'
    }),
};

export default api;