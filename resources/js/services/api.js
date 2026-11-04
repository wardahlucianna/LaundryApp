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

// A 401 means the current authentication is no longer valid.
// Clear persisted credentials and return the user to the login page.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url || '').toLowerCase()
    const isAuthenticationRequest =
      requestUrl.includes('/login') ||
      requestUrl.includes('/auth') ||
      requestUrl.includes('/logout')

    if (status === 401 && !isAuthenticationRequest) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('permissions')
      localStorage.removeItem('menus')

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
