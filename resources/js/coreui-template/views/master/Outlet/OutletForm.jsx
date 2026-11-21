import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const initialValues = { code: '', name: '', address: '', whatsapp: '', email: '', isPrimary: false, isActive: true, ordering: 1, openingTime: '08:00', closingTime: '21:00' }

const OutletForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.errors ? Object.values(payload.errors).flat().join(' ') : payload.message || 'Permintaan gagal.')
    return payload
  }, [])

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let active = true
    request(`/outlets/${id}`).then(payload => {
      if (!active) return
      const data = payload.data || {}
      setValues({ ...initialValues, ...data, openingTime: data.openingTime ? String(data.openingTime).slice(0,5) : '', closingTime: data.closingTime ? String(data.closingTime).slice(0,5) : '' })
    }).catch(e => active && setError(e.message || 'Gagal memuat outlet.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id, request])

  const change = (key) => (event) => setValues(current => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...values, ordering: Number(values.ordering) }
      await request(id ? `/outlets/${id}` : '/outlets', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      navigate('/outlets', { state: { notice: id ? 'Outlet berhasil diperbarui.' : 'Outlet berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan outlet.') } finally { setSaving(false) }
  }

  return <MasterPageLayout title={id ? 'Ubah Outlet' : 'Tambah Outlet'} className="role-form-page" error={error} onClearError={() => setError('')}>
    <CCard className="role-panel role-form-card mb-4"><CCardHeader><strong className="fs-5">{id ? 'Ubah Outlet' : 'Tambah Outlet'}</strong></CCardHeader><CCardBody>
      {loading ? <div className="d-flex align-items-center gap-2 text-body-secondary"><CSpinner size="sm" />Memuat data outlet...</div> : <CForm onSubmit={save}>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CRow className="g-3">
          <CCol xs={12} md={6}><CFormInput label="Kode Outlet *" value={values.code} onChange={change('code')} maxLength={30} required /></CCol>
          <CCol xs={12} md={6}><CFormInput label="Nama Outlet *" value={values.name} onChange={change('name')} maxLength={120} required /></CCol>
          <CCol xs={12}><label className="form-label">Alamat</label><textarea className="form-control" rows={3} value={values.address} onChange={change('address')} maxLength={2000} /></CCol>
          <CCol xs={12} md={6}><CFormInput label="WhatsApp" value={values.whatsapp} onChange={change('whatsapp')} maxLength={30} placeholder="Contoh: 081234567890" /></CCol>
          <CCol xs={12} md={6}><CFormInput label="Email" type="email" value={values.email} onChange={change('email')} maxLength={120} /></CCol>
          <CCol xs={12} md={4}><CFormInput label="Urutan" type="number" min="1" value={values.ordering} onChange={change('ordering')} required /></CCol>
          <CCol xs={6} md={4}><CFormInput label="Jam Buka" type="time" value={values.openingTime} onChange={change('openingTime')} /></CCol>
          <CCol xs={6} md={4}><CFormInput label="Jam Tutup" type="time" value={values.closingTime} onChange={change('closingTime')} /></CCol>
          <CCol xs={12} md={4}><div className="role-status-box rounded p-3 h-100"><div className="fw-semibold mb-2">Outlet Utama</div><CFormSwitch label={values.isPrimary ? 'Ya' : 'Tidak'} checked={Boolean(values.isPrimary)} onChange={change('isPrimary')} /></div></CCol>
          <CCol xs={12} md={4}><div className="role-status-box rounded p-3 h-100"><div className="fw-semibold mb-2">Status</div><CFormSwitch label={values.isActive ? 'Aktif' : 'Nonaktif'} checked={Boolean(values.isActive)} onChange={change('isActive')} /></div></CCol>
        </CRow>
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top"><CButton color="secondary" variant="outline" size="sm" type="button" disabled={saving} onClick={() => navigate('/outlets')}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</CButton></div>
      </CForm>}
    </CCardBody></CCard>
  </MasterPageLayout>
}
export default OutletForm
