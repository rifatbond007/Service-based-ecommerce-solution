import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  refresh: () => api.post('/auth/refresh'),
};

export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
};

export const cartApi = {
  getCart: (userId: string) => api.get(`/cart/${userId}`),
  addItem: (userId: string, item: { productId: string; name: string; price: number; quantity: number }) =>
    api.post(`/cart/${userId}/items`, item),
  updateQuantity: (userId: string, productId: string, quantity: number) =>
    api.put(`/cart/${userId}/items/${productId}`, { quantity }),
  removeItem: (userId: string, productId: string) =>
    api.delete(`/cart/${userId}/items/${productId}`),
  clearCart: (userId: string) => api.delete(`/cart/${userId}`),
  getTotal: (userId: string) => api.get(`/cart/${userId}/total`),
};

export const ordersApi = {
  create: (data: { userId: string; shippingAddress: string; items: Array<{ productId: string; quantity: number; price: number }> }) =>
    api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getByUser: (userId: string) => api.get(`/orders/user/${userId}`),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export const paymentsApi = {
  process: (data: { orderId: string; amount: number; paymentMethod: string }) =>
    api.post('/payments', data),
  getByOrder: (orderId: string) => api.get(`/payments/order/${orderId}`),
};

export default api;
