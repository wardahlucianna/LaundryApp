import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const initialValues = { code: '', name: '', symbol: '', description: '', isActive: true, ordering: 1 }

const UnitForm = () => {
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
    request(`/units/${id}`).then(payload => {
      if (active) setValues({ ...initialValues, ...(payload.data || {}) })
    }).catch(e => active && setError(e.message || 'Gagal memuat satuan.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id, request])

  const change = (key) => (event) => setValues(current => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...values, ordering: Number(values.ordering) }
      await request(id ? `/units/${id}` : '/units', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      navigate('/units', { state: { notice: id ? 'Satuan berhasil diperbarui.' : 'Satuan berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan satuan.') } finally { setSaving(false) }
  }

  return <MasterPageLayout title={id ? 'Ubah Satuan' : 'Tambah Satuan'} className="role-form-page" error={error} onClearError={() => setError('')}>
    <div className="role-form-page">
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader><strong className="fs-5">{id ? 'Ubah Satuan' : 'Tambah Satuan'}</strong></CCardHeader>
        <CCardBody>
          {loading ? <div className="d-flex align-items-center gap-2 text-body-secondary"><CSpinner size="sm" />Memuat data satuan...</div> : <CForm onSubmit={save}>
            {error && <CAlert color="danger">{error}</CAlert>}
            <div className="mb-4">
              <div className="fw-semibold mb-3">Informasi Satuan</div>
              <CRow className="g-3">
                <CCol xs={12} md={6}><CFormInput label="Kode Satuan *" value={values.code} onChange={change('code')} maxLength={30} placeholder="Contoh: SAT001" required /></CCol>
                <CCol xs={12} md={6}><CFormInput label="Nama Satuan *" value={values.name} onChange={change('name')} maxLength={100} placeholder="Contoh: Kilogram" required /></CCol>
                <CCol xs={12} md={6}><CFormInput label="Simbol *" value={values.symbol} onChange={change('symbol')} maxLength={20} placeholder="Contoh: Kg" required /></CCol>
                <CCol xs={12} md={6}><CFormInput label="Urutan" type="number" min="1" value={values.ordering} onChange={change('ordering')} required /></CCol>
                <CCol xs={12}><label className="form-label">Deskripsi</label><textarea className="form-control" rows={3} value={values.description} onChange={change('description')} maxLength={500} placeholder="Keterangan tambahan satuan (opsional)" /></CCol>
              </CRow>
            </div>
            <div className="mb-2 pt-3 border-top">
              <div className="fw-semibold mb-3">Pengaturan Satuan</div>
              <div className="role-status-box rounded p-3">
                <div className="fw-semibold mb-2">Status</div>
                <CFormSwitch label={values.isActive ? 'Aktif' : 'Nonaktif'} checked={Boolean(values.isActive)} onChange={change('isActive')} />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <CButton color="secondary" variant="outline" size="sm" type="button" disabled={saving} onClick={() => navigate('/units')}>Batal</CButton>
              <CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</CButton>
            </div>
          </CForm>}
        </CCardBody>
      </CCard>
    </div>
  </MasterPageLayout>
}

export default UnitForm
