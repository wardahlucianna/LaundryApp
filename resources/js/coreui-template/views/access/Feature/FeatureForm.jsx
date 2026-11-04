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


const getGroupId = (group) =>
  group?.groupFeatureId ??
  group?.groupFeatureId ??
  group?.groupId ??
  ''
  const FeatureFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [feature, setFeature] = useState(null)
  const [groups, setGroups] = useState([])
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
      headers: {
        Accept: 'application/json',
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
        Authorization: `Bearer ${token}`,
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
        const [groupsPayload, featurePayload] = await Promise.all([
          request('/permission-groups?per_page=100'),
          id
            ? request(`/permission-features/${id}`)
            : Promise.resolve(null),
        ])

        if (!active) {
          return
        }

        const availableGroups = groupsPayload.data || []
        const loadedFeature = featurePayload
          ? featurePayload.data || featurePayload
          : null

        setGroups(availableGroups)
        setFeature(loadedFeature)

        const selectedGroupId = String(
          loadedFeature?.groupFeatureId ||
            loadedFeature?.group?.groupFeatureId ||
            '',
        )

        setValues({
          groupFeatureId: selectedGroupId,
          name: loadedFeature?.name || '',
          path: loadedFeature?.path || '',
          ordering: loadedFeature?.ordering ?? 0,
          menuType: loadedFeature?.menuType || 'sidebar',
          isActive: loadedFeature
            ? Boolean(loadedFeature.isActive)
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
    String(group.groupFeatureId) === String(values.groupFeatureId),
  )

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

      window.dispatchEvent(new Event('sunrise:permissions-updated'))
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
        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4 text-body-secondary">
            <CSpinner color="primary" size="sm" />
            <span>Memuat data fitur...</span>
          </div>
        ) : (
          <CCard className="role-panel role-form-card mb-4">
            <CCardHeader>
              <div>
                <strong className="fs-5">
                  {feature ? 'Edit Fitur' : 'Tambah Fitur'}
                </strong>
              </div>
            </CCardHeader>

            <CCardBody>
              <CForm onSubmit={save}>
                <CRow className="g-3">
                  <CCol xs={12} md={6}>
                    <label className="form-label">
                      Kelompok <span className="text-danger">*</span>
                    </label>

                    <CFormSelect
                      value={values.groupFeatureId}
                      onChange={handleGroupChange}
                      required
                      disabled={formDisabled}
                    >
                      <option value="">Pilih Kelompok</option>
                      {availableGroups.map((group) => (
                        <option key={String(getGroupId(group))} value={String(getGroupId(group))}>
                          {group.name}
                          {!group.isActive ? ' (Nonaktif)' : ''}
                        </option>
                      ))}
                    </CFormSelect>
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
                      <option value="topbar">Bilah Atas</option>
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
                        <CSpinner size="sm" className="me-2" />
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
        )}
      </div>
    </MasterPageLayout>
  )
}

export default FeatureFormPage
