import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CSpinner,
} from '@coreui/react'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const apiBase = configuredBase
      ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`)
      : '/api'

    try {
      const configuredOrigin = configuredBase.endsWith('/api') ? configuredBase.slice(0, -4) : configuredBase
      await fetch(`${configuredOrigin}/sanctum/csrf-cookie`, { credentials: 'include' })
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        const validationMessage = payload.errors
          ? Object.values(payload.errors).flat().join(' ')
          : ''
        throw new Error(validationMessage || payload.message || 'Username atau password salah.')
      }

      // Preload authorized sidebar menus before entering the dashboard.
      try {
        const menuResponse = await fetch(`${apiBase}/auth/me/menus`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        })
        if (menuResponse.ok) {
          const menuPayload = await menuResponse.json()
          sessionStorage.setItem('sunriseLaundryMenus', JSON.stringify(menuPayload.data || []))
        } else {
          sessionStorage.removeItem('sunriseLaundryMenus')
        }
      } catch {
        sessionStorage.removeItem('sunriseLaundryMenus')
      }

      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Tidak dapat menghubungi server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} xl={4}>
            <CCard className="p-3">
              <CCardBody>
                <div className="text-center mb-4">
                  <h2 className="fw-semibold">Sunrise Laundry</h2>
                  <p className="text-body-secondary mb-0">Silakan masuk ke akun Anda</p>
                </div>
                {error && <CAlert color="danger">{error}</CAlert>}
                <CForm onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <CFormInput
                      label="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <CFormInput
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <CButton color="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? <><CSpinner size="sm" className="me-2" />Memuat menu...</> : 'Masuk'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
