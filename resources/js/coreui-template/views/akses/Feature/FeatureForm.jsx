import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const FeatureFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [feature, setFeature] = useState(null)
  const [groups, setGroups] = useState([])
  const [values, setValues] = useState({ group_name: '', name: '', code: '', path: '', menu_type: 'sidebar', is_active: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        const [groupsPayload, featurePayload] = await Promise.all([
          request('/permission-groups?per_page=100'),
          id ? request(`/permission-features/${id}`) : Promise.resolve(null),
        ])
        if (!active) return
        const availableGroups = groupsPayload.data || []
        const loadedFeature = featurePayload ? (featurePayload.data || featurePayload) : null
        setGroups(availableGroups)
        setFeature(loadedFeature)
        setValues({
          group_name: loadedFeature?.group?.name || availableGroups.find((group) => group.id === loadedFeature?.permission_group_id)?.name || '',
          name: loadedFeature?.name || '',
          code: loadedFeature?.code || '',
          path: loadedFeature?.path || '',
          menu_type: loadedFeature?.menu_type || 'sidebar',
          is_active: loadedFeature ? Boolean(loadedFeature.is_active) : true,
        })
      } catch (e) {
        if (active) setError(e.message || 'Gagal memuat data fitur.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, request])

  const resolveGroupId = async (groupName) => {
    const cleanName = groupName.trim()
    const existing = groups.find((group) => group.name.trim().toLowerCase() === cleanName.toLowerCase())
    if (existing) return existing.id
    const baseCode = cleanName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'GROUP'
    const existingCodes = new Set(groups.map((group) => String(group.code || '').toUpperCase()))
    let code = baseCode
    let suffix = 2
    while (existingCodes.has(code)) {
      code = `${baseCode.slice(0, 70 - String(suffix).length - 1)}_${suffix}`
      suffix += 1
    }
    const payload = await request('/permission-groups', {
      method: 'POST',
      body: JSON.stringify({ name: cleanName, code, is_active: true }),
    })
    return (payload.data || payload).id
  }

  const save = async (event) => {
    event.preventDefault()
    setError('')
    if (!values.group_name.trim() || !values.name.trim() || !values.code.trim()) {
      setError('Kelompok fitur, nama fitur, dan kode fitur wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const permission_group_id = await resolveGroupId(values.group_name)
      const body = {
        permission_group_id,
        name: values.name.trim(),
        code: values.code.trim().toUpperCase().replace(/\s+/g, '_'),
        path: values.path.trim() || null,
        menu_type: values.menu_type,
        is_active: values.is_active,
      }
      await request(id ? `/permission-features/${id}` : '/permission-features', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      navigate('/permissions', { state: { notice: id ? 'Fitur berhasil diperbarui.' : 'Fitur berhasil ditambahkan.' } })
    } catch (e) {
      setError(e.message || 'Gagal menyimpan fitur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="role-page-layout mb-4">
      <div className="mb-3"><h2 className="fs-4 mb-1">Management Fitur</h2></div>
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <div className="role-form-page">
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner color="primary" size="sm" /><span>Memuat data fitur...</span></div>
        ) : (
          <CCard className="role-panel role-form-card mb-4">
            <CCardHeader><div><strong className="fs-5">{feature ? 'Edit Fitur' : 'Tambah Fitur'}</strong></div></CCardHeader>
            <CCardBody>
              <CForm onSubmit={save}>
                <CRow className="g-3">
                  <CCol xs={12} md={6}><CFormInput label="Kelompok Fitur" placeholder="Contoh: Master Data" value={values.group_name} onChange={(e) => setValues((v) => ({ ...v, group_name: e.target.value }))} required maxLength={120} /></CCol>
                  <CCol xs={12} md={6}>
                    <div className="mb-3"><CFormInput label="Nama Fitur" placeholder="Contoh: Manajemen Fitur" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required maxLength={120} /></div>
                    <CFormInput label="Kode Fitur" placeholder="Contoh: FEATURES" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase().replace(/\\s+/g, '_') }))} required maxLength={80} pattern="[A-Za-z0-9_-]+" />
                    <div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div>
                  </CCol>
                  <CCol xs={12} md={6}><CFormInput label="Path Menu" placeholder="Contoh: /permissions" value={values.path} onChange={(e) => setValues((v) => ({ ...v, path: e.target.value }))} maxLength={255} /></CCol>
                  <CCol xs={12} md={6}><CFormSelect label="Jenis Menu" value={values.menu_type} onChange={(e) => setValues((v) => ({ ...v, menu_type: e.target.value }))} required><option value="sidebar">Sidebar</option><option value="topbar">Topbar</option></CFormSelect></CCol>
                  <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div className="role-status-copy"><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan fitur agar ditampilkan sesuai hak akses role.</div></div><CFormSwitch className={`role-status-switch ${values.is_active ? 'is-active' : 'is-inactive'}`} label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
                </CRow>
                <div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/permissions')}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div>
              </CForm>
            </CCardBody>
          </CCard>
        )}
      </div>
    </div>
  )
}

export default FeatureFormPage
