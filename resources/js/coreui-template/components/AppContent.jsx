import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// Explicit extension avoids Vite resolving the renamed JSX route file incorrectly.
import { routes } from '../routes.jsx'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => (
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