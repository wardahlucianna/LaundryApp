import { apiBase } from '../../services/api'

const normalize = (value) => String(value || '').trim().toLowerCase()

const normalizePath = (value) => {
  const path = String(value || '').trim().split(/[?#]/, 1)[0]
  if (!path) return null
  return path.startsWith('/') ? path : `/${path}`
}

const resolvePathFromGroups = (groups, featureNames = []) => {
  const features = (groups || []).flatMap((group) => group.items || [])
  const candidates = featureNames.map(normalize).filter(Boolean)

  const found = features.find((feature) => {
    const name = normalize(feature.name)
    return candidates.some((candidate) => name === candidate || name.includes(candidate))
  })

  // routes.jsx already supports /feature as the canonical fallback route
  // for the access-feature menu. Resolve it by path when the DB label differs
  // from the aliases above, instead of failing after a successful save.
  const fallback = features.find((feature) => normalizePath(feature.path) === '/feature')

  return normalizePath(found?.path || fallback?.path)
}

/**
 * Resolve access-management route from the menu payload already loaded by
 * AppContent. This avoids making an extra menus API request when clicking
 * Create/Edit/Detail buttons. Fetch only if the cache is unavailable.
 */
export const getAccessFeaturePath = async (featureNames = []) => {
  try {
    const cachedMenus = sessionStorage.getItem('sunriseLaundryMenus')
    if (cachedMenus) {
      const cachedPath = resolvePathFromGroups(JSON.parse(cachedMenus), featureNames)
      if (cachedPath) return cachedPath
    }
  } catch {
    // Invalid or stale cache: continue by fetching fresh menu data.
  }

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
  const groups = payload.data || []
  sessionStorage.setItem('sunriseLaundryMenus', JSON.stringify(groups))

  return resolvePathFromGroups(groups, featureNames)
}
