import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Placeholder = ({ title }) => <div className="pt-4"><h2>{title}</h2><p>Halaman ini akan diintegrasikan dengan fitur Sunrise Laundry.</p></div>
export const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/customers', name: 'Pelanggan', element: () => <Placeholder title="Pelanggan" /> },
  { path: '/services', name: 'Layanan Laundry', element: () => <Placeholder title="Layanan Laundry" /> },
  { path: '/transactions', name: 'Transaksi', element: () => <Placeholder title="Transaksi" /> },
  { path: '/reports', name: 'Laporan', element: () => <Placeholder title="Laporan" /> },
  { path: '/settings', name: 'Pengaturan', element: () => <Placeholder title="Pengaturan" /> },
  { path: '/roles', name: 'Manajemen Role', element: () => <Placeholder title="Manajemen Role" /> },
]
