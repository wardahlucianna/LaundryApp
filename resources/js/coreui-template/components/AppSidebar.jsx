/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with branding, menu items, and toggle controls.
 *
 * Features:
 * - Redux-controlled visibility state
 * - Unfoldable/narrow mode for more screen space
 * - Brand logo with full and narrow variants
 * - Close button for mobile devices
 * - Footer with toggle button
 * - Dark color scheme
 * - Fixed positioning
 *
 * @component
 * @example
 * return (
 *   <AppSidebar />
 * )
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
import { cilSpeedometer, cilPeople, cilBasket, cilCash, cilChartLine, cilSettings } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'


/**
 * AppSidebar functional component
 *
 * Manages sidebar state with Redux:
 * - sidebarShow: Controls sidebar visibility
 * - sidebarUnfoldable: Controls narrow/wide mode
 *
 * Renders navigation from _nav.js configuration file.
 * Memoized to prevent unnecessary re-renders.
 *
 * @returns {React.ReactElement} Sidebar with navigation
 */
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const menuCacheKey = 'sunrise_laundry_sidebar_menus'
  const buildNavigation = (groups) => {
    const groupIcons = { DASHBOARD: cilSpeedometer, TRANSACTIONS: cilCash, OPERATIONS: cilBasket, MASTER_DATA: cilPeople, SETTINGS: cilSettings, REPORTS: cilChartLine }
    const items = []
    ;(groups || []).forEach((group) => {
      const icon = <CIcon icon={groupIcons[group.code] || cilSettings} customClassName="nav-icon" />
      const children = (group.items || []).map((feature) => ({ component: CNavItem, name: feature.name, to: feature.path }))
      if (group.code === 'DASHBOARD' && children.length === 1) items.push({ ...children[0], icon })
      else if (children.length) items.push({ component: CNavGroup, name: group.name, icon, items: children })
    })
    return items
  }

  const [navigation, setNavigation] = useState(() => {
    try {
      return buildNavigation(JSON.parse(localStorage.getItem(menuCacheKey) || '[]'))
    } catch {
      return []
    }
  })
  const [menuLoading, setMenuLoading] = useState(() => !localStorage.getItem(menuCacheKey))

  useEffect(() => {
    let cancelled = false
    const loadMenus = async () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
      if (!token) {
        if (!cancelled) { setNavigation([]); setMenuLoading(false) }
        return
      }
      try {
        const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
        const apiBase = configuredBase ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`) : '/api'
        const response = await fetch(`${apiBase}/auth/me/menus`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Gagal memuat menu.')
        const payload = await response.json()
        if (cancelled) return
        const groups = payload.data || []
        localStorage.setItem(menuCacheKey, JSON.stringify(groups))
        setNavigation(buildNavigation(groups))
      } catch (error) {
        // Keep cached menus visible when the API is slow or temporarily unavailable.
      } finally {
        if (!cancelled) setMenuLoading(false)
      }
    }
    loadMenus()
    return () => { cancelled = true }
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
