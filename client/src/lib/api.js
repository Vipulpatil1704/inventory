import axios from 'axios'
import { store } from '@/app/store'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthRoute = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register') || original?.url?.includes('/auth/refresh')

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      const refreshToken = store.getState().auth.refreshToken

      if (!refreshToken) {
        store.dispatch(clearCredentials())
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          )
        }
        const { data } = await refreshPromise
        refreshPromise = null
        store.dispatch(setCredentials(data.data))
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch (refreshError) {
        refreshPromise = null
        store.dispatch(clearCredentials())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}

export default api
