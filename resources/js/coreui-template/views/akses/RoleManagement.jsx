import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol,
  CFormInput, CRow, CSpinner, CTable, CTableBody, CTableDataCell,
  CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ConfirmModal from '../../components/ConfirmModal'
import { cilPencil, cilPlus, cilSearch, cilTrash, cilReload } from '@coreui/icons'

const apiBase = (() => {
  const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return configuredBase ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`) : '/api'
})()

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (location.state?.notice) { setNotice(location.state.notice); navigate(location.pathname, { replace: true, state: {} }) }
  }, [location, navigate])

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

  const openCreate = () => navigate('/roles/form')
  const openEdit = (role) => navigate(`/roles/form/${role.id}`)

  const handleDelete = async (role) => {
    if (role.code === 'SUPERADMIN') {
      setError('Role SUPERADMIN tidak dapat dihapus.')
      return
    }
    setRoleToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return
    setDeleting(true)
    setError('')
    setNotice('')
    try {
      await request(`/roles/${roleToDelete.id}`, { method: 'DELETE' })
      setNotice('Role berhasil dihapus.')
      setRoleToDelete(null)
      await loadRoles()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus role.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <CRow className="mb-3">
        <CCol>
          <h2 className="fs-4 mb-1">Manajemen Role</h2>
        </CCol>
      </CRow>

      {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}

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
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      const nextSearch = searchInput.trim()
                      setPage(1)
                      if (nextSearch === search) loadRoles()
                      else { setRoles([]); setLoading(true); setSearch(nextSearch) }
                    }
                  }}
                  aria-label="Cari role"
                />
                <CButton color="secondary" variant="outline" aria-label="Cari" onClick={() => {
                  const nextSearch = searchInput.trim()
                  setPage(1)
                  if (nextSearch === search) loadRoles()
                  else { setRoles([]); setLoading(true); setSearch(nextSearch) }
                }}>
                  <CIcon icon={cilSearch} />
                </CButton>
                <CButton color="secondary" variant="outline" aria-label="Reset filter" title="Reset filter" onClick={() => {
                  setSearchInput('')
                  if (search === '' && page === 1) {
                    loadRoles()
                  } else {
                    setRoles([])
                    setLoading(true)
                    setSearch('')
                    setPage(1)
                  }
                }}>
                  <CIcon icon={cilReload} className="me-2" />
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

      <ConfirmModal
        visible={Boolean(roleToDelete)}
        title="Konfirmasi Hapus Role"
        message={roleToDelete ? `Yakin ingin menghapus role "${roleToDelete.name}"?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        color="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  )
}

export default RoleManagement
