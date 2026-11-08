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

import MasterPageLayout from '../../../components/layout/MasterPageLayout'

import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'


// Deduplicate in-flight GET requests across React StrictMode effect remounts.
const pendingAccessGetRequests = new Map()

const GroupFeatureDetail = () => {
  const getGroupStatus = (item) => Boolean(item.isActive ?? item.is_active)
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const request = useCallback((path) => {
    const requestOptions = {}
    const method = String(requestOptions.method || 'GET').toUpperCase()
    const requestKey = `${method}:${apiBase}${path}`
    if (method === 'GET' && pendingAccessGetRequests.has(requestKey)) return pendingAccessGetRequests.get(requestKey)
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const pendingRequest = (async () => {
      const response = await fetch(`${apiBase}${path}`, {
        ...requestOptions,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(requestOptions.headers || {}),
        },
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
        throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
      }
      return payload
    })()
    if (method === 'GET') {
      pendingAccessGetRequests.set(requestKey, pendingRequest)
      pendingRequest.finally(() => {
        if (pendingAccessGetRequests.get(requestKey) === pendingRequest) pendingAccessGetRequests.delete(requestKey)
      }).catch(() => {})
    }
    return pendingRequest
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    request('/permission-groups?per_page=100')
      .then((payload) => {
        const found = (payload.data || []).find(
          (item) => String(item.groupFeatureId) === String(id),
        )

        if (!found) {
          throw new Error('Kelompok fitur tidak ditemukan.')
        }

        if (active) {
          setGroup(found)
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError.message ||
              'Gagal memuat detail kelompok fitur.',
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

  const openEdit = async () => {
    try {
      const basePath = await getAccessFeaturePath(['Manajemen Kelompok Fitur', 'Manajemen Group Fitur', 'Manajemen Kelompok Fitur', 'Group Feature', 'Feature Group'])
      if (basePath) navigate(`${basePath}/form/${group.groupFeatureId}`)
      else setError('Path Manajemen Kelompok Fitur belum terdaftar di database.')
    } catch (navigationError) {
      setError(navigationError.message || 'Gagal membaca path Manajemen Kelompok Fitur dari database.')
    }
  }

  return (
    <MasterPageLayout
      title="Manajemen Kelompok Fitur"
      className="role-detail-page"
      error={error}
      onClearError={() => setError('')}
    >
      {loading ? (
        <div className="d-flex align-items-center gap-2 py-4 text-body-secondary">
          <CSpinner size="sm" className="me-2" color="warning" />
          <span>Memuat detail kelompok fitur...</span>
        </div>
      ) : (
        group && (
          <CCard className="role-panel role-form-card mb-4">
            <CCardHeader>
              <strong className="fs-5">Detail Kelompok Fitur</strong>
            </CCardHeader>

            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">
                    Nama Kelompok
                  </div>
                  <div className="fw-semibold">{group.name}</div>
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="text-body-secondary small">Ikon</div>
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
                    color={getGroupStatus(group) ? 'success' : 'secondary'}
                  >
                    {getGroupStatus(group) ? 'Aktif' : 'Nonaktif'}
                  </CBadge>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                  try {
                    const listPath = await getAccessFeaturePath(['Manajemen Kelompok Fitur', 'Manajemen Group Fitur', 'Manajemen Kelompok Fitur', 'Group Feature', 'Feature Group'])
                    if (listPath) navigate(listPath)
                    else setError('Path Manajemen Kelompok Fitur belum terdaftar di database.')
                  } catch (navigationError) {
                    setError(navigationError.message || 'Gagal membaca path Manajemen Kelompok Fitur dari database.')
                  }
                }}
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
