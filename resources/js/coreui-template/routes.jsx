import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const RoleManagement = React.lazy(() => import('./views/akses/RoleManagement'))
const AccessManagement = React.lazy(() => import('./views/akses/AccessManagement'))
const Placeholder = ({ title }) => <div className="pt-4"><h2>{title}</h2><p>Halaman ini akan diintegrasikan dengan fitur Sunrise Laundry.</p></div>

export const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/customers', name: 'Pelanggan', element: () => <Placeholder title="Pelanggan" /> },
  { path: '/services', name: 'Layanan Laundry', element: () => <Placeholder title="Layanan Laundry" /> },
  { path: '/transactions', name: 'Transaksi', element: () => <Placeholder title="Transaksi" /> },
  { path: '/orders', name: 'Pesanan', element: () => <Placeholder title="Pesanan" /> },
  { path: '/process', name: 'Proses Laundry', element: () => <Placeholder title="Proses Laundry" /> },
  { path: '/payments', name: 'Pembayaran', element: () => <Placeholder title="Pembayaran" /> },
  { path: '/deliveries', name: 'Antar Jemput', element: () => <Placeholder title="Antar Jemput" /> },
  { path: '/reports', name: 'Laporan', element: () => <Placeholder title="Laporan" /> },
  { path: '/roles', name: 'Manajemen Role', element: RoleManagement },
  { path: '/access', name: 'Hak Akses', element: AccessManagement },
  { path: '/permissions', name: 'Manajemen Fitur', element: () => <Placeholder title="Manajemen Fitur" /> },
  { path: '/settings', name: 'Pengaturan', element: () => <Placeholder title="Pengaturan" /> },
]
