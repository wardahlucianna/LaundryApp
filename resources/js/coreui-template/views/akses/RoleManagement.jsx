import React, { useCallback, useEffect, useState } from 'react'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CForm,
  CFormInput, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader,
  CModalTitle, CRow, CSpinner, CTable, CTableBody, CTableDataCell,
  CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilTrash } from '@coreui/icons'

const apiBase = (() => {
  const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return configuredBase ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`) : '/api'
})()

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', is_active: true })

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search.trim()) params.set('search', search.trim())
      const payload = await request(`/roles?${params.toString()}`)
      setRoles(payload.data || [])
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      })
    } catch (loadError) {
      setError(loadError.message || 'Gagal memuat data role.')
    } finally {
      setLoading(false)
    }
  }, [page, search, request])

  useEffect(() => { loadRoles() }, [loadRoles])

  const openCreate = () => {
    setEditingRole(null)
    setForm({ name: '', code: '', is_active: true })
    setError('')
    setModalVisible(true)
  }

  const openEdit = (role) => {
    setEditingRole(role)
    setForm({ name: role.name || '', code: role.code || '', is_active: Boolean(role.is_active) })
    setError('')
    setModalVisible(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { name: form.name.trim(), code: form.code.trim(), is_active: form.is_active }
      if (editingRole) {
        await request(`/roles/${editingRole.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        setNotice('Role berhasil diperbarui.')
      } else {
        await request('/roles', { method: 'POST', body: JSON.stringify(payload) })
        setNotice('Role berhasil ditambahkan.')
        setPage(1)
      }
      setModalVisible(false)
      await loadRoles()
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan role.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role) => {
    if (role.code === 'SUPERADMIN') {
      setError('Role SUPERADMIN tidak dapat dihapus.')
      return
    }
    if (!window.confirm(`Yakin ingin menghapus role "${role.name}"?`)) return
    setError('')
    setNotice('')
    try {
      await request(`/roles/${role.id}`, { method: 'DELETE' })
      setNotice('Role berhasil dihapus.')
      await loadRoles()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus role.')
    }
  }

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <CRow className="mb-3">
        <CCol>
          <h2 className="fs-4 mb-1">Manajemen Role</h2>
          <div className="text-body-secondary">Kelola role dan status aktif pengguna Sunrise Laundry.</div>
        </CCol>
      </CRow>

      {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
      {error && !modalVisible && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}

      <CCard className="mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <strong>Daftar Role</strong>
          <CButton color="primary" onClick={openCreate}>
            <CIcon icon={cilPlus} className="me-2" />Tambah Role
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol xs={12} md={6} lg={4}>
              <div className="d-flex gap-2">
                <CFormInput
                  placeholder="Cari nama atau kode role..."
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                  aria-label="Cari role"
                />
                <CButton color="secondary" variant="outline" onClick={loadRoles} aria-label="Cari">
                  <CIcon icon={cilSearch} />
                </CButton>
              </div>
            </CCol>
            <CCol className="d-flex justify-content-md-end align-items-center mt-2 mt-md-0">
              <small className="text-body-secondary">Total: {pagination.total} role</small>
            </CCol>
          </CRow>

          <CTable hover responsive align="middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: '60px' }}>No.</CTableHeaderCell>
                <CTableHeaderCell>Nama Role</CTableHeaderCell>
                <CTableHeaderCell>Kode</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Jumlah Hak Akses</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell className="text-center" style={{ width: '140px' }}>Aksi</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {loading ? (
                <CTableRow><CTableDataCell colSpan={6} className="text-center py-4"><CSpinner size="sm" className="me-2" />Memuat data...</CTableDataCell></CTableRow>
              ) : roles.length === 0 ? (
                <CTableRow><CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">Data role tidak ditemukan.</CTableDataCell></CTableRow>
              ) : roles.map((role, index) => (
                <CTableRow key={role.id}>
                  <CTableDataCell>{(pagination.current_page - 1) * 10 + index + 1}</CTableDataCell>
                  <CTableDataCell className="fw-semibold">{role.name}</CTableDataCell>
                  <CTableDataCell><code>{role.code}</code></CTableDataCell>
                  <CTableDataCell className="text-center">{role.permissions_count ?? 0}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-inline-flex gap-2">
                      <CButton color="warning" variant="outline" size="sm" onClick={() => openEdit(role)} title="Edit role" aria-label={`Edit ${role.name}`}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" variant="outline" size="sm" disabled={role.code === 'SUPERADMIN'} onClick={() => handleDelete(role)} title="Hapus role" aria-label={`Hapus ${role.name}`}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small className="text-body-secondary">Halaman {pagination.current_page} dari {pagination.last_page}</small>
            <div className="d-flex gap-2">
              <CButton color="secondary" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Sebelumnya</CButton>
              <CButton color="secondary" variant="outline" size="sm" disabled={page >= pagination.last_page || loading} onClick={() => setPage((current) => current + 1)}>Berikutnya</CButton>
            </div>
          </div>
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={() => !saving && setModalVisible(false)} backdrop="static">
        <CForm onSubmit={handleSave}>
          <CModalHeader>
            <CModalTitle>{editingRole ? 'Edit Role' : 'Tambah Role'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <div className="mb-3">
              <CFormInput label="Nama Role" placeholder="Contoh: Administrator" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength={100} />
            </div>
            <div className="mb-3">
              <CFormInput label="Kode Role" placeholder="Contoh: ADMIN" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={60} pattern="[A-Za-z0-9_-]+" />
              <div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div>
            </div>
            <div className="mb-2">
              <CFormSelect label="Status" value={form.is_active ? '1' : '0'} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === '1' }))}>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" type="button" disabled={saving} onClick={() => setModalVisible(false)}>Batal</CButton>
            <CButton color="primary" type="submit" disabled={saving}>
              {saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default RoleManagement
