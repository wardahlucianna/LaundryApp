import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardHeader, CCol,
  CForm, CFormInput, CFormSwitch, CRow, CSpinner,
} from '@coreui/react'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import apiClient from '../../../../services/api'

const initialValues = { name: '', symbol: '', isActive: true }

const UnitForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let active = true
    const controller = new AbortController()
    apiClient.get(`/units/${id}`, { signal: controller.signal })
      .then(({ data: payload }) => {
        if (!active) return
        const data = payload.data || {}
        setValues({
          name: data.name || '',
          symbol: data.symbol || '',
          isActive: data.isActive ?? true,
        })
      })
      .catch((loadError) => {
        if (!active || loadError.code === 'ERR_CANCELED') return
        const validationMessage = loadError.response?.data?.errors ? Object.values(loadError.response.data.errors).flat().join(' ') : ''
        setError(validationMessage || loadError.response?.data?.message || 'Gagal memuat satuan.')
      })
      .finally(() => active && setLoading(false))

    return () => { active = false; controller.abort() }
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
      await apiClient({ url: id ? `/units/${id}` : '/units', method: id ? 'put' : 'post', data: values })
      navigate('/units', {
        state: { notice: id ? 'Satuan berhasil diperbarui.' : 'Satuan berhasil ditambahkan.' },
      })
    } catch (saveError) {
      const validationMessage = saveError.response?.data?.errors ? Object.values(saveError.response.data.errors).flat().join(' ') : ''
      setError(validationMessage || saveError.response?.data?.message || 'Gagal menyimpan satuan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title={id ? 'Ubah Satuan' : 'Tambah Satuan'}
      className="role-form-page"
      error={error}
      onClearError={() => setError('')}
    >
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader
          className="d-flex align-items-center py-3"
          style={{
            backgroundColor: 'var(--cui-tertiary-bg)',
            borderBottom: '1px solid var(--cui-border-color)',
          }}
        >
          <strong className="fs-5">{id ? 'Ubah Satuan' : 'Tambah Satuan'}</strong>
        </CCardHeader>

        <CCardBody className="p-4">
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3 text-body-secondary">
              <CSpinner size="sm" />
              <span>Memuat data satuan...</span>
            </div>
          ) : (
            <CForm onSubmit={save}>
              <div className="mb-4">
                <CRow className="g-3">
                  <CCol xs={12} md={6}>
                    <CFormInput
                      label={<span>Nama Satuan <span className="text-danger">*</span></span>}
                      placeholder="Masukkan nama satuan"
                      value={values.name}
                      onChange={change('name')}
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label={<span>Simbol <span className="text-danger">*</span></span>}
                      placeholder="Contoh: Kg, Pcs, Liter"
                      value={values.symbol}
                      onChange={change('symbol')}
                      maxLength={20}
                      required
                      disabled={saving}
                    />
                  </CCol>
                </CRow>
              </div>

              <div className="mb-2">
                <CRow className="g-3">
                  <CCol xs={12} md={6}>
                    <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                      <div className="role-status-copy">
                        <div className="fw-semibold mb-1">Status</div>
                        <div className="role-status-note">Satuan aktif dapat digunakan dalam transaksi.</div>
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
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={saving}
                  onClick={() => navigate('/units')}
                >
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

export default UnitForm
