import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
};

export const eventService = {
  getEvents: (params?: any) => api.get('/events', { params }),
  getEvent: (id: number) => api.get(`/events/${id}`),
  createEvent: (data: any) => api.post('/events', data),
  updateEvent: (id: number, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
  registerEvent: (id: number) => api.post(`/events/${id}/register`),
  cancelRegistration: (id: number) => api.delete(`/events/${id}/register`),
};

export const newsService = {
  getNews: (params?: any) => api.get('/news', { params }),
  getNewsItem: (id: number) => api.get(`/news/${id}`),
  createNews: (data: any) => api.post('/news', data),
  likeNews: (id: number, type?: string) => api.post(`/news/${id}/like`, { type }),
  getComments: (id: number) => api.get(`/news/${id}/comments`),
  addComment: (id: number, content: string) => api.post(`/news/${id}/comments`, { content }),
};

export const galleryService = {
  getGalleries: (params?: any) => api.get('/galleries', { params }),
  getGallery: (id: number) => api.get(`/galleries/${id}`),
  createGallery: (data: any) => api.post('/galleries', data),
  addPhotos: (id: number, photos: string[], caption?: string) =>
    api.post(`/galleries/${id}/photos`, { photos, caption }),
  deletePhoto: (photoId: number) => api.delete(`/galleries/photos/${photoId}`),
  likePhoto: (photoId: number) => api.post(`/galleries/photos/${photoId}/like`),
};

export const connectionService = {
  getConnections: () => api.get('/connections'),
  getRequests: () => api.get('/connections/requests'),
  getSentRequests: () => api.get('/connections/requests/sent'),
  sendRequest: (recipientId: number) => api.post('/connections', { recipientId }),
  respondToRequest: (id: number, status: string) => api.put(`/connections/${id}`, { status }),
  removeConnection: (id: number) => api.delete(`/connections/${id}`),
};

export const messageService = {
  getConversations: () => api.get('/messages'),
  getMessages: (userId: number) => api.get(`/messages/${userId}`),
  sendMessage: (recipientId: number, content: string) =>
    api.post('/messages', { recipientId, content }),
};

export const paymentService = {
  createPaymentIntent: (eventId: number) =>
    api.post('/payments/stripe/create-intent', { eventId }),
  confirmPayment: (paymentId: number) =>
    api.post('/payments/stripe/confirm', { paymentId }),
  getHistory: () => api.get('/payments/history'),
  requestRefund: (paymentId: number) =>
    api.post('/payments/refund', { paymentId }),
};

export default api;
