import axios from 'axios'
import { clearToken, getToken } from './authStorage'

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, '')
}

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
  : 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      const path = window.location.pathname
      if (
        path !== '/login' &&
        !path.startsWith('/login/') &&
        path !== '/register' &&
        !path.startsWith('/register/')
      ) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)
