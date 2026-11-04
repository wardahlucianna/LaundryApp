import axios from 'axios'

const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const apiOrigin = configuredBase.endsWith('/api') ? configuredBase.slice(0, -4) : configuredBase

export const apiBase = !configuredBase
  ? '/api'
  : configuredBase.endsWith('/api')
    ? configuredBase
    : configuredBase + '/api'

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
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

// If authentication is no longer valid, clear persisted auth data
// and redirect to login. A 403 is a permission issue, not a logout.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url || '').toLowerCase()
    const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/login')

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('permissions')
      localStorage.removeItem('menus')
      sessionStorage.removeItem('sunriseLaundryMenus')

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
