import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// Explicit extension avoids Vite resolving the renamed JSX route file incorrectly.
import { buildAccessRoutes, routes } from '../routes.jsx'
import { apiBase } from '../../services/api'

// Reuse an in-flight menu request across React StrictMode effect remounts.
let pendingMenusRequest = null

const AppContent = () => {
  const [accessRoutes, setAccessRoutes] = useState([])
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true)
  const [routeLoadError, setRouteLoadError] = useState('')

  useEffect(() => {
    let active = true
    let hasLoadedRoutes = false

    const loadAccessRoutes = async ({ showLoading = false } = {}) => {
      // Only the first load should block the page. Revalidating on browser focus
      // must not make the current screen flash a full-page loading state.
      if (active && showLoading && !hasLoadedRoutes) {
        setIsLoadingRoutes(true)
        setRouteLoadError('')
      }

      try {
        if (!pendingMenusRequest) {
          const token =
            localStorage.getItem('auth_token') ||
            localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            ''

          pendingMenusRequest = fetch(`${apiBase}/auth/me/menus`, {
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
          }).then(async (response) => {
            if (!response.ok) throw new Error('Gagal membaca konfigurasi route menu.')
            return response.json()
          }).catch((error) => {
            pendingMenusRequest = null
            throw error
          })
        }

        const payload = await pendingMenusRequest
        if (active) {
          const groups = payload.data || []
          setAccessRoutes(buildAccessRoutes(groups))
          // Share the same menu response with the sidebar; avoid a second API request.
          sessionStorage.setItem('sunriseLaundryMenus', JSON.stringify(groups))
          window.dispatchEvent(new CustomEvent('sunrise:menus-loaded', { detail: groups }))
          setRouteLoadError('')
          hasLoadedRoutes = true
        }
      } catch (error) {
        if (active) {
          // Keep the last known routes when a background refresh temporarily fails.
          if (!hasLoadedRoutes) setAccessRoutes([])
          setRouteLoadError(
            error.message || 'Gagal memuat menu aplikasi. Silakan coba refresh kembali.',
          )
        }
      } finally {
        if (active && showLoading) setIsLoadingRoutes(false)
      }
    }

    loadAccessRoutes({ showLoading: true })
    const refreshAccessRoutes = (event) => {
      const change = event?.detail
      // Apply deletion to the cached menu tree locally. A menu API round-trip
      // is unnecessary when the only change is removing an existing item.
      if (change?.type === 'delete-feature' || change?.type === 'delete-group') {
        try {
          const cachedGroups = JSON.parse(sessionStorage.getItem('sunriseLaundryMenus') || '[]')
          const updatedGroups = change.type === 'delete-feature'
            ? cachedGroups.map((group) => ({
                ...group,
                items: (group.items || []).filter((item) => item.featureId !== change.featureId),
              })).filter((group) => (group.items || []).length > 0)
            : cachedGroups.filter((group) => group.groupFeatureId !== change.groupFeatureId)

          setAccessRoutes(buildAccessRoutes(updatedGroups))
          sessionStorage.setItem('sunriseLaundryMenus', JSON.stringify(updatedGroups))
          window.dispatchEvent(new CustomEvent('sunrise:menus-loaded', { detail: updatedGroups }))
          return
        } catch {
          // If local cache cannot be updated, fall back to fresh API data.
        }
      }

      pendingMenusRequest = null
      loadAccessRoutes()
    }
    window.addEventListener('sunrise:permissions-updated', refreshAccessRoutes)

    return () => {
      active = false
      window.removeEventListener('sunrise:permissions-updated', refreshAccessRoutes)
    }
  }, [])

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        {isLoadingRoutes ? (
          <div className="pt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '240px' }}>
            <div className="text-center">
              <CSpinner color="primary" />
              <p className="text-body-secondary mt-3 mb-0">Memuat menu...</p>
            </div>
          </div>
        ) : routeLoadError && accessRoutes.length === 0 ? (
          <div className="pt-4">
            <h2 className="fs-4 mb-2">Menu gagal dimuat</h2>
            <p className="text-body-secondary">{routeLoadError}</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.dispatchEvent(new Event('focus'))}
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <Routes>
            {[...routes, ...accessRoutes].map((route, idx) =>
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  name={route.name}
                  element={<route.element />}
                />
              ),
            )}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="*"
              element={
                <div className="pt-4">
                  <h2 className="fs-4 mb-2">Halaman tidak ditemukan</h2>
                  <p className="text-body-secondary">Path menu belum terdaftar pada aplikasi.</p>
                  <a href="/dashboard">Kembali ke Dashboard</a>
                </div>
              }
            />
          </Routes>
        )}
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
