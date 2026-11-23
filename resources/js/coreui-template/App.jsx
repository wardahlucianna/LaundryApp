import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import apiClient from '../services/api'
import './scss/style.scss'
import './scss/examples.scss'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/Login'))

// Tetap validasi session meskipun pengguna sedang diam di halaman.
function AuthSessionWatcher() {
  useEffect(() => {
    const checkSession = () => {
      if (window.location.pathname === '/login') return

      apiClient.get('/auth/me').catch(() => {
        // Response 401 ditangani oleh interceptor apiClient dan diarahkan ke login.
      })
    }

    // Session tidak perlu diminta ulang setiap pindah halaman.
    // Request API pada halaman tetap menangani session yang sudah kedaluwarsa.
    const intervalId = window.setInterval(checkSession, 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  return null
}

export default function App() {
  const { isColorModeSet, setColorMode } = useColorModes('sunrise-laundry-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    if (!isColorModeSet()) setColorMode(storedTheme || 'light')
  }, [])

  return (
    <BrowserRouter>
      <AuthSessionWatcher />
      <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
