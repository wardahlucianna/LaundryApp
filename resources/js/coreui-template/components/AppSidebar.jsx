import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton, CSidebar, CSidebarBrand, CSidebarFooter,
  CSidebarHeader, CSidebarToggler, CNavGroup, CNavItem, CNavTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPeople, cilBasket, cilCash, cilChartLine, cilSettings } from '@coreui/icons'
import { AppSidebarNav } from './AppSidebarNav'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'
import { apiRequest } from '../lib/api'

const iconByGroup = {
  Dashboard: cilSpeedometer,
  'Master Data': cilPeople,
  Operasional: cilBasket,
  Transaksi: cilCash,
  Laporan: cilChartLine,
  Pengaturan: cilSettings,
}

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [navigation, setNavigation] = useState([])

  useEffect(() => {
    let active = true
    apiRequest('/auth/me/menus')
      .then((result) => {
        if (!active) return
        const features = result.data || []
        const groups = new Map()
        features.forEach((feature) => {
          const groupName = feature.group || 'Menu'
          if (!groups.has(groupName)) groups.set(groupName, [])
          groups.get(groupName).push({
            component: CNavItem,
            name: feature.name,
            to: feature.path,
          })
        })

        const items = []
        const dashboard = features.find((feature) => feature.path === '/dashboard')
        if (dashboard) {
          items.push({
            component: CNavItem,
            name: dashboard.name,
            to: dashboard.path,
            icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
          })
        }

        groups.forEach((groupItems, groupName) => {
          const withoutDashboard = groupItems.filter((item) => item.to !== '/dashboard')
          if (!withoutDashboard.length) return
          const icon = iconByGroup[groupName] || cilSettings
          items.push({
            component: CNavGroup,
            name: groupName,
            icon: <CIcon icon={icon} customClassName="nav-icon" />,
            items: withoutDashboard,
          })
        })
        setNavigation(items)
      })
      .catch(() => {
        if (active) setNavigation([])
      })
    return () => { active = false }
  }, [])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch({ type: 'set', sidebarShow: false })} />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
