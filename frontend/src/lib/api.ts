import axios from 'axios';

// Type definitions
interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  batch?: string;
  enrollmentDate?: string;
}

interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { identifier: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterData) =>
    api.post('/auth/register', userData),
  
  getMe: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Students API
export const studentsAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/students', { params }),
  
  getById: (id: string) =>
    api.get(`/students/${id}`),
  
  create: (data: StudentData) =>
    api.post('/students', data),
  
  update: (id: string, data: Partial<StudentData>) =>
    api.put(`/students/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/students/${id}`),
};

// Batches API
export const batchesAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/batches', { params }),
  
  getById: (id: string) =>
    api.get(`/batches/${id}`),
  
  create: (data: any) =>
    api.post('/batches', data),
  
  update: (id: string, data: any) =>
    api.put(`/batches/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/batches/${id}`),
};

// Subjects API
export const subjectsAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/subjects', { params }),
  
  getById: (id: string) =>
    api.get(`/subjects/${id}`),
  
  create: (data: any) =>
    api.post('/subjects', data),
  
  update: (id: string, data: any) =>
    api.put(`/subjects/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/subjects/${id}`),
};

// Grades API
export const gradesAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/grades', { params }),

  getById: (id: string) =>
    api.get(`/grades/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/grades', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/grades/${id}`, data),

  delete: (id: string) =>
    api.delete(`/grades/${id}`),

  assignStudents: (id: string, studentIds: string[]) =>
    api.post(`/grades/${id}/assign-students`, { studentIds }),

  removeStudent: (id: string, studentId: string) =>
    api.delete(`/grades/${id}/students/${studentId}`),

  assignSubjects: (id: string, subjectIds: string[]) =>
    api.post(`/grades/${id}/assign-subjects`, { subjectIds }),

  removeSubject: (id: string, subjectId: string) =>
    api.delete(`/grades/${id}/subjects/${subjectId}`),
};

// Marks API
export const marksAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/marks', { params }),
  
  getById: (id: string) =>
    api.get(`/marks/${id}`),
  
  create: (data: any) =>
    api.post('/marks', data),
  
  update: (id: string, data: any) =>
    api.put(`/marks/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/marks/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params?: QueryParams) =>
    api.get('/attendance', { params }),
  
  getById: (id: string) =>
    api.get(`/attendance/${id}`),
  
  create: (data: any) =>
    api.post('/attendance', data),
  
  update: (id: string, data: any) =>
    api.put(`/attendance/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/attendance/${id}`),
  
  markBulk: (data: any[]) =>
    api.post('/attendance/bulk', data),
};

export default api;
