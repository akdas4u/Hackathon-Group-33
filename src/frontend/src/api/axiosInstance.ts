import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './envConfig';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token from the Zustand auth store to every request.
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

// A 401 means the access token is missing/expired/invalid. Clearing the auth
// store here is enough to drive the redirect: ProtectedRoute subscribes to
// `accessToken` and re-renders to <Navigate to="/login" /> the moment it
// becomes null, without needing a manual window.location redirect here.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
