import axios from 'axios'

const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const apiOrigin = configuredBase.endsWith('/api') ? configuredBase.slice(0, -4) : configuredBase

export const apiBase = !configuredBase
  ? '/api'
  : configuredBase.endsWith('/api')
    ? configuredBase
    : configuredBase + '/api'

// LaundryApp uses session/cookie authentication.
// Do not attach Authorization: Bearer tokens from localStorage.
const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// If the session is no longer valid, clear cached user/menu data and redirect.
// A 403 is a permission issue, not a logout.
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
