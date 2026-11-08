/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with branding, menu items, and toggle controls.
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPeople, cilBasket, cilCash, cilChartLine, cilSettings, cilFolderOpen, cilBuilding, cilTags } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const buildNavigation = (groups) => {
    const normalizeMenuPath = (feature) => {
      const path = String(feature.path || '').trim()
      if (!path) return null
      return path.startsWith('/') ? path : `/${path}`
    }
    const groupIcons = { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags }
    const items = []
    ;(groups || []).forEach((group) => {
      // Use the icon selected in Management Group Feature, not a hardcoded name mapping.
      const icon = <CIcon icon={groupIcons[group.icon] || cilSettings} customClassName="nav-icon" />
      const children = (group.items || []).map((feature) => ({
        component: CNavItem,
        name: feature.name,
        to: normalizeMenuPath(feature),
      })).filter((item) => Boolean(item.to))
      if ((group.name === 'Beranda' || group.name === 'Dashboard') && children.length === 1) items.push({ ...children[0], icon })
      else if (children.length) items.push({ component: CNavGroup, name: group.name, icon, items: children })
    })
    return items
  }

  const [navigation, setNavigation] = useState(() => {
    try {
      const cachedGroups = sessionStorage.getItem('sunriseLaundryMenus')
      return cachedGroups ? buildNavigation(JSON.parse(cachedGroups)) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    // AppContent is the single source of truth for menu data.
    const handleMenusLoaded = (event) => {
      try {
        const groups = event.detail || JSON.parse(sessionStorage.getItem('sunriseLaundryMenus') || '[]')
        setNavigation(buildNavigation(groups))
      } catch {
        // Keep the last valid navigation if cached data is malformed.
      }
    }

    window.addEventListener('sunrise:menus-loaded', handleMenusLoaded)
    return () => window.removeEventListener('sunrise:menus-loaded', handleMenusLoaded)
  }, [])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
