import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// Explicit extension avoids Vite resolving the renamed JSX route file incorrectly.
import { buildAccessRoutes, routes } from '../routes.jsx'
import { apiBase } from '../../services/api'

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
        const token =
          localStorage.getItem('auth_token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('token') ||
          ''

        const response = await fetch(`${apiBase}/auth/me/menus`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        })

        if (!response.ok) throw new Error('Gagal membaca konfigurasi route menu.')

        const payload = await response.json()
        if (active) {
          setAccessRoutes(buildAccessRoutes(payload.data || []))
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
        if (active && showLoading && !hasLoadedRoutes) setIsLoadingRoutes(false)
      }
    }

    loadAccessRoutes({ showLoading: true })
    window.addEventListener('focus', loadAccessRoutes)
    window.addEventListener('sunrise:permissions-updated', loadAccessRoutes)

    return () => {
      active = false
      window.removeEventListener('focus', loadAccessRoutes)
      window.removeEventListener('sunrise:permissions-updated', loadAccessRoutes)
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
