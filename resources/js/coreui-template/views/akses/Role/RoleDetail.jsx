import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol,
  CRow, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil } from '@coreui/icons'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const RoleDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const request = useCallback(async (path) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.message || 'Gagal memuat detail role.')
    return payload
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    request(`/roles/${id}`)
      .then((payload) => { if (active) setRole(payload.data || payload) })
      .catch((e) => { if (active) setError(e.message || 'Gagal memuat detail role.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, request])

  const groupedPermissions = useMemo(() => {
    const grouped = new Map()
    ;(role?.permissions || []).forEach((permission) => {
      const featureName = permission.feature?.name || permission.name || 'Fitur tidak terdefinisi'
      const groupName = permission.feature?.group?.name || 'Lainnya'
      const key = `${groupName}::${featureName}`
      if (!grouped.has(key)) grouped.set(key, { groupName, featureName, actions: [] })
      grouped.get(key).actions.push(permission)
    })
    return Array.from(grouped.values()).sort((a, b) => a.groupName.localeCompare(b.groupName) || a.featureName.localeCompare(b.featureName))
  }, [role])

  return (
    <div className="role-page-layout mb-4">
      <div className="mb-3"><h2 className="fs-4 mb-1">Detail Role</h2><div className="small text-body-secondary">Informasi role dan hak akses yang diberikan.</div></div>
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <div className="role-detail-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
        <div className="d-flex gap-2">
          <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate('/roles/list')}><CIcon icon={cilArrowLeft} className="me-1" />Kembali</CButton>
          {role && <CButton color="primary" size="sm" onClick={() => navigate(`/roles/form/${role.id}`)}><CIcon icon={cilPencil} className="me-1" />Edit Role</CButton>}
        </div>
      </div>
      </div>
      {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner size="sm" />Memuat detail role...</div> : role && (
        <>
          <CCard className="mb-4">
            <CCardHeader><strong>Informasi Role</strong></CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Nama Role</div><div className="fw-semibold">{role.name || '-'}</div></CCol>
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Kode Role</div><code>{role.code || '-'}</code></CCol>
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Status</div><CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CCol>
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Jumlah Pengguna</div><div className="fw-semibold">{role.users_count ?? 0}</div></CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Rincian Hak Akses</strong>
              <CBadge color="primary">{role.permissions?.length ?? 0} akses diberikan</CBadge>
            </CCardHeader>
            <CCardBody>
              {groupedPermissions.length === 0 ? <div className="text-body-secondary text-center py-3">Role ini belum memiliki hak akses.</div> : (
                <div className="d-flex flex-column gap-3">
                  {groupedPermissions.map((feature) => (
                    <CCard key={`${feature.groupName}-${feature.featureName}`} className="border">
                      <CCardHeader className="py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div>
                          <div className="small text-body-secondary">{feature.groupName}</div>
                          <strong>{feature.featureName}</strong>
                        </div>
                        <CBadge color="secondary">{feature.actions.length} akses</CBadge>
                      </CCardHeader>
                      <CCardBody>
                        <CRow className="g-2">
                          {feature.actions.map((permission) => (
                            <CCol xs={12} sm={6} md={4} key={permission.id}>
                              <div className="rounded border p-3 h-100">
                                <div className="fw-semibold mb-2">{permission.action_name || permission.name || '-'}</div>
                                <CBadge color="success" className="mb-2">Diizinkan</CBadge>
                                <div className="small text-body-secondary"><code>{permission.code || '-'}</code></div>
                              </div>
                            </CCol>
                          ))}
                        </CRow>
                      </CCardBody>
                    </CCard>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
      </div>
    </div>
  )
}

export default RoleDetailPage
