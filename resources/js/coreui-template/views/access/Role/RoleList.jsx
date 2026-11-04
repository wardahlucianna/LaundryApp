import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilPlus,
  cilSearch,
  cilTrash,
  cilReload,
} from '@coreui/icons'

import ConfirmModal from '../../../components/ConfirmModal'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const RoleListPage = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.notice) {
      return
    }

    setNotice(location.state.notice)

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [location, navigate])

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

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '10',
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (statusFilter !== '') {
        params.set('is_active', statusFilter)
      }

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
  }, [page, search, statusFilter, request])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const openCreate = () => {
    navigate('/roles/form')
  }

  const openEdit = (role) => {
    navigate(`/roles/form/${role.id}`)
  }

  const openDetail = (role) => {
    navigate(`/roles/detail/${role.id}`)
  }

  const handleDelete = (role) => {
    const roleName = String(role.name || '').trim().toUpperCase()

    if (roleName === 'SUPER ADMIN') {
      setError('Role Super Admin tidak dapat dihapus.')
      return
    }

    setRoleToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) {
      return
    }

    setDeleting(true)
    setError('')
    setNotice('')

    try {
      await request(`/roles/${roleToDelete.id}`, {
        method: 'DELETE',
      })

      setNotice('Role berhasil dihapus.')
      setRoleToDelete(null)

      await loadRoles()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus role.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setRoleToDelete(null)
  }

  const perPage = 10

  const applySearch = () => {
    const nextSearch = searchInput.trim()

    setPage(1)

    if (nextSearch === search) {
      loadRoles()
      return
    }

    setSearch(nextSearch)
  }

  const resetSearch = () => {
    setSearchInput('')
    setStatusFilter('')

    if (search === '' && statusFilter === '' && page === 1) {
      loadRoles()
      return
    }

    setSearch('')
    setPage(1)
  }

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      applySearch()
    }
  }

  return (
    <MasterPageLayout
      title="Management Role"
      className="role-list-page"
      notice={notice}
      error={error}
      onClearNotice={() => setNotice('')}
      onClearError={() => setError('')}
    >


      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong className="fs-5">Daftar Role</strong>
          </div>

          <CButton
            color="primary"
            size="sm"
            className="role-compact-button"
            onClick={openCreate}
          >
            <CIcon icon={cilPlus} size="sm" className="me-1" />
            Tambah Role
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CRow className="mb-3">
            <CCol xs={12}>
              <div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100">
                <CFormInput
                  placeholder="Cari nama role"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Cari role"
                  className="flex-grow-1"
                />

                <CFormSelect
                  aria-label="Filter status role"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  style={{ maxWidth: '160px' }}
                  options={[
                    { label: 'Semua Status', value: '' },
                    { label: 'Aktif', value: '1' },
                    { label: 'Nonaktif', value: '0' },
                  ]}
                />

                <CButton
                  color="primary"
                  size="sm"
                  aria-label="Cari"
                  title="Cari"
                  className="role-search-button role-compact-button"
                  onClick={applySearch}
                >
                  <CIcon icon={cilSearch} size="sm" />
                  Cari
                </CButton>

                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  aria-label="Reset filter"
                  title="Reset filter"
                  className="role-reset-button role-compact-button"
                  onClick={resetSearch}
                >
                  <CIcon icon={cilReload} size="sm" />
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>

          <GlobalTable
            columns={[
              { key: 'number', title: 'No.', width: 60, render: (_role, index) => (pagination.current_page - 1) * perPage + index + 1 },
              { key: 'name', title: 'Nama Role', render: (role) => <div className="fw-semibold">{role.name}</div> },
              { key: 'permissions_count', title: 'Jumlah Hak Akses', className: 'text-center', headerClassName: 'text-center', render: (role) => role.permissions_count ?? 0 },
              { key: 'status', title: 'Status', render: (role) => <CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge> },
              { key: 'actions', title: 'Aksi', width: 170, className: 'text-center', headerClassName: 'text-center', render: (role) => (
                <div className="table-actions d-inline-flex gap-2">
                  <CButton color="info" variant="outline" size="sm" onClick={() => openDetail(role)} title="Detail role" aria-label={`Detail ${role.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </CButton>
                  <CButton color="primary" variant="outline" size="sm" onClick={() => openEdit(role)} title="Edit role" aria-label={`Edit ${role.name}`}><CIcon icon={cilPencil} size="sm" /></CButton>
                  <CButton color="danger" variant="outline" size="sm" disabled={String(role.name || '').trim().toUpperCase() === 'SUPER ADMIN'} onClick={() => handleDelete(role)} title="Hapus role" aria-label={`Hapus ${role.name}`}><CIcon icon={cilTrash} size="sm" /></CButton>
                </div>
              ) },
            ]}
            rows={roles}
            rowKey="id"
            loading={loading}
            emptyMessage="Data role tidak ditemukan."
            hover
            responsive
            className="role-table"
          /> </CTable>

          <GlobalPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      <ConfirmModal
        visible={Boolean(roleToDelete)}
        title="Konfirmasi Hapus Role"
        message={
          roleToDelete
            ? `Yakin ingin menghapus role "${roleToDelete.name}"?`
            : ''
        }
        confirmText="Hapus"
        cancelText="Batal"
        color="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </MasterPageLayout>
  )
}

export default RoleListPage} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilPlus,
  cilSearch,
  cilTrash,
  cilReload,
} from '@coreui/icons'

import ConfirmModal from '../../../components/ConfirmModal'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import { apiBase } from '../../../../services/api'

const RoleListPage = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.notice) {
      return
    }

    setNotice(location.state.notice)

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [location, navigate])

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

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '10',
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (statusFilter !== '') {
        params.set('is_active', statusFilter)
      }

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
  }, [page, search, statusFilter, request])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const openCreate = () => {
    navigate('/roles/form')
  }

  const openEdit = (role) => {
    navigate(`/roles/form/${role.id}`)
  }

  const openDetail = (role) => {
    navigate(`/roles/detail/${role.id}`)
  }

  const handleDelete = (role) => {
    const roleName = String(role.name || '').trim().toUpperCase()

    if (roleName === 'SUPER ADMIN') {
      setError('Role Super Admin tidak dapat dihapus.')
      return
    }

    setRoleToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) {
      return
    }

    setDeleting(true)
    setError('')
    setNotice('')

    try {
      await request(`/roles/${roleToDelete.id}`, {
        method: 'DELETE',
      })

      setNotice('Role berhasil dihapus.')
      setRoleToDelete(null)

      await loadRoles()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus role.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setRoleToDelete(null)
  }

  const perPage = 10

  const applySearch = () => {
    const nextSearch = searchInput.trim()

    setPage(1)

    if (nextSearch === search) {
      loadRoles()
      return
    }

    setSearch(nextSearch)
  }

  const resetSearch = () => {
    setSearchInput('')
    setStatusFilter('')

    if (search === '' && statusFilter === '' && page === 1) {
      loadRoles()
      return
    }

    setSearch('')
    setPage(1)
  }

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      applySearch()
    }
  }

  return (
    <MasterPageLayout
      title="Management Role"
      className="role-list-page"
      notice={notice}
      error={error}
      onClearNotice={() => setNotice('')}
      onClearError={() => setError('')}
    >


      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong className="fs-5">Daftar Role</strong>
          </div>

          <CButton
            color="primary"
            size="sm"
            className="role-compact-button"
            onClick={openCreate}
          >
            <CIcon icon={cilPlus} size="sm" className="me-1" />
            Tambah Role
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CRow className="mb-3">
            <CCol xs={12}>
              <div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100">
                <CFormInput
                  placeholder="Cari nama role"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Cari role"
                  className="flex-grow-1"
                />

                <CFormSelect
                  aria-label="Filter status role"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  style={{ maxWidth: '160px' }}
                  options={[
                    { label: 'Semua Status', value: '' },
                    { label: 'Aktif', value: '1' },
                    { label: 'Nonaktif', value: '0' },
                  ]}
                />

                <CButton
                  color="primary"
                  size="sm"
                  aria-label="Cari"
                  title="Cari"
                  className="role-search-button role-compact-button"
                  onClick={applySearch}
                >
                  <CIcon icon={cilSearch} size="sm" />
                  Cari
                </CButton>

                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  aria-label="Reset filter"
                  title="Reset filter"
                  className="role-reset-button role-compact-button"
                  onClick={resetSearch}
                >
                  <CIcon icon={cilReload} size="sm" />
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>

          <GlobalTable
            columns={[
              { key: 'number', title: 'No.', width: 60, render: (_role, index) => (pagination.current_page - 1) * perPage + index + 1 },
              { key: 'name', title: 'Nama Role', render: (role) => <div className="fw-semibold">{role.name}</div> },
              { key: 'permissions_count', title: 'Jumlah Hak Akses', className: 'text-center', headerClassName: 'text-center', render: (role) => role.permissions_count ?? 0 },
              { key: 'status', title: 'Status', render: (role) => <CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge> },
              { key: 'actions', title: 'Aksi', width: 170, className: 'text-center', headerClassName: 'text-center', render: (role) => (
                <div className="table-actions d-inline-flex gap-2">
                  <CButton color="info" variant="outline" size="sm" onClick={() => openDetail(role)} title="Detail role" aria-label={`Detail ${role.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </CButton>
                  <CButton color="primary" variant="outline" size="sm" onClick={() => openEdit(role)} title="Edit role" aria-label={`Edit ${role.name}`}><CIcon icon={cilPencil} size="sm" /></CButton>
                  <CButton color="danger" variant="outline" size="sm" disabled={String(role.name || '').trim().toUpperCase() === 'SUPER ADMIN'} onClick={() => handleDelete(role)} title="Hapus role" aria-label={`Hapus ${role.name}`}><CIcon icon={cilTrash} size="sm" /></CButton>
                </div>
              ) },
            ]}
            rows={roles}
            rowKey="id"
            loading={loading}
            emptyMessage="Data role tidak ditemukan."
            hover
            responsive
            className="role-table"
          /> </CTable>

          <GlobalPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      <ConfirmModal
        visible={Boolean(roleToDelete)}
        title="Konfirmasi Hapus Role"
        message={
          roleToDelete
            ? `Yakin ingin menghapus role "${roleToDelete.name}"?`
            : ''
        }
        confirmText="Hapus"
        cancelText="Batal"
        color="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </MasterPageLayout>
  )
}

export default RoleListPage
