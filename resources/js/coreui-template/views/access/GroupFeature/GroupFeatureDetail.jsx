import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'

import MasterPageLayout from '../../../components/MasterPageLayout'

import { apiBase } from '../../../../services/api'


const GroupFeatureDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const request = useCallback(async (path) => {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      ''

    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        payload.message || 'Permintaan gagal diproses.',
      )
    }

    return payload
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    request('/permission-groups?per_page=100')
      .then((payload) => {
        const found = (payload.data || []).find(
          (item) => String(item.id) === String(id),
        )

        if (!found) {
          throw new Error('Group feature tidak ditemukan.')
        }

        if (active) {
          setGroup(found)
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError.message ||
              'Gagal memuat detail group feature.',
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id, request])

  const openEdit = () => {
    navigate(`/permission-groups/form/${group.id}`)
  }

  return (
    <MasterPageLayout
      title="Management Group Feature"
      className="role-detail-page"
      error={error}
      onClearError={() => setError('')}
    >
      {loading ? (
        <div className="d-flex align-items-center gap-2 py-4 text-body-secondary">
          <CSpinner size="sm" color="primary" />
          <span>Memuat detail group feature...</span>
        </div>
      ) : (
        group && (
          <CCard className="role-panel role-form-card mb-4">
            <CCardHeader>
              <strong className="fs-5">Detail Group Feature</strong>
            </CCardHeader>

            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">
                    Nama Group
                  </div>
                  <div className="fw-semibold">{group.name}</div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">Icon</div>
                  <div className="fw-semibold">
                    {group.icon || 'cilFolderOpen'}
                  </div>
                </CCol>

                <CCol xs={12}>
                  <div className="text-body-secondary small">
                    Deskripsi
                  </div>
                  <div>{group.description || '—'}</div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">
                    Jumlah Fitur
                  </div>
                  <div className="fw-semibold">
                    {group.features_count ?? 0}
                  </div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">Status</div>
                  <CBadge
                    color={group.is_active ? 'success' : 'secondary'}
                  >
                    {group.is_active ? 'Aktif' : 'Nonaktif'}
                  </CBadge>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/permission-groups')}
                >
                  Kembali
                </CButton>

                <CButton
                  color="primary"
                  size="sm"
                  onClick={openEdit}
                >
                  Edit
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        )
      )}
    </MasterPageLayout>
  )
}

export default GroupFeatureDetail
