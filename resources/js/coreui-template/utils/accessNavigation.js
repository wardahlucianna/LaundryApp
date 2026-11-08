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

  // Resolve fallback by the requested menu family. Never let a Group Feature
  // request silently fall back to the ordinary Feature route (/feature).
  const isGroupFeatureRequest = candidates.some((candidate) =>
    ['kelompok fitur', 'kelompok feature', 'group fitur', 'group feature', 'feature group', 'permission group'].some((alias) => candidate.includes(alias)),
  )
  const isRoleRequest = candidates.some((candidate) =>
    ['role', 'peran'].some((alias) => candidate === alias || candidate.includes(alias)),
  )

  const fallbackPaths = isGroupFeatureRequest
    ? ['/feature-group', '/group-feature', '/group-features', '/feature/group', '/feature-groups']
    : isRoleRequest
      ? ['/roles', '/role', '/management-role', '/manajemen-role', '/peran']
      : ['/feature']

  const fallback = features.find((feature) =>
    fallbackPaths.includes(normalizePath(feature.path)),
  )

  return normalizePath(found?.path || fallback?.path)
}

/**
 * Resolve access-management route from the menu payload already loaded by
 * AppContent. This avoids making an extra menus API request when clicking
 * Create/Edit/Detail buttons. Never fetch menus from this navigation helper.
 */
export const getAccessFeaturePath = async (featureNames = []) => {
  try {
    const cachedMenus = sessionStorage.getItem('sunriseLaundryMenus')
    if (cachedMenus) {
      const cachedPath = resolvePathFromGroups(JSON.parse(cachedMenus), featureNames)
      if (cachedPath) return cachedPath
    }
  } catch {
    // Invalid cache: use canonical routes below without requesting menus.
  }

  const candidates = featureNames.map(normalize).filter(Boolean)
  const isGroupFeatureRequest = candidates.some((candidate) =>
    ['kelompok fitur', 'kelompok feature', 'group fitur', 'group feature', 'feature group', 'permission group'].some((alias) => candidate.includes(alias)),
  )
  const isRoleRequest = candidates.some((candidate) =>
    ['role', 'peran'].some((alias) => candidate === alias || candidate.includes(alias)),
  )

  if (isGroupFeatureRequest) return '/feature-group'
  if (isRoleRequest) return '/roles'
  return '/feature'
}
