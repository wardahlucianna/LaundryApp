import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const RoleFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [role, setRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [values, setValues] = useState({ name: '', code: '', is_active: true })
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState('')

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const load = async () => {
      try {
        const [permissionsPayload, rolePayload] = await Promise.all([
          request('/permissions?is_active=1&per_page=100'),
          id ? request(`/roles/${id}`) : Promise.resolve(null),
        ])
        if (!active) return
        const loadedRole = rolePayload ? (rolePayload.data || rolePayload) : null
        setPermissions(permissionsPayload.data || [])
        setRole(loadedRole)
        setValues({ name: loadedRole?.name || '', code: loadedRole?.code || '', is_active: loadedRole ? Boolean(loadedRole.is_active) : true })
        setSelectedPermissionIds(loadedRole?.permissions?.map((permission) => permission.id) || [])
      } catch (e) {
        if (active) setError(e.message || 'Gagal memuat data role dan permission.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, request])

  const groupedPermissions = useMemo(() => {
    const groups = new Map()
    permissions.forEach((permission) => {
      const groupName = permission.feature?.group?.name || 'Lainnya'
      const featureName = permission.feature?.name || 'Fitur tanpa kelompok'
      if (!groups.has(groupName)) groups.set(groupName, new Map())
      const features = groups.get(groupName)
      if (!features.has(featureName)) features.set(featureName, [])
      features.get(featureName).push(permission)
    })
    return Array.from(groups.entries()).map(([groupName, features]) => ({
      name: groupName,
      features: Array.from(features.entries()).map(([featureName, items]) => ({ name: featureName, items })),
    }))
  }, [permissions])

  const togglePermission = (permissionId, checked) => {
    setSelectedPermissionIds((current) => checked ? Array.from(new Set([...current, permissionId])) : current.filter((permission) => permission !== permissionId))
  }

  const save = async (event) => {
    event.preventDefault()
    setValidation('')
    setError('')
    if (!values.name.trim() || !values.code.trim()) {
      setValidation('Nama dan kode role wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const rolePayload = await request(id ? `/roles/${id}` : '/roles', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ name: values.name.trim(), code: values.code.trim(), is_active: values.is_active }),
      })
      const savedRole = rolePayload.data || rolePayload
      if (values.code.trim().toUpperCase() !== 'SUPERADMIN') {
        await request(`/roles/${savedRole.id || id}/permissions`, {
          method: 'PUT',
          body: JSON.stringify({ permission_ids: selectedPermissionIds }),
        })
      }
      navigate('/roles/list', { state: { notice: id ? 'Role berhasil diperbarui.' : 'Role berhasil ditambahkan.' } })
    } catch (e) {
      setError(e.message || 'Gagal menyimpan role dan permission.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="role-page-layout mb-4">
      <div className="mb-3"><h2 className="fs-4 mb-1">Management Role</h2><div className="small text-body-secondary">{id ? 'Perbarui role dan hak akses aplikasi.' : 'Tambah role dan atur hak akses aplikasi.'}</div></div>
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <div className="role-form-page">
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner color="primary" size="sm" /><span>Memuat data role dan permission...</span></div>
        ) : (
          <CCard className="role-panel role-form-card mb-4">
            <CCardHeader><div><strong className="fs-5">{role ? 'Edit Role' : 'Tambah Role'}</strong></div></CCardHeader>
            <CCardBody>
              {validation && <CAlert color="warning">{validation}</CAlert>}
              <CForm onSubmit={save}>
                <CRow className="g-3">
                  <CCol xs={12} md={6}><CFormInput label="Nama Role" placeholder="Contoh: Administrator" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required maxLength={100} /></CCol>
                  <CCol xs={12} md={6}><CFormInput label="Kode Role" placeholder="Contoh: ADMIN" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={60} pattern="[A-Za-z0-9_-]+" /><div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div></CCol>
                  <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div className="role-status-copy"><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan role agar dapat digunakan.</div></div><CFormSwitch className={`role-status-switch ${values.is_active ? 'is-active' : 'is-inactive'}`} label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
                </CRow>
                <hr className="my-4" />
                <div className="mt-4">
                  <style>{" .role-permission-checkbox .form-check-input { width: 1.15rem; height: 1.15rem; margin-top: 0.15rem; accent-color: #0d6efd; } .role-permission-checkbox .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; } .role-permission-checkbox .form-check-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.2); } .role-permission-checkbox .form-check-label { padding-left: 0.25rem; } "}</style>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"><h5 className="mb-1">Checklist Hak Akses</h5><span className="text-body fw-semibold">{selectedPermissionIds.length} dipilih</span></div>
                  {permissions.length === 0 ? <CAlert color="info">Belum ada permission aktif yang tersedia.</CAlert> : (
                    <div className="d-flex flex-column gap-3">
                      {groupedPermissions.map((group) => (
                        <CCard key={group.name} className="border">
                          <CCardHeader className="py-2"><strong>{group.name}</strong></CCardHeader>
                          <CCardBody className="d-flex flex-column gap-3">
                            {group.features.map((feature) => (
                              <div key={feature.name}>
                                <div className="fw-semibold mb-2">{feature.name}</div>
                                <CRow className="g-2">
                                  {feature.items.map((permission) => (
                                    <CCol xs={12} sm={6} md={4} key={permission.id}>
                                      <CFormCheck className="fs-6 role-permission-checkbox" id={`role-permission-${permission.id}`} label={permission.action_name ? `${permission.name} (${permission.action_name})` : permission.name} checked={selectedPermissionIds.includes(permission.id)} onChange={(event) => togglePermission(permission.id, event.target.checked)} />
                                    </CCol>
                                  ))}
                                </CRow>
                              </div>
                            ))}
                          </CCardBody>
                        </CCard>
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/roles/list')}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div>
              </CForm>
            </CCardBody>
          </CCard>
        )}
      </div>
    </div>
  )
}

export default RoleFormPage
