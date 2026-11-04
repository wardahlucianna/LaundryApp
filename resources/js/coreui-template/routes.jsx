import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const RoleManagement = React.lazy(() => import('./views/access/Role/RoleList'))
const RoleFormPage = React.lazy(() => import('./views/access/Role/RoleForm'))
const RoleDetailPage = React.lazy(() => import('./views/access/Role/RoleDetail'))
const FeatureManagement = React.lazy(() => import('./views/access/Feature/FeatureManagement'))
const GroupFeatureManagement = React.lazy(() => import('./views/access/GroupFeature/GroupFeatureManagement'))
const GroupFeatureFormPage = React.lazy(() => import('./views/access/GroupFeature/GroupFeatureForm'))
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
  { path: '/permissions', name: 'Management Fitur', element: FeatureManagement },
  { path: '/permission-groups', name: 'Management Group Feature', element: GroupFeatureManagement },
  { path: '/permission-groups/form', name: 'Form Group Feature', element: GroupFeatureFormPage },
  { path: '/permission-groups/form/:id', name: 'Edit Group Feature', element: GroupFeatureFormPage },
  { path: '/permission-groups/detail/:id', name: 'Detail Group Feature', element: GroupFeatureDetailPage },
  { path: '/permissions/form', name: 'Form Fitur', element: FeatureFormPage },
  { path: '/permissions/form/:id', name: 'Edit Fitur', element: FeatureFormPage },
  { path: '/roles', name: 'Manajemen Role', element: RoleManagement },
  { path: '/roles/list', name: 'List Role', element: RoleManagement },
  { path: '/roles/form', name: 'Form Role', element: RoleFormPage },
  { path: '/roles/form/:id', name: 'Edit Role', element: RoleFormPage },
  { path: '/roles/detail/:id', name: 'Detail Role', element: RoleDetailPage },
]
