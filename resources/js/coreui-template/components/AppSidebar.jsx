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
import { cilSpeedometer, cilPeople, cilBasket, cilCash, cilChartLine, cilSettings } from '@coreui/icons'
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
      if (String(feature.name || '').toLowerCase().includes('manajemen fitur')) return '/permissions'
      const path = String(feature.path || '').trim()
      if (!path) return null
      return path.startsWith('/') ? path : `/${path}`
    }
    const groupIcons = { Beranda: cilSpeedometer, Dashboard: cilSpeedometer, Transaksi: cilCash, Operasional: cilBasket, 'Master Data': cilPeople, Pengaturan: cilSettings, Laporan: cilChartLine }
    const items = []
    ;(groups || []).forEach((group) => {
      const icon = <CIcon icon={groupIcons[group.name] || cilSettings} customClassName="nav-icon" />
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
    let cancelled = false
    const loadMenus = async () => {
      try {
        const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
        const apiBase = configuredBase ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`) : '/api'
        const response = await fetch(`${apiBase}/auth/me/menus`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Gagal memuat menu.')
        const payload = await response.json()
        if (!cancelled) {
          const groups = payload.data || []
          sessionStorage.setItem('sunriseLaundryMenus', JSON.stringify(groups))
          setNavigation(buildNavigation(groups))
        }
      } catch {
        // Keep cached navigation visible if a background refresh temporarily fails.
      }
    }

    loadMenus()
    window.addEventListener('focus', loadMenus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', loadMenus)
    }
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
