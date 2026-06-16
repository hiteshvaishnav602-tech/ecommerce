import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bewakoof_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

const cleanUrls = (data) => {
  if (typeof data === 'string') {
    // Replace any localhost or IP address base URLs for local uploads with relative paths
    return data.replace(/https?:\/\/[^\/]+\/uploads\//g, '/uploads/');
  }
  if (Array.isArray(data)) {
    return data.map(cleanUrls);
  }
  if (data !== null && typeof data === 'object') {
    const cleaned = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleaned[key] = cleanUrls(data[key]);
      }
    }
    return cleaned;
  }
  return data;
};

// Response interceptor — handle 401 and clean URLs
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = cleanUrls(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('bewakoof_refresh')
      if (refreshToken) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '/api';
          const { data } = await axios.post(`${apiUrl}/auth/refresh-token`, { refreshToken })
          localStorage.setItem('bewakoof_token', data.token)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch (_) {
          localStorage.removeItem('bewakoof_token')
          localStorage.removeItem('bewakoof_user')
          localStorage.removeItem('bewakoof_refresh')
          window.location.href = '/login'
        }
      } else {
        localStorage.removeItem('bewakoof_token')
        localStorage.removeItem('bewakoof_user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
