import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol,
  CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead,
  CTableHeaderCell, CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil } from '@coreui/icons'
import RolePageLayout from './RolePageLayout'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\\/$/, '')
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
    <RolePageLayout title="Detail Role" description="Informasi role dan hak akses yang diberikan." errorMessage={error} onDismissError={() => setError('')}>
      <div className="role-detail-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
        <div className="d-flex gap-2">
          <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate('/roles/list')}><CIcon icon={cilArrowLeft} className="me-1" />Kembali</CButton>
          {role && <CButton color="primary" size="sm" onClick={() => navigate(`/roles/form/${role.id}`)}><CIcon icon={cilPencil} className="me-1" />Edit Role</CButton>}
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
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2"><strong>Rincian Hak Akses</strong><CBadge color="warning">{role.permissions?.length ?? 0} hak akses</CBadge></CCardHeader>
            <CCardBody>
              {groupedPermissions.length === 0 ? <div className="text-body-secondary text-center py-3">Role ini belum memiliki hak akses.</div> : (
                <CTable responsive hover align="middle">
                  <CTableHead><CTableRow><CTableHeaderCell>Grup</CTableHeaderCell><CTableHeaderCell>Fitur</CTableHeaderCell><CTableHeaderCell>Aksi / Permission</CTableHeaderCell><CTableHeaderCell>Kode Permission</CTableHeaderCell></CTableRow></CTableHead>
                  <CTableBody>
                    {groupedPermissions.map((feature) => feature.actions.map((permission, index) => (
                      <CTableRow key={permission.id}>
                        {index === 0 && <CTableDataCell rowSpan={feature.actions.length}>{feature.groupName}</CTableDataCell>}
                        {index === 0 && <CTableDataCell rowSpan={feature.actions.length} className="fw-semibold">{feature.featureName}</CTableDataCell>}
                        <CTableDataCell>{permission.action_name || permission.name || '-'}</CTableDataCell>
                        <CTableDataCell><code>{permission.code || '-'}</code></CTableDataCell>
                      </CTableRow>
                    )))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
      </div>
    </RolePageLayout>
  )
}

export default RoleDetailPage
