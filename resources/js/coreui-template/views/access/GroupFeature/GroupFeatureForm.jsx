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

    if (!id) {
      setLoading(false)

      return () => {
        active = false
      }
    }

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

        if (!active) {
          return
        }

        setGroup(found)
        setValues({
          name: found.name || '',
          icon: found.icon || 'cilFolderOpen',
          ordering: Number(found.ordering) || 1,
          is_active: Boolean(found.is_active),
        })
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || 'Gagal memuat group feature.')
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

  const handleOrderingChange = (event) => {
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
      setError('Nama group wajib diisi.')
      return
    }

    setSaving(true)

    try {
      const body = {
        name: values.name.trim(),
        icon: values.icon,
        ordering: Number(values.ordering),
        is_active: values.is_active,
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

      navigate('/permission-groups', {
        state: {
          notice: id
            ? 'Group feature berhasil diperbarui.'
            : 'Group feature berhasil ditambahkan.',
        },
      })
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan group feature.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MasterPageLayout
      title="Management Group Feature"
      className="role-form-page"
      error={error}
      onClearError={() => setError('')}
    >


      {loading ? (
        <div className="d-flex align-items-center gap-2 py-4 text-body-secondary">
          <CSpinner size="sm" color="primary" />
          <span>Memuat data group feature...</span>
        </div>
      ) : (
        <CCard className="role-panel role-form-card mb-4">
          <CCardHeader>
            <strong className="fs-5">
              {group ? 'Edit Group Feature' : 'Tambah Group Feature'}
            </strong>
          </CCardHeader>

          <CCardBody>
            <CForm onSubmit={save}>
              <CRow className="g-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Nama Group"
                    placeholder="Contoh: Master Data"
                    value={values.name}
                    onChange={handleNameChange}
                    required
                    maxLength={120}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <label className="form-label">Icon Group</label>
                  <div className="position-relative">
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      className="d-flex align-items-center justify-content-between w-100"
                      aria-label="Pilih icon group"
                      aria-expanded={iconPickerOpen}
                      onClick={() => setIconPickerOpen((open) => !open)}
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
                        aria-label="Pilihan icon group"
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
                  <input type="hidden" name="icon" value={values.icon} required />
                </CCol>

                <CCol xs={12} md={6}>
                  <CFormInput
                    label="Ordering"
                    type="number"
                    min="1"
                    step="1"
                    value={values.ordering}
                    onChange={handleOrderingChange}
                    required
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100">
                    <div className="role-status-copy">
                      <div className="fw-semibold mb-1">Status</div>
                      <div className="role-status-note">
                        Aktifkan group feature agar dapat digunakan.
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
                  onClick={() => navigate(-1)}
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
    </MasterPageLayout>
  )
}

export default GroupFeatureForm
