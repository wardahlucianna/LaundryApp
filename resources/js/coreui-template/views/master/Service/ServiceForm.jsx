import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormSwitch, CRow } from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'

const outlets = ['Gresik', 'Nganjuk', 'Surabaya']
const serviceTypes = ['Cuci', 'Setrika', 'Dry Clean']
const units = ['Kg', 'Pcs', 'Pasang', 'Lusin']

const mockServices = {
  '1': { name: 'Cuci Reguler', type: 'Cuci', unit: 'Kg', duration: '2', durationUnit: 'Hari', prices: [7000, 8000, 9000], isActive: true },
  '2': { name: 'Cuci Express', type: 'Cuci', unit: 'Kg', duration: '1', durationUnit: 'Hari', prices: [12000, 13000, 14000], isActive: true },
  '5': { name: 'Setrika Reguler', type: 'Setrika', unit: 'Kg', duration: '1', durationUnit: 'Hari', prices: [5000, 5500, 6000], isActive: true },
  '7': { name: 'Dry Clean Jas', type: 'Dry Clean', unit: 'Pcs', duration: '3', durationUnit: 'Hari', prices: [45000, 48000, 50000], isActive: true },
}

const initialValues = { name: '', type: '', unit: '', duration: '', durationUnit: 'Hari', prices: ['', '', ''], isActive: true }
const formatRupiah = (value) => value === '' ? '' : new Intl.NumberFormat('id-ID').format(Number(value))

const ServiceForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const existing = useMemo(() => id ? (location.state?.service || mockServices[id]) : null, [id, location.state])
  const [values, setValues] = useState(() => existing ? { ...existing, prices: [...existing.prices] } : { ...initialValues, type: location.state?.serviceType || '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const change = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const changePrice = (index, value) => setValues((current) => ({ ...current, prices: current.prices.map((price, i) => i === index ? value.replace(/[^0-9]/g, '') : price) }))

  const save = (event) => {
    event.preventDefault()
    if (!values.type) { setError('Silakan pilih jenis layanan terlebih dahulu.'); return }
    if (values.prices.some((price) => price === '' || Number(price) <= 0)) { setError('Harga untuk setiap outlet wajib diisi.'); return }
    setSaving(true)
    setError('')
    navigate('/services', { state: { notice: 'Contoh tampilan: data layanan berhasil disimpan. Integrasi API belum diaktifkan.' } })
  }

  return (
    <MasterPageLayout title={id ? 'Ubah Layanan' : 'Tambah Layanan'} className="role-form-page" error={error} onClearError={() => setError('')}>
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader className="d-flex align-items-center py-3" style={{ backgroundColor: 'var(--cui-tertiary-bg)', borderBottom: '1px solid var(--cui-border-color)' }}>
          <strong className="fs-5">{id ? 'Ubah Layanan' : 'Tambah Layanan'}</strong>
        </CCardHeader>
        <CCardBody className="p-4">
          <CForm onSubmit={save}>
            <div className="mb-4">
              <div className="fw-semibold mb-3">Informasi Layanan</div>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CFormSelect label={<span>Jenis Layanan <span className="text-danger">*</span></span>} value={values.type} onChange={change('type')} disabled={Boolean(location.state?.serviceType && !id)} options={[{ label: 'Pilih jenis layanan', value: '' }, ...serviceTypes.map((type) => ({ label: type, value: type }))]} required />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput label={<span>Nama Layanan <span className="text-danger">*</span></span>} placeholder="Masukkan nama layanan" value={values.name} onChange={change('name')} maxLength={120} required />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormSelect label={<span>Satuan <span className="text-danger">*</span></span>} value={values.unit} onChange={change('unit')} options={[{ label: 'Pilih satuan', value: '' }, ...units.map((unit) => ({ label: unit, value: unit }))]} required />
                </CCol>
                <CCol xs={12} md={6}>
                  <label className="form-label">Estimasi Pengerjaan <span className="text-danger">*</span></label>
                  <div className="d-flex gap-2">
                    <CFormInput type="number" min="1" placeholder="Contoh: 2" value={values.duration} onChange={change('duration')} required />
                    <CFormSelect value={values.durationUnit} onChange={change('durationUnit')} style={{ maxWidth: 150 }} options={[{ label: 'Jam', value: 'Jam' }, { label: 'Hari', value: 'Hari' }]} />
                  </div>
                </CCol>
              </CRow>
            </div>
            <div className="border-top pt-4 mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <div><div className="fw-semibold">Harga per Outlet</div><div className="small text-body-secondary">Tentukan harga layanan untuk masing-masing outlet.</div></div>
                <CBadgeText />
              </div>
              <CRow className="g-3">
                {outlets.map((outlet, index) => (
                  <CCol xs={12} md={6} key={outlet}>
                    <div className="border rounded p-3 h-100">
                      <label className="form-label fw-semibold">{outlet}</label>
                      <div className="input-group">
                        <span className="input-group-text">Rp</span>
                        <CFormInput type="text" inputMode="numeric" placeholder="Masukkan harga" value={formatRupiah(values.prices[index])} onChange={(event) => changePrice(index, event.target.value)} required aria-label={`Harga ${outlet}`} />
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </div>
            <div className="border-top pt-4">
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy"><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Layanan aktif dapat digunakan dalam transaksi.</div></div>
                    <CFormSwitch className={`role-status-switch ${values.isActive ? 'is-active' : 'is-inactive'}`} label={values.isActive ? 'Aktif' : 'Nonaktif'} checked={Boolean(values.isActive)} onChange={change('isActive')} />
                  </div>
                </CCol>
              </CRow>
            </div>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/services')}>Batal</CButton>
              <CButton color="primary" size="sm" type="submit" disabled={saving}>Simpan</CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </MasterPageLayout>
  )
}

const CBadgeText = () => <span className="small text-body-secondary">Harga dapat berbeda antar outlet</span>

export default ServiceForm
