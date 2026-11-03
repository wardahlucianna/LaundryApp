import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const apiBase = (() => { const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); return base ? (base.endsWith('/api') ? base : base + '/api') : '/api' })()
const iconOptions = ['cilFolderOpen', 'cilPeople', 'cilBasket', 'cilCash', 'cilSettings', 'cilChartLine', 'cilSpeedometer', 'cilBuilding', 'cilTags']
const GroupFeatureForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [values, setValues] = useState({ name: '', icon: 'cilFolderOpen', ordering: 1, is_active: true })
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(apiBase + path, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + token, ...(options.headers || {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.errors ? Object.values(payload.errors).flat().join(' ') : payload.message || 'Permintaan gagal diproses.')
    return payload
  }, [])
  useEffect(() => {
    let active = true
    if (!id) { setLoading(false); return () => { active = false } }
    setLoading(true); setError('')
    request('/permission-groups?per_page=100').then(payload => {
      const found = (payload.data || []).find(item => String(item.id) === String(id))
      if (!found) throw new Error('Group feature tidak ditemukan.')
      if (active) { setGroup(found); setValues({ name: found.name || '', icon: found.icon || 'cilFolderOpen', ordering: Number(found.ordering) || 1, is_active: Boolean(found.is_active) }) }
    }).catch(e => { if (active) setError(e.message || 'Gagal memuat group feature.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, request])
  const save = async event => {
    event.preventDefault(); setError('')
    if (!values.name.trim()) { setError('Nama group wajib diisi.'); return }
    setSaving(true)
    try {
      const body = { name: values.name.trim(), icon: values.icon, ordering: Number(values.ordering), is_active: values.is_active }
      await request(id ? '/permission-groups/' + id : '/permission-groups', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) })
      // Immediately refresh the sidebar menu so the selected group icon is reflected.
      window.dispatchEvent(new Event('sunrise:permissions-updated'))
      navigate('/permission-groups', { state: { notice: id ? 'Group feature berhasil diperbarui.' : 'Group feature berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan group feature.') }
    finally { setSaving(false) }
  }
  return <div className="role-page-layout mb-4">
    <div className="mb-3"><h2 className="fs-4 mb-1">Management Group Feature</h2></div>
    {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
    {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner size="sm" color="primary" /><span>Memuat data group feature...</span></div> :
      <CCard className="role-panel role-form-card mb-4"><CCardHeader><strong className="fs-5">{group ? 'Edit Group Feature' : 'Tambah Group Feature'}</strong></CCardHeader><CCardBody>
        <CForm onSubmit={save}><CRow className="g-3">
          <CCol xs={12} md={6}><CFormInput label="Nama Group" placeholder="Contoh: Master Data" value={values.name} onChange={e => setValues(v => ({ ...v, name: e.target.value }))} required maxLength={120} /></CCol>
          <CCol xs={12} md={6}><CFormSelect label="Icon Group" value={values.icon} onChange={e => setValues(v => ({ ...v, icon: e.target.value }))} options={iconOptions.map(icon => ({ label: icon, value: icon }))} required /></CCol>
          <CCol xs={12} md={6}><CFormInput label="Ordering" type="number" min="1" step="1" value={values.ordering} onChange={e => setValues(v => ({ ...v, ordering: e.target.value }))} required /></CCol>
          <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div className="role-status-copy"><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan group feature agar dapat digunakan.</div></div><CFormSwitch className={`role-status-switch ${values.is_active ? 'is-active' : 'is-inactive'}`} label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={e => setValues(v => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
        </CRow><div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/permission-groups')}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div></CForm>
      </CCardBody></CCard>}
  </div>
}
export default GroupFeatureForm
