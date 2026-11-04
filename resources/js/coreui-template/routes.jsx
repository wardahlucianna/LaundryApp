import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const RoleManagement = React.lazy(() => import('./views/access/Role/RoleList'))
const RoleFormPage = React.lazy(() => import('./views/access/Role/RoleForm'))
const RoleDetailPage = React.lazy(() => import('./views/access/Role/RoleDetail'))
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
  const path = String(value || '').trim()
  if (!path) return null
  const leadingSlash = path.startsWith('/') ? path : `/${path}`
  const trimmed = leadingSlash.endsWith('/') ? leadingSlash.slice(0, -1) : leadingSlash
  return trimmed || '/'
}

const resolveFeaturePath = (menuGroups, names) => {
  const candidates = names.map((name) => name.toLowerCase())
  const features = (menuGroups || []).flatMap((group) => group.items || [])
  const feature = features.find((item) => candidates.includes(String(item.name || '').trim().toLowerCase()))
  return normalizePath(feature?.path)
}

export const buildAccessRoutes = (menuGroups) => {
  const featureBase = resolveFeaturePath(menuGroups, ['Manajemen Fitur', 'Management Fitur'])
  const roleBase = resolveFeaturePath(menuGroups, ['Manajemen Role', 'Management Role', 'Manajemen Peran'])
  const groupFeatureBase = resolveFeaturePath(menuGroups, ['Group Feature', 'Feature Group', 'Management Group Feature', 'Manajemen Group Feature', 'Manajemen Group Fitur', 'Manajemen Kelompok Fitur'])
  const dynamicRoutes = []

  if (groupFeatureBase) {
    dynamicRoutes.push({ path: groupFeatureBase, name: 'Management Group Feature', element: GroupFeatureManagement })
  }

  if (featureBase) {
    dynamicRoutes.push(
      { path: featureBase, name: 'Management Fitur', element: FeatureManagement },
      { path: `${featureBase}/form`, name: 'Form Fitur', element: FeatureFormPage },
      { path: `${featureBase}/form/:id`, name: 'Edit Fitur', element: FeatureFormPage },
      { path: `${featureBase}/group-feature/form`, name: 'Form Group Feature', element: GroupFeatureFormPage },
      { path: `${featureBase}/group-feature/form/:id`, name: 'Edit Group Feature', element: GroupFeatureFormPage },
      { path: `${featureBase}/group-feature/detail/:id`, name: 'Detail Group Feature', element: GroupFeatureDetailPage },
    )
  }

  if (roleBase) {
    dynamicRoutes.push(
      { path: roleBase, name: 'Manajemen Role', element: RoleManagement },
      { path: `${roleBase}/form`, name: 'Form Role', element: RoleFormPage },
      { path: `${roleBase}/form/:id`, name: 'Edit Role', element: RoleFormPage },
      { path: `${roleBase}/detail/:id`, name: 'Detail Role', element: RoleDetailPage },
    )
  }

  return dynamicRoutes
}

