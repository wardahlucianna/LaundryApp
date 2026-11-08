import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CRow,
  CSpinner,
} from '@coreui/react'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'

import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'


// Share in-flight form requests across React StrictMode effect remounts.
const pendingFeatureFormRequests = new Map()
const pendingGroupOptionsRequests = new Map()

const getGroupId = (group) =>
  group?.groupFeatureId ??
  group?.groupId ??
  ''

const getFeatureActiveStatus = (feature) => {
  const rawStatus = feature?.isActive ?? feature?.is_active ?? feature?.active ?? feature?.status
  if (typeof rawStatus === 'boolean') return rawStatus
  if (typeof rawStatus === 'number') return rawStatus === 1

  const normalizedStatus = String(rawStatus ?? '').trim().toLowerCase()
  if (['1', 'true', 'aktif', 'active'].includes(normalizedStatus)) return true
  if (['0', 'false', 'nonaktif', 'inactive'].includes(normalizedStatus)) return false

  return false
}

const FeatureFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [feature, setFeature] = useState(null)
  const [groups, setGroups] = useState([])
  const [groupsLoaded, setGroupsLoaded] = useState(false)
  const [groupOptionsLoading, setGroupOptionsLoading] = useState(false)
  const [groupSearch, setGroupSearch] = useState('')
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false)
  const [values, setValues] = useState({
    groupFeatureId: '',
    name: '',
    path: '',
    ordering: 0,
    menuType: 'sidebar',
    isActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)

  const formDisabled = loading || saving || loadFailed

  const request = useCallback(async (path, options = {}) => {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      ''

    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const validationMessage = payload.errors
        ? Object.values(payload.errors).flat().join(' ')
        : ''

      throw new Error(
        validationMessage ||
          payload.message ||
          'Permintaan gagal diproses.',
      )
    }

    return payload
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setLoadFailed(false)
    setError('')

    const load = async () => {
      try {
        const requestShared = (path) => {
          if (pendingFeatureFormRequests.has(path)) {
            return pendingFeatureFormRequests.get(path)
          }

          const pending = request(path).finally(() => {
            pendingFeatureFormRequests.delete(path)
          })
          pendingFeatureFormRequests.set(path, pending)
          return pending
        }

        const featurePayload = id
          ? await requestShared(`/permission-features/${id}`)
          : null

        if (!active) {
          return
        }

        const loadedFeature = featurePayload?.data?.data || featurePayload?.data || featurePayload || null

        // Show the currently selected group from the feature relation without
        // fetching the entire group catalog until the dropdown is opened.
        setGroups(loadedFeature?.group ? [loadedFeature.group] : [])
        setGroupsLoaded(false)
        setFeature(loadedFeature)

        const selectedGroupId = String(
          loadedFeature?.groupFeatureId ??
            loadedFeature?.group?.groupFeatureId ??
            loadedFeature?.group?.groupId ??
            '',
        )

        setValues({
          groupFeatureId: selectedGroupId,
          name: loadedFeature?.name || '',
          path: loadedFeature?.path || '',
          ordering: loadedFeature?.ordering ?? 0,
          menuType: loadedFeature?.menuType || 'sidebar',
          isActive: loadedFeature
            ? getFeatureActiveStatus(loadedFeature)
            : true,
        })
      } catch (loadError) {
        if (active) {
          setLoadFailed(true)
          setError(loadError.message || 'Gagal memuat data fitur.')
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

  const availableGroups = groups.filter((group) =>
    Boolean(group.isActive) ||
    String(getGroupId(group)) === String(values.groupFeatureId),
  )

  const filteredGroups = availableGroups.filter((group) => {
    const matchesSearch = String(group.name || '')
      .toLocaleLowerCase()
      .includes(groupSearch.trim().toLocaleLowerCase())

    return matchesSearch || String(getGroupId(group)) === String(values.groupFeatureId)
  })

  const handleGroupChange = (event) => {
    setValues((current) => ({
      ...current,
      groupFeatureId: event.target.value,
    }))
  }

  const handleNameChange = (event) => {
    setValues((current) => ({
      ...current,
      name: event.target.value,
    }))
  }

  const handlePathChange = (event) => {
    setValues((current) => ({
      ...current,
      path: event.target.value,
    }))
  }

  const handleOrderingChange = (event) => {
    setValues((current) => ({
      ...current,
      ordering: event.target.value,
    }))
  }

  const handleMenuTypeChange = (event) => {
    setValues((current) => ({
      ...current,
      menuType: event.target.value,
    }))
  }

  const handleStatusChange = (event) => {
    setValues((current) => ({
      ...current,
      isActive: event.target.checked,
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setError('')

    if (!values.groupFeatureId || !values.name.trim()) {
      setError('Kelompok fitur dan nama fitur wajib diisi.')
      return
    }

    setSaving(true)

    try {
      const body = {
        groupFeatureId: values.groupFeatureId,
        name: values.name.trim(),
        path: values.path.trim() || null,
        ordering: Number(values.ordering),
        menuType: values.menuType,
        isActive: values.isActive,
      }

      const path = id
        ? `/permission-features/${id}`
        : '/permission-features'

      await request(path, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })

      // Refresh route/sidebar only if the saved feature actually participates
      // in sidebar navigation. Non-sidebar features do not require the menus API.
      const isSidebarMenu = body.menuType === 'sidebar' && Boolean(body.path) && Boolean(body.isActive)
      const menuConfigurationChanged = id
        ? [
            ['groupFeatureId', String(feature?.groupFeatureId ?? feature?.group?.groupFeatureId ?? ''), String(body.groupFeatureId)],
            ['name', String(feature?.name ?? ''), body.name],
            ['path', String(feature?.path ?? ''), String(body.path ?? '')],
            ['ordering', Number(feature?.ordering ?? 0), Number(body.ordering)],
            ['menuType', String(feature?.menuType ?? 'sidebar'), body.menuType],
            ['isActive', Boolean(feature?.isActive ?? feature?.is_active), Boolean(body.isActive)],
          ].some(([, previous, next]) => previous !== next) && isSidebarMenu
        : isSidebarMenu

      if (menuConfigurationChanged) {
        window.dispatchEvent(new Event('sunrise:permissions-updated'))
      }
      const listPath = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
      if (!listPath) throw new Error('Path daftar Manajemen Fitur belum terdaftar di database.')
      navigate(listPath, {
        state: {
          notice: id
            ? 'Fitur berhasil diperbarui.'
            : 'Fitur berhasil ditambahkan.',
        },
      })
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan fitur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title="Management Fitur"
      className="role-form-page"
      error={error}
      onClearError={() => setError('')}
    >


      <div className="role-form-page">
        <CCard className="role-panel role-form-card mb-4">
            <CCardHeader>
              <div>
                <strong className="fs-5">
                  {id ? 'Ubah Fitur' : 'Tambah Fitur'}
                </strong>
              </div>
            </CCardHeader>

            <CCardBody>
              {loading && (
                <div className="d-flex align-items-center gap-2 mb-3 text-body-secondary small" role="status">
                  <CSpinner size="sm" className="me-2" color="warning" />
                  <span>Memuat data fitur, input sementara dinonaktifkan...</span>
                </div>
              )}
              <CForm onSubmit={save}>
                <CRow className="g-3">
                  <CCol xs={12} md={6}>
                    <label className="form-label">
                      Kelompok <span className="text-danger">*</span>
                    </label>

                    <div className="position-relative">
                      <CButton
                        type="button"
                        color="secondary"
                        variant="outline"
                        className="d-flex align-items-center justify-content-between w-100 text-start"
                        aria-label="Pilih kelompok fitur"
                        aria-expanded={groupDropdownOpen}
                        disabled={formDisabled}
                        onClick={() => {
                          const shouldOpen = !groupDropdownOpen
                          setGroupDropdownOpen(shouldOpen)
                          setGroupSearch('')

                          // Open the dropdown immediately. Fetch its options in the
                          // background so the first click is responsive.
                          if (shouldOpen && !groupsLoaded) {
                            setGroupOptionsLoading(true)
                            const selectedId = id ? String(values.groupFeatureId || '') : ''
                            const optionsPath = selectedId
                              ? `/permission-groups/options?selectedId=${encodeURIComponent(selectedId)}`
                              : '/permission-groups/options'

                            let pending = pendingGroupOptionsRequests.get(optionsPath)
                            if (!pending) {
                              pending = request(optionsPath).finally(() => {
                                pendingGroupOptionsRequests.delete(optionsPath)
                              })
                              pendingGroupOptionsRequests.set(optionsPath, pending)
                            }

                            pending
                              .then((payload) => {
                                const rows = payload?.data?.data ?? payload?.data ?? payload
                                const groupRows = Array.isArray(rows)
                                  ? rows
                                  : rows && typeof rows === 'object'
                                    ? [rows]
                                    : []
                                setGroups((current) => {
                                  const selectedGroup = current.find(
                                    (group) => String(getGroupId(group)) === String(values.groupFeatureId),
                                  )
                                  const merged = selectedGroup && !groupRows.some(
                                    (group) => String(getGroupId(group)) === String(values.groupFeatureId),
                                  )
                                    ? [selectedGroup, ...groupRows]
                                    : groupRows
                                  return merged
                                })
                                setGroupsLoaded(true)
                              })
                              .catch((groupLoadError) => {
                                setError(groupLoadError.message || 'Gagal memuat pilihan kelompok fitur.')
                              })
                              .finally(() => {
                                setGroupOptionsLoading(false)
                              })
                          }
                        }}
                      >
                        <span className={values.groupFeatureId ? '' : 'text-body-secondary'}>
                          {availableGroups.find((group) => String(getGroupId(group)) === String(values.groupFeatureId))?.name || 'Pilih Kelompok'}
                        </span>
                        <span className="text-body-secondary">▾</span>
                      </CButton>

                      {groupDropdownOpen && (
                        <div
                          className="position-absolute start-0 end-0 mt-1 p-2 bg-body border rounded shadow"
                          style={{ zIndex: 1050, maxHeight: '280px', overflowY: 'auto' }}
                          role="listbox"
                          aria-label="Pilihan kelompok fitur"
                        >
                          <CFormInput
                            type="search"
                            placeholder="Cari kelompok fitur..."
                            value={groupSearch}
                            onChange={(event) => setGroupSearch(event.target.value)}
                            className="mb-2"
                            autoFocus
                            disabled={formDisabled}
                            aria-label="Cari kelompok fitur"
                          />
                          {groupOptionsLoading ? (
                            <div className="small text-body-secondary p-2">Memuat kelompok fitur...</div>
                          ) : filteredGroups.length ? filteredGroups.map((group) => (
                            <CButton
                              key={String(getGroupId(group))}
                              type="button"
                              color={String(getGroupId(group)) === String(values.groupFeatureId) ? 'primary' : 'secondary'}
                              variant={String(getGroupId(group)) === String(values.groupFeatureId) ? 'outline' : 'ghost'}
                              className="d-block w-100 text-start mb-1"
                              role="option"
                              aria-selected={String(getGroupId(group)) === String(values.groupFeatureId)}
                              disabled={formDisabled}
                              onClick={() => {
                                setValues((current) => ({
                                  ...current,
                                  groupFeatureId: String(getGroupId(group)),
                                }))
                                setGroupDropdownOpen(false)
                                setGroupSearch('')
                              }}
                            >
                              {group.name}{!group.isActive ? ' (Nonaktif)' : ''}
                            </CButton>
                          )) : (
                            <div className="small text-body-secondary p-2">Kelompok fitur tidak ditemukan.</div>
                          )}
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="groupFeatureId" value={values.groupFeatureId} required />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Nama Fitur"
                      placeholder="Contoh: Pengelolaan Fitur"
                      value={values.name}
                      onChange={handleNameChange}
                      required
                      maxLength={120}
                      disabled={formDisabled}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Path Menu"
                      placeholder="Contoh: /permissions"
                      value={values.path}
                      onChange={handlePathChange}
                      maxLength={255}
                      disabled={formDisabled}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Urutan"
                      type="number"
                      min={0}
                      step={1}
                      value={values.ordering}
                      onChange={handleOrderingChange}
                      required
                      disabled={formDisabled}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormSelect
                      label="Jenis Menu"
                      value={values.menuType}
                      onChange={handleMenuTypeChange}
                      required
                      disabled={formDisabled}
                    >
                      <option value="sidebar">Menu Samping</option>
                      <option value="topbar">Menu Atas</option>
                    </CFormSelect>
                  </CCol>

                  <CCol xs={12} md={6}>
                    <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                      <div className="role-status-copy">
                        <div className="fw-semibold mb-1">Status</div>
                        <div className="role-status-note">
                          Aktifkan fitur agar ditampilkan sesuai hak akses role.
                        </div>
                      </div>

                      <CFormSwitch
                        className={`role-status-switch ${
                          values.isActive ? 'is-active' : 'is-inactive'
                        }`}
                        label={values.isActive ? 'Aktif' : 'Nonaktif'}
                        checked={values.isActive}
                        onChange={handleStatusChange}
                        disabled={formDisabled}
                      />
                    </div>
                  </CCol>
                </CRow>

                <div className="d-flex justify-content-end gap-2 mt-4 pb-3 border-bottom">
                  <CButton
                    color="secondary"
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={formDisabled}
                    onClick={async () => {
                      try {
                        const listPath = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
                        if (listPath) navigate(listPath)
                        else setError('Path daftar Manajemen Fitur belum terdaftar di database.')
                      } catch (navigationError) {
                        setError(navigationError.message || 'Gagal membaca path Management Fitur dari database.')
                      }
                    }}
                  >
                    Batal
                  </CButton>

                  <CButton
                    color="primary"
                    size="sm"
                    type="submit"
                    disabled={formDisabled}
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
      </div>
    </MasterPageLayout>
  )
}

export default FeatureFormPage
