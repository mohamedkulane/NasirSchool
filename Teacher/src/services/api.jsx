import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api';

// ✅ Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ REQUEST INTERCEPTOR - FIXED
api.interceptors.request.use((config) => {
  // ✅ Get token from localStorage - Check both possible keys
  let token = localStorage.getItem('teacher_token') || 
               localStorage.getItem('token') ||
               localStorage.getItem('auth_token');
  
  
  if (token) {
    // ✅ Ensure token has "Bearer " prefix
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    config.headers.Authorization = token;
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// ✅ RESPONSE INTERCEPTOR - FIXED
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('🔴 Unauthorized - Redirecting to login');
      // Clear all auth related items
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('teacher_user');
      localStorage.removeItem('user');
      
      // Redirect to login with message
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = `/login?expired=true&return=${encodeURIComponent(returnUrl)}`;
    }
    
    return Promise.reject(error);
  }
);

export const teacherAPI = {
  // Authentication
  login: (credentials) => api.post('/auth/teacher/login', credentials),
  
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),
  
  // Classes
  getClasses: () => api.get('/teacher/classes'),
  
  // Exam Results
  getExamResults: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.className && filters.className !== 'all') {
      params.append('class', filters.className);
    }
    
    if (filters.subject && filters.subject !== 'all') {
      params.append('subject', filters.subject);
    }
    
    if (filters.exam_type && filters.exam_type !== 'all') {
      params.append('exam_type', filters.exam_type);
    }
    
    console.log('🔵 Fetching exam results with params:', params.toString());
    return api.get(`/teacher/exam-results?${params.toString()}`);
  },
  
  // Create/Update exam result
  saveExamResult: (data) => {
    console.log('🔵 Saving exam result:', data);
    return api.post('/teacher/exam-results', data);
  },
  
  // ✅ KU DAR THESE FUNCTIONS
  updateExamResult: (resultId, data) => {
    console.log('🔵 Updating exam result:', resultId, data);
    return api.put(`/teacher/exam-results/${resultId}`, data);
  },
  
  deleteExamResult: (resultId) => {
    console.log('🔵 Deleting exam result:', resultId);
    return api.delete(`/teacher/exam-results/${resultId}`);
  },

    createExamResult: (data) => {
    console.log('🔵 Creating exam result:', data);
    return api.post('/teacher/exam-results', data);
  },
  
  // Bulk save results
  saveBulkResults: (data) => api.post('/teacher/exam-results/bulk', data),
  
  // Get students by class
  getStudentsByClass: (className) => {
    console.log('🔵 Getting students for class:', className);
    return api.get(`/teacher/students-by-class?className=${className}`);
  },
  
  // Attendance
  getAttendance: (params) => api.get('/teacher/attendance', { params }),
  createAttendance: (data) => api.post('/teacher/attendance', data),
  
  // Change Password
  changePassword: (data) => {
    console.log('🔵 Changing password with data:', { 
      currentPassword: '***', 
      newPassword: '***' 
    });
    
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    };
    
    return api.put('/teacher/change-password', payload);
  },
  
  // Profile
  getProfile: () => api.get('/teacher/profile'),
  
  // Logout
  logout: () => api.post('/teacher/logout')
};

export default api;