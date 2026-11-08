import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
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

// Deduplicate in-flight GET requests across React StrictMode effect remounts.
const pendingAccessGetRequests = new Map()

const PosisiListPage = () => {
  const [roles, setPosisis] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
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
  const [roleToDelete, setPosisiToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const request = useCallback((path, options = {}) => {
    const requestOptions = options
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

  const loadPosisis = useCallback(async () => {
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

      setPosisis(payload.data || [])
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      })
    } catch (loadError) {
      setError(loadError.message || 'Gagal memuat data peran.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, request])

  useEffect(() => {
    loadPosisis()
  }, [loadPosisis])

  const openCreate = async () => {
    const listPath = await getAccessFeaturePath(['Management Position', 'Manajemen Posisi', 'Manajemen Posisi'])
    if (listPath) navigate(`${listPath}/form`)
    else setError('Path Manajemen Posisi belum terdaftar di database.')
  }

  const openEdit = async (role) => {
    const listPath = await getAccessFeaturePath(['Management Position', 'Manajemen Posisi', 'Manajemen Posisi'])
    if (listPath) navigate(`${listPath}/form/${role.roleId}`)
    else setError('Path Manajemen Posisi belum terdaftar di database.')
  }

  const openDetail = async (role) => {
    const listPath = await getAccessFeaturePath(['Management Position', 'Manajemen Posisi', 'Manajemen Posisi'])
    if (listPath) navigate(`${listPath}/detail/${role.roleId}`)
    else setError('Path Manajemen Posisi belum terdaftar di database.')
  }

  const handleDelete = (role) => {
    const roleName = String(role.name || '').trim().toUpperCase()

    if (roleName === 'SUPER ADMIN') {
      setError('Posisi Super Admin tidak dapat dihapus.')
      return
    }

    setDeleteError('')
    setPosisiToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) {
      return
    }

    setDeleting(true)
    setError('')
    setNotice('')
    setDeleteError('')

    try {
      await request(`/roles/${roleToDelete.roleId}`, {
        method: 'DELETE',
      })

      setNotice('Posisi berhasil dihapus.')
      setPosisiToDelete(null)

      await loadPosisis()
    } catch (requestError) {
      setDeleteError(requestError.message || 'Gagal menghapus posisi.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteError('')
    setPosisiToDelete(null)
  }

  const perPage = 10

  const applySearch = () => {
    const nextSearch = searchInput.trim()

    setPage(1)

    if (nextSearch === search) {
      loadPosisis()
      return
    }

    setSearch(nextSearch)
    setStatusFilter(statusInput)
  }

  const resetSearch = () => {
    setSearchInput('')
    setStatusInput('')
    setStatusFilter('')

    if (search === '' && statusFilter === '' && page === 1) {
      loadPosisis()
      return
    }

    setSearch('')
    setPage(1)
  }

  const handleStatusChange = (event) => {
    setStatusInput(event.target.value)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <MasterPageLayout
      title="Manajemen Posisi"
      className="role-list-page"
      notice={notice}
      error={error}
      onClearNotice={() => setNotice('')}
      onClearError={() => setError('')}
    >


      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong className="fs-5">Daftar Posisi</strong>
          </div>

          <CButton
            color="primary"
            size="sm"
            className="role-compact-button"
            onClick={openCreate}
          >
            <CIcon icon={cilPlus} size="sm" className="me-1" />
            Tambah Posisi
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CRow className="mb-3">
            <CCol xs={12}>
              <div className="d-flex flex-column gap-2 w-100">
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100">
                  <CFormInput
                    placeholder="Cari nama posisi"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    aria-label="Cari posisi"
                    className="flex-grow-1 w-auto"
                    style={{ minWidth: 0 }}
                  />

                  <CFormSelect
                    aria-label="Filter status posisi"
                    value={statusInput}
                    onChange={handleStatusChange}
                    style={{ width: '160px', maxWidth: '160px' }}
                    options={[
                      { label: 'Semua Status', value: '' },
                      { label: 'Aktif', value: '1' },
                      { label: 'Nonaktif', value: '0' },
                    ]}
                  />
                </div>

                <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 pb-3 border-bottom">
                  <CButton
                    color="primary"
                    size="sm"
                    aria-label="Cari"
                    title="Cari"
                    className="role-search-button role-compact-button"
                    onClick={applySearch}
                  >
                    <CIcon icon={cilSearch} size="sm" className="me-1" />
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
                    <CIcon icon={cilReload} size="sm" className="me-1" />
                    Reset
                  </CButton>
                </div>
              </div>
            </CCol>
          </CRow>

          <GlobalTable
            columns={[
              { key: 'number', title: 'No.', width: 60, render: (_role, index) => (pagination.current_page - 1) * perPage + index + 1 },
              { key: 'name', title: 'Nama Posisi', render: (role) => <div className="fw-semibold">{role.name}</div> },
              { key: 'permissions_count', title: 'Jumlah Hak Akses', className: 'text-center', headerClassName: 'text-center', render: (role) => {
                const permissionCount = role.permissions_count ?? role.features_count ?? role.role_permissions_count ?? (Array.isArray(role.features) ? role.features.length : null) ?? (Array.isArray(role.permissions) ? role.permissions.length : null)
                return permissionCount ?? 0
              } },
              { key: 'status', title: 'Status', render: (role) => { const isActive = getPosisiActiveStatus(role); return <CBadge color={isActive ? 'success' : 'secondary'}>{isActive ? 'Aktif' : 'Nonaktif'}</CBadge> } },
              { key: 'actions', title: 'Aksi', width: 170, className: 'text-center', headerClassName: 'text-center', render: (role) => (
                <div className="table-actions d-inline-flex gap-2">
                  <CButton color="info" variant="outline" size="sm" onClick={() => openDetail(role)} title="Detail peran" aria-label={`Detail ${role.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </CButton>
                  <CButton color="primary" variant="outline" size="sm" onClick={() => openEdit(role)} title="Edit peran" aria-label={`Edit ${role.name}`}><CIcon icon={cilPencil} size="sm" /></CButton>
                  <CButton color="danger" variant="outline" size="sm" disabled={String(role.name || '').trim().toUpperCase() === 'SUPER ADMIN'} onClick={() => handleDelete(role)} title="Hapus peran" aria-label={`Hapus ${role.name}`}><CIcon icon={cilTrash} size="sm" /></CButton>
                </div>
              ) },
            ]}
            rows={roles}
            rowKey="id"
            loading={loading}
            emptyMessage="Data peran tidak ditemukan."
            hover
            responsive
            className="role-table"
          />

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
        title="Konfirmasi Hapus Posisi"
        message={
          <>
            {deleteError && <CAlert color="danger" className="mb-3">{deleteError}</CAlert>}
            {roleToDelete ? `Yakin ingin menghapus posisi "${roleToDelete.name}"?` : ''}
          </>
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

export default PosisiListPage
