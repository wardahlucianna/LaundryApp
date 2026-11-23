import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardHeader, CCol,
  CForm, CFormInput, CFormSwitch, CRow, CSpinner,
} from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const initialValues = { name: '', isActive: true }

const ServiceTypeForm = () => {
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
      return undefined
    }

    let active = true
    request(`/service-types/${id}`)
      .then((payload) => {
        if (!active) return
        const data = payload.data || {}
        setValues({
          name: data.name || '',
          isActive: data.isActive ?? true,
        })
      })
      .catch((loadError) => active && setError(loadError.message || 'Gagal memuat jenis layanan.'))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id, request])

  const change = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [key]: value }))
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request(id ? `/service-types/${id}` : '/service-types', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      })
      navigate('/service-types', {
        state: { notice: id ? 'Jenis layanan berhasil diperbarui.' : 'Jenis layanan berhasil ditambahkan.' },
      })
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan jenis layanan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout title={id ? 'Ubah Jenis Layanan' : 'Tambah Jenis Layanan'} className="role-form-page" error={error} onClearError={() => setError('')}>
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader className="d-flex align-items-center py-3" style={{ backgroundColor: 'var(--cui-tertiary-bg)', borderBottom: '1px solid var(--cui-border-color)' }}>
          <strong className="fs-5">{id ? 'Ubah Jenis Layanan' : 'Tambah Jenis Layanan'}</strong>
        </CCardHeader>
        <CCardBody className="p-4">
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3 text-body-secondary"><CSpinner size="sm" /><span>Memuat data jenis layanan...</span></div>
          ) : (
            <CForm onSubmit={save}>
              <CRow className="g-3 align-items-end">
                <CCol xs={12} md={6}>
                  <CFormInput
                    label={<span>Nama Jenis Layanan <span className="text-danger">*</span></span>}
                    placeholder="Masukkan nama jenis layanan"
                    value={values.name}
                    onChange={change('name')}
                    maxLength={100}
                    required
                    disabled={saving}
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy">
                      <div className="fw-semibold mb-1">Status</div>
                      <div className="role-status-note">Jenis layanan aktif dapat digunakan pada master layanan.</div>
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
                <CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={() => navigate('/service-types')}>Batal</CButton>
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

export default ServiceTypeForm
