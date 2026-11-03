import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const apiBase = (() => { const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api' })()
const RoleFormPage = () => {
  const navigate = useNavigate(); const { id } = useParams()
  const [role, setRole] = useState(null); const [features, setFeatures] = useState([])
  const [values, setValues] = useState({ name: '', is_active: true })
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([])
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [validation, setValidation] = useState('')
  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) { const msg = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''; throw new Error(msg || payload.message || 'Permintaan gagal diproses.') }
    return payload
  }, [])
  useEffect(() => {
    let active = true; setLoading(true); setError('')
    ;(async () => {
      try {
        const [featuresPayload, rolePayload] = await Promise.all([request('/permission-features?is_active=1&per_page=100'), id ? request(`/roles/${id}`) : Promise.resolve(null)])
        if (!active) return
        const loadedRole = rolePayload?.data || rolePayload
        const available = featuresPayload.data || []
        setFeatures(available); setRole(loadedRole || null)
        setValues({ name: loadedRole?.name || '', is_active: loadedRole ? Boolean(loadedRole.is_active) : true })
        setSelectedFeatureIds((loadedRole?.features || []).map((feature) => feature.id))
      } catch (e) { if (active) setError(e.message || 'Gagal memuat data role dan fitur.') }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [id, request])
  const groupedFeatures = useMemo(() => {
    const groups = new Map()
    features.forEach((feature) => { const group = feature.group?.name || 'Lainnya'; if (!groups.has(group)) groups.set(group, []); groups.get(group).push(feature) })
    return Array.from(groups.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([name,items]) => ({ name, items: items.sort((a,b) => a.name.localeCompare(b.name)) }))
  }, [features])
  const toggleFeature = (featureId, checked) => setSelectedFeatureIds((current) => checked ? [...new Set([...current, featureId])] : current.filter((item) => item !== featureId))
  const save = async (event) => {
    event.preventDefault(); setValidation(''); setError('')
    if (!values.name.trim()) { setValidation('Nama role wajib diisi.'); return }
    setSaving(true)
    try {
      const payload = await request(id ? `/roles/${id}` : '/roles', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name: values.name.trim(), is_active: values.is_active }) })
      const saved = payload.data || payload
      if (values.name.trim().toUpperCase() !== 'SUPER ADMIN') await request(`/roles/${saved.id || id}/features`, { method: 'PUT', body: JSON.stringify({ feature_ids: selectedFeatureIds }) })
      navigate('/roles/list', { state: { notice: id ? 'Role berhasil diperbarui.' : 'Role berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan role dan hak akses.') }
    finally { setSaving(false) }
  }
  return <div className="role-page-layout mb-4">
    <div className="mb-3"><h2 className="fs-4 mb-1">Management Role</h2></div>
    {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
    {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner size="sm" /><span>Memuat data role dan fitur...</span></div> :
      <CCard className="role-panel role-form-card mb-4"><CCardHeader><strong className="fs-5">{role ? 'Edit Role' : 'Tambah Role'}</strong></CCardHeader><CCardBody>
        {validation && <CAlert color="warning">{validation}</CAlert>}
        <CForm onSubmit={save}><CRow className="g-3">
          <CCol xs={12} md={6}><CFormInput label="Nama Role" value={values.name} onChange={(e) => setValues(v => ({ ...v, name: e.target.value }))} required maxLength={100} /></CCol>
          <CCol xs={12} md={6}><CFormInput label="Kode Role" value={values.code} onChange={(e) => setValues(v => ({ ...v, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={60} pattern="[A-Za-z0-9_-]+" /></CCol>
          <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan role agar dapat digunakan.</div></div><CFormSwitch label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={(e) => setValues(v => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
        </CRow><hr className="my-4" />
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><h5 className="mb-1">Checklist Hak Akses Fitur</h5><span className="fw-semibold">{selectedFeatureIds.length} dipilih</span></div>
        {features.length === 0 ? <CAlert color="info">Belum ada fitur aktif yang tersedia.</CAlert> : <div className="d-flex flex-column gap-3">{groupedFeatures.map(group => <CCard key={group.name} className="border"><CCardHeader className="py-2"><strong>{group.name}</strong></CCardHeader><CCardBody><CRow className="g-2">{group.items.map(feature => <CCol xs={12} sm={6} md={4} key={feature.id}><CFormCheck className="fs-6 role-permission-checkbox" id={`role-feature-${feature.id}`} label={feature.name} checked={selectedFeatureIds.includes(feature.id)} onChange={e => toggleFeature(feature.id, e.target.checked)} /></CCol>)}</CRow></CCardBody></CCard>)}</div>}
        <div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/roles/list')}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div>
        </CForm>
      </CCardBody></CCard>}
  </div>
}
export default RoleFormPage
