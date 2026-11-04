import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// Explicit extension avoids Vite resolving the renamed JSX route file incorrectly.
import { buildAccessRoutes, routes } from '../routes.jsx'
import { apiBase } from '../../services/api'

const AppContent = () => {
  const [accessRoutes, setAccessRoutes] = useState([])

  useEffect(() => {
    let active = true
    const loadAccessRoutes = async () => {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
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
        if (active) setAccessRoutes(buildAccessRoutes(payload.data || []))
      } catch {
        if (active) setAccessRoutes([])
      }
    }
    loadAccessRoutes()
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
        <Routes>
          {[...routes, ...accessRoutes].map((route, idx) => (
            route.element && (
              <Route
                key={idx}
                path={route.path}
                name={route.name}
                element={<route.element />}
              />
            )
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={(
              <div className="pt-4">
                <h2 className="fs-4 mb-2">Halaman tidak ditemukan</h2>
                <p className="text-body-secondary">Path menu belum terdaftar pada aplikasi.</p>
                <a href="/dashboard">Kembali ke Dashboard</a>
              </div>
            )}
          />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)