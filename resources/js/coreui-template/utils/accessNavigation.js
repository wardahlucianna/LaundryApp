import { apiBase } from '../../services/api'

const normalize = (value) => String(value || '').trim().toLowerCase()

const normalizePath = (value) => {
  const path = String(value || '').trim()
  if (!path) return null
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Resolve an access-management feature's list route from the current user's
 * database-backed menu payload. The caller can append route suffixes for forms
 * and details while keeping the list base path sourced from the DB.
 */
export const getAccessFeaturePath = async (featureNames = []) => {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    ''

  const response = await fetch(`${apiBase}/auth/me/menus`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Gagal membaca path menu dari database.')
  }

  const payload = await response.json()
  const features = (payload.data || []).flatMap((group) => group.items || [])
  const candidates = featureNames.map(normalize).filter(Boolean)

  const found = features.find((feature) => {
    const name = normalize(feature.name)
    return candidates.some((candidate) => name === candidate || name.includes(candidate))
  })

  return normalizePath(found?.path)
}
