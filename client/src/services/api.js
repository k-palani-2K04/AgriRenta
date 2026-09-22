import axios from 'axios';

// Central Axios Instance for AgriRenta Platform
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach Bearer Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrirenta_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global session handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token on unauthorized API response
      localStorage.removeItem('agrirenta_token');
    }
    return Promise.reject(error);
  }
);

export default api;
