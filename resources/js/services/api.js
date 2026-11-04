import axios from 'axios'

const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\\/$/, '')

export const apiOrigin = configuredBase.endsWith('/api') ? configuredBase.slice(0, -4) : configuredBase

export const apiBase = !configuredBase
  ? '/api'
  : configuredBase.endsWith('/api')
    ? configuredBase
    : `${configuredBase}/api`

const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    ''

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient
