import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('defi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API helper functions
export const api = {
  // Auth
  register: (data: any) => apiClient.post('/auth/register', data).then((r) => r.data),
  login: (data: any) => apiClient.post('/auth/login', data).then((r) => r.data),
  demoLogin: () => apiClient.post('/auth/demo-login').then((r) => r.data),
  getMe: () => apiClient.get('/auth/me').then((r) => r.data),
  updatePreferences: (data: any) => apiClient.patch('/auth/preferences', data).then((r) => r.data),

  // Protocols
  getProtocols: (params?: any) => apiClient.get('/protocols', { params }).then((r) => r.data),
  getProtocolById: (id: string) => apiClient.get(`/protocols/${id}`).then((r) => r.data),

  // Risk
  getProtocolRisk: (id: string) => apiClient.get(`/risk/${id}`).then((r) => r.data),
  getRiskOverview: () => apiClient.get('/risk/overview').then((r) => r.data),

  // Optimizer
  runOptimizer: (params: any) => apiClient.post('/optimizer/optimize', params).then((r) => r.data),
  deployStrategy: (data: any) => apiClient.post('/optimizer/deploy', data).then((r) => r.data),

  // Portfolio
  getPortfolio: () => apiClient.get('/portfolio').then((r) => r.data),
  addInvestment: (data: any) => apiClient.post('/portfolio/investments', data).then((r) => r.data),
  withdrawInvestment: (data: any) => apiClient.post('/portfolio/withdraw', data).then((r) => r.data),
  getTransactions: () => apiClient.get('/portfolio/transactions').then((r) => r.data),

  // Analytics
  getAnalytics: () => apiClient.get('/analytics').then((r) => r.data),
};
