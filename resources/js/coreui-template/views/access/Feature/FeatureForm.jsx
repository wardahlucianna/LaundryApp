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


const getGroupId = (group) =>
  group?.id ??
  group?.permission_group_id ??
  group?.permissionGroupId ??
  group?.groupId ??
  ''
  const FeatureFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [feature, setFeature] = useState(null)
  const [groups, setGroups] = useState([])
  const [values, setValues] = useState({
    permission_group_id: '',
    name: '',
    path: '',
    ordering: 0,
    menu_type: 'sidebar',
    is_active: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
          loadedFeature?.permission_group_id ||
            loadedFeature?.group?.id ||
            '',
        )

        setValues({
          permission_group_id: selectedGroupId,
          name: loadedFeature?.name || '',
          path: loadedFeature?.path || '',
          ordering: loadedFeature?.ordering ?? 0,
          menu_type: loadedFeature?.menu_type || 'sidebar',
          is_active: loadedFeature
            ? Boolean(loadedFeature.is_active)
            : true,
        })
      } catch (loadError) {
        if (active) {
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
    Boolean(group.is_active) ||
    String(group.id) === String(values.permission_group_id),
  )

  const handleGroupChange = (event) => {
    setValues((current) => ({
      ...current,
      permission_group_id: event.target.value,
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
      menu_type: event.target.value,
    }))
  }

  const handleStatusChange = (event) => {
    setValues((current) => ({
      ...current,
      is_active: event.target.checked,
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setError('')

    if (!values.permission_group_id || !values.name.trim()) {
      setError('Kelompok fitur dan nama fitur wajib diisi.')
      return
    }

    setSaving(true)

    try {
      const body = {
        permission_group_id: values.permission_group_id,
        name: values.name.trim(),
        path: values.path.trim() || null,
        ordering: Number(values.ordering),
        menu_type: values.menu_type,
        is_active: values.is_active,
      }

      const path = id
        ? `/permission-features/${id}`
        : '/permission-features'

      await request(path, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })

      navigate('/permissions', {
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
                      Kelompok Fitur <span className="text-danger">*</span>
                    </label>

                    <CFormSelect
                      value={values.permission_group_id}
                      onChange={handleGroupChange}
                      required
                    >
                      <option value="">Pilih Kelompok Fitur</option>
                      {availableGroups.map((group) => (
                        <option key={String(getGroupId(group))} value={String(getGroupId(group))}>
                          {group.name}
                          {!group.is_active ? ' (Nonaktif)' : ''}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Nama Fitur"
                      placeholder="Contoh: Manajemen Fitur"
                      value={values.name}
                      onChange={handleNameChange}
                      required
                      maxLength={120}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Path Menu"
                      placeholder="Contoh: /permissions"
                      value={values.path}
                      onChange={handlePathChange}
                      maxLength={255}
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormInput
                      label="Ordering / Urutan"
                      type="number"
                      min={0}
                      step={1}
                      value={values.ordering}
                      onChange={handleOrderingChange}
                      required
                    />
                  </CCol>

                  <CCol xs={12} md={6}>
                    <CFormSelect
                      label="Jenis Menu"
                      value={values.menu_type}
                      onChange={handleMenuTypeChange}
                      required
                    >
                      <option value="sidebar">Sidebar</option>
                      <option value="topbar">Topbar</option>
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
                          values.is_active ? 'is-active' : 'is-inactive'
                        }`}
                        label={values.is_active ? 'Aktif' : 'Nonaktif'}
                        checked={values.is_active}
                        onChange={handleStatusChange}
                      />
                    </div>
                  </CCol>
                </CRow>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <CButton
                    color="secondary"
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={saving}
                    onClick={() => navigate('/permissions')}
                  >
                    Batal
                  </CButton>

                  <CButton
                    color="primary"
                    size="sm"
                    type="submit"
                    disabled={saving}
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
