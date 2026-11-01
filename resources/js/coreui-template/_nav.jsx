import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPeople, cilBasket, cilCash, cilChartLine, cilSettings } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const navigation = [
  { component: CNavItem, name: 'Dashboard', to: '/dashboard', icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" /> },
  { component: CNavTitle, name: 'MANAJEMEN LAUNDRY' },
  { component: CNavGroup, name: 'Master Data', icon: <CIcon icon={cilPeople} customClassName="nav-icon" />, items: [
    { component: CNavItem, name: 'Pelanggan', to: '/customers' },
    { component: CNavItem, name: 'Layanan Laundry', to: '/services' },
  ]},
  { component: CNavGroup, name: 'Operasional', icon: <CIcon icon={cilBasket} customClassName="nav-icon" />, items: [
    { component: CNavItem, name: 'Transaksi', to: '/transactions' },
  ]},
  { component: CNavItem, name: 'Laporan', to: '/reports', icon: <CIcon icon={cilChartLine} customClassName="nav-icon" /> },
  { component: CNavItem, name: 'Pengaturan', to: '/settings', icon: <CIcon icon={cilSettings} customClassName="nav-icon" /> },
]
export default navigation