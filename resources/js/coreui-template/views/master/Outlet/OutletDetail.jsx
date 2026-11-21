import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const OutletDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [outlet, setOutlet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    fetch(`${apiBase}/outlets/${id}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.message || 'Gagal memuat detail outlet.')
        return payload
      })
      .then((payload) => active && setOutlet(payload.data || null))
      .catch((loadError) => active && setError(loadError.message || 'Gagal memuat detail outlet.'))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id])

  const field = (label, value, fullWidth = false) => (
    <CCol xs={12} md={fullWidth ? 12 : 6}>
      <div className="mb-2">
        <div className="small text-body-secondary mb-1">{label}</div>
        <div className="fw-semibold text-break">{value || '—'}</div>
      </div>
    </CCol>
  )

  return (
    <MasterPageLayout title="Detail Outlet" className="role-form-page" error={error} onClearError={() => setError('')}>
      <CCard className="role-panel role-form-card mb-4">
        <CCardHeader className="d-flex align-items-center justify-content-between py-3" style={{ backgroundColor: 'var(--cui-tertiary-bg)', borderBottom: '1px solid var(--cui-border-color)' }}>
          <strong className="fs-5">Detail Outlet</strong>
          {outlet && (
            <CButton color="primary" size="sm" onClick={() => navigate(`/outlets/form/${id}`)}>
              <CIcon icon={cilPencil} className="me-1" />
              Ubah
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3 text-body-secondary">
              <CSpinner size="sm" />
              <span>Memuat detail outlet...</span>
            </div>
          ) : outlet ? (
            <>
              <CRow className="g-4">
                {field('Nama Outlet', outlet.name)}
                {field('WhatsApp', outlet.whatsapp)}
                {field('Alamat', outlet.address, true)}
                {field('Jam Buka', outlet.openingTime ? String(outlet.openingTime).slice(0, 5) : '')}
                {field('Jam Tutup', outlet.closingTime ? String(outlet.closingTime).slice(0, 5) : '')}
              </CRow>

              <hr className="my-4" />

              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="small text-body-secondary mb-2">Outlet Utama</div>
                  <CBadge color={outlet.isPrimary ? 'info' : 'secondary'}>{outlet.isPrimary ? 'Ya' : 'Tidak'}</CBadge>
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="small text-body-secondary mb-2">Status</div>
                  <CBadge color={outlet.isActive ? 'success' : 'secondary'}>{outlet.isActive ? 'Aktif' : 'Nonaktif'}</CBadge>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate('/outlets')}>
                  Kembali
                </CButton>
              </div>
            </>
          ) : (
            <CAlertFallback />
          )}
        </CCardBody>
      </CCard>
    </MasterPageLayout>
  )
}

const CAlertFallback = () => (
  <div className="text-center text-body-secondary py-4">Data outlet tidak ditemukan.</div>
)

export default OutletDetail
