import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo imprimir el error en lugar de deslogear automáticamente
      console.warn('Error 401 detectado:', error.config?.url);
      // Comentado temporalmente para evitar logout automático durante pruebas
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export const petService = {
  getMyPets: () => api.get('/pets/my-pets'),
  getByOwner: (ownerId: string) => api.get(`/pets/owner/${ownerId}`),
  createPet: (petData: any) => api.post('/pets', petData),
  updatePet: (id: string, petData: any) => api.put(`/pets/${id}`, petData),
  deletePet: (id: string) => api.delete(`/pets/${id}`),
  getPetById: (id: string) => api.get(`/pets/${id}`),
};

export const appointmentService = {
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  createAppointment: (data: any) => api.post('/appointments', data),
  updateAppointment: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id: string) => api.delete(`/appointments/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/appointments/${id}/status`, { status }),
  getCalendar: () => api.get('/appointments/calendar'),
};

export const medicalHistoryService = {
  getByPet: (petId: string) => api.get(`/medical-history/pet/${petId}`),
  getById: (id: string) => api.get(`/medical-history/${id}`),
};

export const vaccinationService = {
  getByPet: (petId: string) => api.get(`/vaccinations/pet/${petId}`),
  getUpcoming: () => api.get('/vaccinations/upcoming'),
};

export const medicineService = {
  getAll: () => api.get('/medicines'),
  getLowStock: () => api.get('/medicines/low-stock'),
  getExpiring: () => api.get('/medicines/expiring'),
  createMedicine: (data: any) => api.post('/medicines', data),
  updateMedicine: (id: string, data: any) => api.put(`/medicines/${id}`, data),
  deleteMedicine: (id: string) => api.delete(`/medicines/${id}`),
  updateStock: (id: string, data: any) => api.patch(`/medicines/${id}/stock`, data),
};

export const medicineSaleService = {
  getAll: () => api.get('/medicine-sales'),
  create: (data: any) => api.post('/medicine-sales/direct', data),
  createFromPrescription: (data: any) => api.post('/medicine-sales/from-prescription', data),
  getById: (id: string) => api.get(`/medicine-sales/${id}`),
  update: (id: string, data: any) => api.put(`/medicine-sales/${id}`, data),
  delete: (id: string) => api.delete(`/medicine-sales/${id}`),
  getSummary: (startDate?: string, endDate?: string) =>
    api.get('/medicine-sales/summary', { params: { startDate, endDate } }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getAppointmentsSummary: () => api.get('/dashboard/appointments-summary'),
  getRevenue: (startDate?: string, endDate?: string) =>
    api.get('/dashboard/revenue', { params: { startDate, endDate } }),
  getPopularServices: () => api.get('/dashboard/popular-services'),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users/admin-create', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const prescriptionService = {
  getByPet: (petId: string) => api.get(`/prescriptions/pet/${petId}`),
  getById: (id: string) => api.get(`/prescriptions/${id}`),
  create: (data: any) => api.post('/prescriptions', data),
  update: (id: string, data: any) => api.put(`/prescriptions/${id}`, data),
  updatePurchaseStatus: (id: string, status: string) =>
    api.patch(`/prescriptions/${id}/purchase-status`, { status }),
};

export default api;