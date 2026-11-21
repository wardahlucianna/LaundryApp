import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CCol,
  CForm, CFormInput, CFormSwitch, CRow, CSpinner,
} from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const initialValues = {
  name: '',
  address: '',
  whatsapp: '',
  isPrimary: false,
  isActive: true,
}

const OutletForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal.')
    }
    return payload
  }, [])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let active = true
    request(`/outlets/${id}`)
      .then((payload) => {
        if (!active) return
        const data = payload.data || {}
        setValues({
          ...initialValues,
          ...data,
        })
      })
      .catch((loadError) => active && setError(loadError.message || 'Gagal memuat outlet.'))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id, request])

  const change = (key) => (event) => {
    const rawValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    const value = key === 'whatsapp' ? rawValue.replace(/\D/g, '') : rawValue
    setValues((current) => ({ ...current, [key]: value }))
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await request(id ? `/outlets/${id}` : '/outlets', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      })
      navigate('/outlets', {
        state: { notice: id ? 'Outlet berhasil diperbarui.' : 'Outlet berhasil ditambahkan.' },
      })
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan outlet.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title={id ? 'Ubah Outlet' : 'Tambah Outlet'}
      className="role-form-page"
      error={error}
      onClearError={() => setError('')}
    >
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader
          className="d-flex align-items-center py-3"
          style={{ backgroundColor: 'var(--cui-tertiary-bg)', borderBottom: '1px solid var(--cui-border-color)' }}
        >
          <strong className="fs-5">{id ? 'Ubah Outlet' : 'Tambah Outlet'}</strong>
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3 text-body-secondary">
              <CSpinner size="sm" />
              <span>Memuat data outlet...</span>
            </div>
          ) : (
            <CForm onSubmit={save}>
              {error && <CAlert color="danger">{error}</CAlert>}

              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    label={<span>Nama Outlet <span className="text-danger">*</span></span>}
                    placeholder="Masukkan nama outlet"
                    value={values.name}
                    onChange={change('name')}
                    maxLength={120}
                    required
                    disabled={saving}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="WhatsApp"
                    placeholder="Contoh: 081234567890"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={values.whatsapp || ''}
                    onChange={change('whatsapp')}
                    maxLength={30}
                    disabled={saving}
                  />
                </CCol>

                <CCol xs={12}>
                  <label className="form-label" htmlFor="outlet-address">Alamat</label>
                  <textarea
                    id="outlet-address"
                    className="form-control"
                    rows={3}
                    placeholder="Masukkan alamat lengkap outlet"
                    value={values.address || ''}
                    onChange={change('address')}
                    maxLength={2000}
                    disabled={saving}
                  />
                </CCol>

              </CRow>

              <hr className="my-4" />

              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy">
                      <div className="fw-semibold mb-1">Outlet Utama</div>
                      <div className="role-status-note">Jadikan outlet utama usaha.</div>
                    </div>
                    <CFormSwitch
                      className={`role-status-switch ${values.isPrimary ? 'is-active' : 'is-inactive'}`}
                      label={values.isPrimary ? 'Ya' : 'Tidak'}
                      checked={Boolean(values.isPrimary)}
                      onChange={change('isPrimary')}
                      disabled={saving}
                    />
                  </div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy">
                      <div className="fw-semibold mb-1">Status</div>
                      <div className="role-status-note">Outlet aktif dapat digunakan dalam transaksi.</div>
                    </div>
                    <CFormSwitch
                      className={`role-status-switch ${values.isActive ? 'is-active' : 'is-inactive'}`}
                      label={values.isActive ? 'Aktif' : 'Nonaktif'}
                      checked={Boolean(values.isActive)}
                      onChange={change('isActive')}
                      disabled={saving}
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/outlets')}>
                  Batal
                </CButton>
                <CButton color="primary" size="sm" type="submit" disabled={saving}>
                  {saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}
                </CButton>
              </div>
            </CForm>
          )}
        </CCardBody>
      </CCard>
    </MasterPageLayout>
  )
}

export default OutletForm
