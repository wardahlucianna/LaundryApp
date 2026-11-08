import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const PosisiManagement = React.lazy(() => import('./views/access/Role/RoleList'))
const PosisiFormPage = React.lazy(() => import('./views/access/Role/RoleForm'))
const PosisiDetailPage = React.lazy(() => import('./views/access/Role/RoleDetail'))
const FeatureManagement = React.lazy(() => import('./views/access/Feature/FeatureList'))
const GroupFeatureFormPage = React.lazy(() => import('./views/access/GroupFeature/GroupFeatureForm'))
const GroupFeatureManagement = React.lazy(() => import('./views/access/GroupFeature/GroupFeatureList'))
const GroupFeatureDetailPage = React.lazy(() => import('./views/access/GroupFeature/GroupFeatureDetail'))
const FeatureFormPage = React.lazy(() => import('./views/access/Feature/FeatureForm'))
const Placeholder = ({ title }) => <div className="pt-4"><h2>{title}</h2><p>Halaman ini akan diintegrasikan dengan fitur Sunrise Laundry.</p></div>
export const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/customers', name: 'Pelanggan', element: () => <Placeholder title="Pelanggan" /> },
  { path: '/services', name: 'Layanan Laundry', element: () => <Placeholder title="Layanan Laundry" /> },
  { path: '/transactions', name: 'Transaksi', element: () => <Placeholder title="Transaksi" /> },
  { path: '/reports', name: 'Laporan', element: () => <Placeholder title="Laporan" /> },
  { path: '/settings', name: 'Pengaturan', element: () => <Placeholder title="Pengaturan" /> },
]

const normalizePath = (value) => {
  const path = String(value || '').trim().split(/[?#]/, 1)[0]
  if (!path) return null
  const leadingSlash = path.startsWith('/') ? path : `/${path}`
  const trimmed = leadingSlash.endsWith('/') ? leadingSlash.slice(0, -1) : leadingSlash
  return trimmed || '/'
}

const flattenMenuFeatures = (menuGroups) =>
  (menuGroups || []).flatMap((group) => group.items || [])

const resolveFeaturePath = (menuGroups, names, fallbackPaths = []) => {
  const candidates = names.map((name) => name.toLowerCase())
  const features = flattenMenuFeatures(menuGroups)
  const feature = features.find((item) =>
    candidates.includes(String(item.name || '').trim().toLowerCase()),
  )
  if (feature?.path) return normalizePath(feature.path)

  // Fall back to the known route path when the menu label differs from its alias.
  const fallback = features.find((item) =>
    fallbackPaths.includes(normalizePath(item.path)),
  )
  return normalizePath(fallback?.path)
}

export const buildAccessRoutes = (menuGroups) => {
  const featureBase = resolveFeaturePath(
    menuGroups,
    [
      'Manajemen Fitur',
      'Management Fitur',
      'Manajemen Feature',
      'Management Feature',
      'Fitur',
      'Feature',
      'Features',
    ],
    ['/feature'],
  )
  const roleBase = resolveFeaturePath(
    menuGroups,
    [
      'Manajemen Posisi',
      'Management Position',
      'Position Management',
      'Posisi',
      'Manajemen Role',
      'Management Role',
      'Role Management',
      'Role',
      'Roles',
      'Manajemen Peran',
      'Pengelolaan Peran',
      'Peran',
    ],
    ['/roles', '/role', '/management-role', '/manajemen-role', '/peran', '/posisi'],
  )
  const groupFeatureBase = resolveFeaturePath(
    menuGroups,
    [
      'Group Feature',
      'Feature Group',
      'Feature Groups',
      'Group Features',
      'Permission Group',
      'Permission Groups',
      'Kelompok Fitur',
      'Kelompok Feature',
      'Group Fitur',
      'Management Group Feature',
      'Manajemen Group Feature',
      'Manajemen Group Fitur',
      'Manajemen Kelompok Fitur',
    ],
    ['/feature-group', '/group-feature', '/group-features', '/feature/group', '/feature-groups'],
  )
  const dynamicRoutes = []

  if (groupFeatureBase) {
    dynamicRoutes.push(
      { path: groupFeatureBase, name: 'Management Group Feature', element: GroupFeatureManagement },
      { path: `${groupFeatureBase}/form`, name: 'Form Group Feature', element: GroupFeatureFormPage },
      { path: `${groupFeatureBase}/form/:id`, name: 'Edit Group Feature', element: GroupFeatureFormPage },
      { path: `${groupFeatureBase}/detail/:id`, name: 'Detail Group Feature', element: GroupFeatureDetailPage },
    )
  }

  if (featureBase) {
    dynamicRoutes.push(
      { path: featureBase, name: 'Management Fitur', element: FeatureManagement },
      { path: `${featureBase}/form`, name: 'Form Fitur', element: FeatureFormPage },
      { path: `${featureBase}/form/:id`, name: 'Edit Fitur', element: FeatureFormPage },
      // Keep the detail URL valid for existing menu links; the feature form
      // loads the selected record by ID and avoids a PageNotFound fallback.
      { path: `${featureBase}/detail/:id`, name: 'Detail Fitur', element: FeatureFormPage },
      { path: `${featureBase}/group-feature/form`, name: 'Form Group Feature', element: GroupFeatureFormPage },
      { path: `${featureBase}/group-feature/form/:id`, name: 'Edit Group Feature', element: GroupFeatureFormPage },
      { path: `${featureBase}/group-feature/detail/:id`, name: 'Detail Group Feature', element: GroupFeatureDetailPage },
    )
  }

  if (roleBase) {
    dynamicRoutes.push(
      { path: roleBase, name: 'Manajemen Posisi', element: PosisiManagement },
      { path: `${roleBase}/form`, name: 'Form Posisi', element: PosisiFormPage },
      { path: `${roleBase}/form/:id`, name: 'Edit Posisi', element: PosisiFormPage },
      { path: `${roleBase}/detail/:id`, name: 'Detail Posisi', element: PosisiDetailPage },
    )
  }

  return dynamicRoutes
}
