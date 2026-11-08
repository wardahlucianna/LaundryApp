import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormSwitch,
  CRow,
  CSpinner,
} from '@coreui/react'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'

import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'


const getPosisiActiveStatus = (role) => {
  const rawStatus = role?.isActive ?? role?.is_active ?? role?.active ?? role?.status
  if (typeof rawStatus === 'boolean') return rawStatus
  if (typeof rawStatus === 'number') return rawStatus === 1

  const normalizedStatus = String(rawStatus ?? '').trim().toLowerCase()
  if (['1', 'true', 'aktif', 'active'].includes(normalizedStatus)) return true
  if (['0', 'false', 'nonaktif', 'inactive'].includes(normalizedStatus)) return false

  return false
}

// Share pending GET requests across StrictMode effect remounts.
const pendingPosisiFormGetRequests = new Map()

const PosisiFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [role, setPosisi] = useState(null)
  const [features, setFeatures] = useState([])
  const [values, setValues] = useState({
    name: '',
    is_active: true,
  })
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([])
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const [featureSearch, setFeatureSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)

  const formDisabled = loading || saving || loadFailed

  const request = useCallback((path, options = {}) => {
    const method = String(options.method || 'GET').toUpperCase()
    const requestKey = `${method}:${apiBase}${path}`

    if (method === 'GET' && pendingPosisiFormGetRequests.has(requestKey)) {
      return pendingPosisiFormGetRequests.get(requestKey)
    }

    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      ''

    const pendingRequest = (async () => {
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
        const validationMessage = payload.errors
          ? Object.values(payload.errors).flat().join(' ')
          : ''
        throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
      }

      return payload
    })()

    if (method === 'GET') {
      pendingPosisiFormGetRequests.set(requestKey, pendingRequest)
      pendingRequest.finally(() => {
        if (pendingPosisiFormGetRequests.get(requestKey) === pendingRequest) {
          pendingPosisiFormGetRequests.delete(requestKey)
        }
      }).catch(() => {})
    }

    return pendingRequest
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setLoadFailed(false)
    setError('')

    const load = async () => {
      try {
        // Saat edit, endpoint detail role sudah membawa daftar fitur aktif
        // dan fitur yang terpilih. Form cukup melakukan satu request.
        const payload = id
          ? await request(`/roles/${id}`)
          : await request('/roles/features/options')

        if (!active) {
          return
        }

        const loadedPosisi = id ? (payload.data || payload) : null
        const rawAvailableFeatures = id
          ? (loadedPosisi?.availableFeatures || [])
          : (payload.data || [])

        // Simpan ke state hanya field yang dipakai checklist dan pengurutan.
        const availableFeatures = rawAvailableFeatures.map((feature) => ({
          featureId: feature.featureId,
          name: feature.name,
          ordering: feature.ordering,
          group: feature.group
            ? {
                groupFeatureId: feature.group.groupFeatureId,
                name: feature.group.name,
                ordering: feature.group.ordering,
              }
            : null,
        }))

        setFeatures(availableFeatures)
        setCollapsedGroups(
          Object.fromEntries(
            [...new Set(availableFeatures.map((feature) => feature.group?.name || 'Lainnya'))]
              .map((groupName) => [groupName, false]),
          ),
        )
        setPosisi(loadedPosisi || null)

        setValues({
          name: loadedPosisi?.name || '',
          is_active: loadedPosisi
            ? getPosisiActiveStatus(loadedPosisi)
            : true,
        })

        setSelectedFeatureIds(
          (loadedPosisi?.features || []).map((feature) => feature.featureId),
        )
      } catch (loadError) {
        if (active) {
          setLoadFailed(true)
          setError(
            loadError.message ||
              'Gagal memuat data peran dan fitur.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [id, request])

  const groupedFeatures = useMemo(() => {
    const groups = new Map()

    const keyword = featureSearch.trim().toLowerCase()

    features
      .filter((feature) => !keyword || String(feature.name || '').toLowerCase().includes(keyword) || String(feature.group?.name || 'Lainnya').toLowerCase().includes(keyword))
      .forEach((feature) => {
      const groupName = feature.group?.name || 'Lainnya'

      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }

      groups.get(groupName).push(feature)
    })

    return Array.from(groups.entries())
      .sort(([groupNameA, itemsA], [groupNameB, itemsB]) => {
        const orderA = Number(itemsA[0]?.group?.ordering ?? 0)
        const orderB = Number(itemsB[0]?.group?.ordering ?? 0)

        return orderA - orderB || groupNameA.localeCompare(groupNameB)
      })
      .map(([name, items]) => ({
        name,
        items: items.sort((featureA, featureB) => {
          const orderA = Number(featureA.ordering ?? 0)
          const orderB = Number(featureB.ordering ?? 0)

          return orderA - orderB || featureA.name.localeCompare(featureB.name)
        }),
      }))
  }, [features, featureSearch])

  const toggleFeature = (featureId, checked) => {
    setSelectedFeatureIds((current) => {
      if (checked) {
        return [...new Set([...current, featureId])]
      }

      return current.filter((item) => item !== featureId)
    })
  }

  const toggleGroupCollapse = (groupName) => {
    setCollapsedGroups((current) => ({
      ...current,
      [groupName]: !current[groupName],
    }))
  }

  const handleNameChange = (event) => {
    setValues((current) => ({
      ...current,
      name: event.target.value,
    }))
  }

  const handleStatusChange = (eventOrChecked) => {
    // CoreUI may pass a change event; normalize to the actual switch value.
    const checked =
      typeof eventOrChecked === 'boolean'
        ? eventOrChecked
        : Boolean(eventOrChecked?.target?.checked)

    setValues((current) => ({
      ...current,
      is_active: checked,
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setError('')

    if (!values.name.trim()) {
      setError('Nama peran wajib diisi.')
      return
    }

    setSaving(true)

    try {
      const rolePayload = await request(
        id ? `/roles/${id}` : '/roles',
        {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify({
            name: values.name.trim(),
            is_active: values.is_active,
            ...(values.name.trim().toUpperCase() !== 'SUPER ADMIN'
              ? { featureIds: selectedFeatureIds }
              : {}),
          }),
        },
      )

      // Nama/status role dan hak akses fitur tersimpan sekaligus
      // melalui satu request POST/PUT ke endpoint /roles.
      // Perubahan role tidak mengubah menu pengguna yang sedang login;
      // tidak perlu invalidasi cache atau request ulang /auth/me/menus.

      const listPath = await getAccessFeaturePath(['Management Position', 'Manajemen Posisi', 'Manajemen Posisi'])
      if (!listPath) throw new Error('Path daftar Manajemen Posisi belum terdaftar di database.')
      navigate(listPath, {
        state: {
          notice: id
            ? 'Posisi berhasil diperbarui.'
            : 'Posisi berhasil ditambahkan.',
        },
      })
    } catch (saveError) {
      setError(
        saveError.message ||
          'Gagal menyimpan peran dan hak akses.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title="Manajemen Posisi"
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
          <strong className="fs-5">
            {id ? 'Ubah Posisi' : 'Tambah Posisi'}
          </strong>
        </CCardHeader>

        <CCardBody>
          <CForm onSubmit={save}>
            <CRow className="g-3">
              <CCol xs={12} md={6}>
                <CFormInput
                  label="Nama Posisi"
                  value={values.name}
                  onChange={handleNameChange}
                  required
                  maxLength={100}
                  disabled={formDisabled}
                />
              </CCol>

              <CCol xs={12} md={6}>
                <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                  <div className="role-status-copy">
                    <div className="fw-semibold mb-1">Status</div>
                    <div className="role-status-note">
                      Aktifkan role agar dapat digunakan.
                    </div>
                  </div>

                  <CFormSwitch
                    className={`role-status-switch ${
                      values.is_active ? 'is-active' : 'is-inactive'
                    }`}
                    label={values.is_active ? 'Aktif' : 'Nonaktif'}
                    checked={values.is_active}
                    onChange={handleStatusChange}
                    disabled={formDisabled}
                  />
                </div>
              </CCol>
            </CRow>

            <hr className="my-4" />

            <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
              <h5 className="mb-1">Hak Akses Fitur</h5>
              <span className="fw-semibold">
                {selectedFeatureIds.length} dipilih
              </span>
            </div>

            <CFormInput
              className="mb-3"
              placeholder="Cari fitur atau kelompok fitur..."
              value={featureSearch}
              onChange={(event) => setFeatureSearch(event.target.value)}
              disabled={formDisabled}
              aria-label="Cari hak akses fitur"
            />

            <style>
              {'.role-permission-checkbox .form-check-input { width: 1.15rem; height: 1.15rem; margin-top: 0.15rem; background-color: var(--cui-body-bg); border: 1.5px solid #6c757d; opacity: 1; } .role-permission-checkbox .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; } .role-permission-checkbox .form-check-label { padding-left: 0.25rem; color: var(--cui-body-color); }'}
            </style>

            {loading ? (
              <div className="d-flex align-items-center gap-2 py-3 text-body-secondary">
                <CSpinner size="sm" className="me-2" color="warning" />
                <span>Memuat checklist hak akses fitur...</span>
              </div>
            ) : features.length === 0 ? (
              <CAlert color="info">
                Belum ada fitur aktif yang tersedia.
              </CAlert>
            ) : (
              <div className="d-flex flex-column gap-3">
                {groupedFeatures.map((group) => (
                  <CCard key={group.name} className="border">
                    <CCardHeader className="py-2">
                      <CButton
                        type="button"
                        color="link"
                        className="d-flex align-items-center justify-content-between w-100 p-0 text-decoration-none text-body fw-semibold"
                        onClick={() => toggleGroupCollapse(group.name)}
                        disabled={formDisabled}
                        aria-expanded={!collapsedGroups[group.name]}
                      >
                        <span>{group.name}</span>

                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          aria-hidden="true"
                          style={{
                            width: '28px',
                            height: '28px',
                            color: 'var(--cui-secondary-color)',
                            backgroundColor: 'var(--cui-tertiary-bg)',
                            border: '1px solid var(--cui-border-color)',
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              transform: collapsedGroups[group.name]
                                ? 'rotate(-90deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 180ms ease',
                            }}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </CButton>
                    </CCardHeader>

                    {!collapsedGroups[group.name] && (
                      <CCardBody>
                        <CRow className="g-2">
                          {group.items.map((feature) => (
                            <CCol
                              xs={12}
                              sm={6}
                              md={4}
                              key={feature.featureId}
                            >
                              <CFormCheck
                                className="fs-6 role-permission-checkbox"
                                id={`role-feature-${feature.featureId}`}
                                label={feature.name}
                                checked={selectedFeatureIds.includes(
                                  feature.featureId,
                                )}
                                disabled={formDisabled}
                                onChange={(event) =>
                                  toggleFeature(
                                    feature.featureId,
                                    event.target.checked,
                                  )
                                }
                              />
                            </CCol>
                          ))}
                        </CRow>
                      </CCardBody>
                    )}
                  </CCard>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton
                color="secondary"
                size="sm"
                variant="outline"
                type="button"
                disabled={formDisabled}
                onClick={async () => {
                  try {
                    const listPath = await getAccessFeaturePath(['Management Position', 'Manajemen Posisi', 'Manajemen Posisi'])
                    if (listPath) navigate(listPath)
                    else setError('Path Manajemen Posisi belum terdaftar di database.')
                  } catch (navigationError) {
                    setError(navigationError.message || 'Gagal membaca path Manajemen Posisi dari database.')
                  }
                }}
              >
                Batal
              </CButton>

              <CButton
                color="primary"
                size="sm"
                type="submit"
                disabled={formDisabled || Boolean(error)}
              >
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" color="warning" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </MasterPageLayout>
  )
}

export default PosisiFormPage
