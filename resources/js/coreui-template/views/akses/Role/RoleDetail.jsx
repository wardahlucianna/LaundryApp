import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormCheck,
  CRow, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil } from '@coreui/icons'
import MasterPageLayout from '../../../components/MasterPageLayout'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const permissionActionOrder = (permission) => {
  const action = `${permission.action_name || ''} ${permission.name || ''}`.toLowerCase()
  if (/view|lihat|read|akses/.test(action)) return 0
  if (/create|add|tambah|insert/.test(action)) return 1
  if (/edit|update|ubah|perbarui/.test(action)) return 2
  if (/delete|remove|hapus/.test(action)) return 3
  if (/print|cetak/.test(action)) return 4
  if (/export|unduh|download/.test(action)) return 5
  if (/import|unggah|upload/.test(action)) return 6
  return 7
}

const RoleDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const request = useCallback(async (path) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include',
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.message || 'Gagal memuat detail role.')
    return payload
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([request(`/roles/${id}`), request('/permission-features?is_active=1&per_page=100')])
      .then(([rolePayload, permissionsPayload]) => {
        if (active) {
          setRole(rolePayload.data || rolePayload)
          setPermissions(permissionsPayload.data || [])
        }
      })
      .catch((e) => { if (active) setError(e.message || 'Gagal memuat detail role dan permission.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, request])

  const groupedPermissions = useMemo(() => {
    const groups = new Map()
    ;permissions.forEach((permission) => {
      const groupName = permission.group?.name || 'Lainnya'
      const featureName = permission.name || 'Fitur tidak terdefinisi'
      if (!groups.has(groupName)) groups.set(groupName, new Map())
      const features = groups.get(groupName)
      if (!features.has(featureName)) features.set(featureName, [])
      features.get(featureName).push(permission)
    })
    return Array.from(groups.entries()).sort(([a, featuresA], [b, featuresB]) => {
      const groupOrderA = Number([...featuresA.values()][0]?.[0]?.group?.ordering ?? 0)
      const groupOrderB = Number([...featuresB.values()][0]?.[0]?.group?.ordering ?? 0)
      return groupOrderA - groupOrderB || a.localeCompare(b)
    }).map(([groupName, features]) => ({
      name: groupName,
      features: Array.from(features.entries()).sort(([a, itemsA], [b, itemsB]) => {
        const featureOrderA = Number(itemsA[0]?.ordering ?? 0)
        const featureOrderB = Number(itemsB[0]?.ordering ?? 0)
        return featureOrderA - featureOrderB || a.localeCompare(b)
      }).map(([featureName, items]) => ({
        name: featureName,
        items: [...items].sort((a, b) => permissionActionOrder(a) - permissionActionOrder(b) || a.name.localeCompare(b.name)),
      })),
    }))
  }, [permissions])

  return (
    <MasterPageLayout
      title="Management Role"
      className="role-detail-page"
      headingActions={<>
        <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate('/roles/list')}><CIcon icon={cilArrowLeft} className="me-1" />Kembali</CButton>
        {role && <CButton color="primary" size="sm" onClick={() => navigate(`/roles/form/${role.id}`)}><CIcon icon={cilPencil} className="me-1" />Edit Role</CButton>}
      </>}
    >
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <div className="role-detail-page">
      {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner size="sm" />Memuat detail role...</div> : role && (
        <>
          <CCard className="mb-4">
            <CCardHeader><strong>Informasi Role</strong></CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Nama Role</div><div className="fw-semibold">{role.name || '-'}</div></CCol>
                                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Status</div><CBadge style={{ fontSize: '0.8rem' }} color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CCol>
                <CCol xs={12} md={6}><div className="small text-body-secondary mb-1">Jumlah Pengguna</div><div className="fw-semibold">{role.users_count ?? 0}</div></CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Rincian Hak Akses</strong>
              <span className="text-body fw-semibold">{role.features?.length ?? 0} akses diberikan dari {permissions.length} tersedia</span>
            </CCardHeader>
            <CCardBody>
              {groupedPermissions.length === 0 ? <div className="text-body-secondary text-center py-3">Role ini belum memiliki hak akses.</div> : (
                <div className="d-flex flex-column gap-3">
                  <style>{" .role-permission-checkbox .form-check-input { width: 1.15rem; height: 1.15rem; margin-top: 0.15rem; background-color: var(--cui-body-bg); border: 1.5px solid #6c757d; opacity: 1; } .role-permission-checkbox .form-check-input:disabled { opacity: 1; } .role-permission-checkbox .form-check-input:checked, .role-permission-checkbox .form-check-input:checked:disabled { background-color: #0d6efd; border-color: #0d6efd; } .role-permission-checkbox .form-check-label, .role-permission-checkbox .form-check-input:disabled ~ .form-check-label { padding-left: 0.25rem; color: var(--cui-body-color) !important; opacity: 1 !important; } "}</style>
                  {groupedPermissions.map((group) => (
                    <CCard key={group.name} className="border">
                      <CCardHeader className="py-2">
                        <CButton
                          color="link"
                          className="d-flex align-items-center justify-content-between w-100 p-0 text-decoration-none text-body fw-semibold"
                          onClick={() => setCollapsedGroups((current) => ({ ...current, [group.name]: !current[group.name] }))}
                          aria-expanded={!collapsedGroups[group.name]}
                        >
                          <span>{group.name}</span>
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                            aria-hidden="true"
                            style={{
                              width: '28px',
                              height: '28px',
                              color: 'var(--cui-secondary-color)',
                              backgroundColor: 'var(--cui-tertiary-bg)',
                              border: '1px solid var(--cui-border-color)',
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: collapsedGroups[group.name] ? 'rotate(-90deg)' : 'rotate(0deg)',
                                transition: 'transform 180ms ease',
                              }}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </CButton>
                      </CCardHeader>
                      {!collapsedGroups[group.name] && <CCardBody className="d-flex flex-column gap-3">
                        {group.features.map((feature) => (
                          <div key={feature.name}>
                            <div className="fw-semibold mb-2">{feature.name}</div>
                            <CRow className="g-2">
                              {feature.items.map((permission) => (
                                <CCol xs={12} sm={6} md={4} key={permission.id}>
                                  <CFormCheck
                                    className="fs-6 role-permission-checkbox"
                                    id={`role-permission-${permission.id}`}
                                    label={permission.name}
                                    checked={(role.features || []).some((assigned) => String(assigned.id) === String(permission.id))}
                                    disabled
                                  />
                                </CCol>
                              ))}
                            </CRow>
                          </div>
                        ))}
                      </CCardBody>}
                    </CCard>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
      </div>
    </MasterPageLayout>
  )
}

export default RoleDetailPage
