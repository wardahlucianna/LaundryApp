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
  CFormSwitch,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFolderOpen,
  cilPeople,
  cilBasket,
  cilCash,
  cilSettings,
  cilChartLine,
  cilSpeedometer,
  cilBuilding,
  cilTags,
} from '@coreui/icons'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'

import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'


const iconOptions = [
  { name: 'cilFolderOpen', label: 'Folder', icon: cilFolderOpen },
  { name: 'cilPeople', label: 'Pengguna', icon: cilPeople },
  { name: 'cilBasket', label: 'Keranjang', icon: cilBasket },
  { name: 'cilCash', label: 'Keuangan', icon: cilCash },
  { name: 'cilSettings', label: 'Pengaturan', icon: cilSettings },
  { name: 'cilChartLine', label: 'Grafik', icon: cilChartLine },
  { name: 'cilSpeedometer', label: 'Dashboard', icon: cilSpeedometer },
  { name: 'cilBuilding', label: 'Gedung', icon: cilBuilding },
  { name: 'cilTags', label: 'Kategori', icon: cilTags },
]

const getGroupActiveStatus = (group) => {
  const rawStatus = group?.isActive ?? group?.is_active ?? group?.active ?? group?.status
  if (typeof rawStatus === 'boolean') return rawStatus
  if (typeof rawStatus === 'number') return rawStatus === 1

  const normalizedStatus = String(rawStatus ?? '').trim().toLowerCase()
  if (['1', 'true', 'aktif', 'active'].includes(normalizedStatus)) return true
  if (['0', 'false', 'nonaktif', 'inactive'].includes(normalizedStatus)) return false

  return false
}

const GroupFeatureForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [group, setGroup] = useState(null)
  const [values, setValues] = useState({
    name: '',
    icon: 'cilFolderOpen',
    ordering: 1,
    is_active: true,
  })
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
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

    if (!id) {
      setLoading(false)

      return () => {
        active = false
      }
    }

    setLoading(true)
    setLoadFailed(false)
    setError('')

    request(`/permission-groups/${id}`)
      .then((payload) => {
        const found = payload?.data?.data || payload?.data || payload

        if (!found || String(found.groupFeatureId ?? found.groupId) !== String(id)) {
          throw new Error('Kelompok fitur tidak ditemukan.')
        }

        if (!active) {
          return
        }

        setGroup(found)
        setValues({
          name: found.name || '',
          icon: found.icon || 'cilFolderOpen',
          ordering: Number(found.ordering) || 1,
          is_active: getGroupActiveStatus(found),
        })
      })
      .catch((loadError) => {
        if (active) {
          setLoadFailed(true)
          setError(loadError.message || 'Gagal memuat kelompok fitur.')
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

  const handleNameChange = (event) => {
    setValues((current) => ({
      ...current,
      name: event.target.value,
    }))
  }

  const handleIconChange = (iconName) => {
    setValues((current) => ({
      ...current,
      icon: iconName,
    }))
    setIconPickerOpen(false)
  }

  const handleUrutanChange = (event) => {
    setValues((current) => ({
      ...current,
      ordering: event.target.value,
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

    if (!values.name.trim()) {
      setError('Nama kelompok wajib diisi.')
      return
    }

    setSaving(true)

    try {
      const body = {
        name: values.name.trim(),
        icon: values.icon,
        ordering: Number(values.ordering),
        isActive: values.is_active,
      }

      const path = id
        ? `/permission-groups/${id}`
        : '/permission-groups'

      await request(path, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })

      // Refresh the sidebar menu so the selected group icon is reflected.
      window.dispatchEvent(new Event('sunrise:permissions-updated'))

      const listPath = await getAccessFeaturePath(['Manajemen Kelompok Fitur', 'Manajemen Group Fitur', 'Manajemen Kelompok Fitur', 'Group Feature', 'Feature Group'])
      if (!listPath) throw new Error('Path Manajemen Kelompok Fitur belum terdaftar di database.')
      navigate(listPath, {
        state: {
          notice: id
            ? 'Kelompok fitur berhasil diperbarui.'
            : 'Kelompok fitur berhasil ditambahkan.',
        },
      })
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan kelompok fitur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title="Manajemen Kelompok Fitur"
      className="role-form-page"
      error={error}
      onClearError={() => setError('')}
    >


      {loading ? (
        <div className="d-flex align-items-center gap-2 py-4 text-body-secondary">
          <CSpinner size="sm" className="me-2" color="warning" />
          <span>Memuat data kelompok fitur...</span>
        </div>
      ) : (
        <CCard className="role-panel role-form-card mb-4">
          <CCardHeader>
            <strong className="fs-5">
              {group ? 'Ubah Kelompok Fitur' : 'Tambah Kelompok Fitur'}
            </strong>
          </CCardHeader>

          <CCardBody>
            <CForm onSubmit={save}>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Nama Kelompok"
                    placeholder="Contoh: Data Master"
                    value={values.name}
                    onChange={handleNameChange}
                    required
                    maxLength={120}
                    disabled={formDisabled}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <label className="form-label">Ikon Kelompok</label>
                  <div className="position-relative">
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      className="d-flex align-items-center justify-content-between w-100"
                      aria-label="Pilih ikon kelompok"
                      aria-expanded={iconPickerOpen}
                      onClick={() => setIconPickerOpen((open) => !open)}
                      disabled={formDisabled}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <CIcon
                          icon={iconOptions.find((item) => item.name === values.icon)?.icon || cilFolderOpen}
                          size="lg"
                        />
                        <span>
                          {iconOptions.find((item) => item.name === values.icon)?.label || values.icon}
                        </span>
                      </span>
                      <span className="text-body-secondary">▾</span>
                    </CButton>

                    {iconPickerOpen && (
                      <div
                        className="position-absolute start-0 end-0 mt-1 p-2 bg-body border rounded shadow"
                        style={{ zIndex: 1050 }}
                        role="listbox"
                        aria-label="Pilihan ikon kelompok"
                      >
                        <div className="row g-2">
                          {iconOptions.map((item) => (
                            <div className="col-4" key={item.name}>
                              <CButton
                                type="button"
                                color={values.icon === item.name ? 'primary' : 'secondary'}
                                variant={values.icon === item.name ? 'outline' : 'ghost'}
                                className="d-flex flex-column align-items-center justify-content-center gap-1 w-100 py-2"
                                onClick={() => handleIconChange(item.name)}
                                disabled={formDisabled}
                                title={item.label}
                                aria-label={item.label}
                                role="option"
                                aria-selected={values.icon === item.name}
                              >
                                <CIcon icon={item.icon} size="xl" />
                                <span className="small">{item.label}</span>
                              </CButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="hidden" name="icon" value={values.icon} required disabled={formDisabled} />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Urutan"
                    type="number"
                    min="1"
                    step="1"
                    value={values.ordering}
                    onChange={handleUrutanChange}
                    required
                    disabled={formDisabled}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy">
                      <div className="fw-semibold mb-1">Status</div>
                      <div className="role-status-note">
                        Aktifkan kelompok fitur agar dapat digunakan.
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

              <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={formDisabled}
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
      )}
    </MasterPageLayout>
  )
}

export default GroupFeatureForm
