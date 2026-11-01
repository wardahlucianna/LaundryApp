const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_BASE = configuredBase
  ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`)
  : '/api'

export function getAuthToken() {
  return localStorage.getItem('auth_token')
    || localStorage.getItem('access_token')
    || localStorage.getItem('token')
    || ''
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const validationMessage = payload.errors
      ? Object.values(payload.errors).flat().join(' ')
      : ''
    throw new Error(validationMessage || payload.message || 'Permintaan tidak berhasil.')
  }
  return payload
}
