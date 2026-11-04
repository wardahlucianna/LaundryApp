import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'

import { apiBase } from '../../../../services/api'

import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBasket,
  cilBuilding,
  cilCash,
  cilChartLine,
  cilFolderOpen,
  cilPeople,
  cilPencil,
  cilPlus,
  cilReload,
  cilSearch,
  cilSettings,
  cilSpeedometer,
  cilTags,
  cilTrash,
} from '@coreui/icons'

import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'

const GroupFeatureManagement = () => {
  const [groups, setGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const perPage = 10
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

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const payload = await request('/permission-groups?per_page=100')

      setGroups(payload.data || [])
    } catch (loadError) {
      setError(
        loadError.message || 'Gagal memuat data group feature.',
      )
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const filteredGroups = groups.filter((group) => {
    const keyword = search.trim().toLowerCase()
    const groupName = String(group.name || '').toLowerCase()
    const groupDescription = String(group.description || '').toLowerCase()

    const matchesSearch =
      !keyword ||
      groupName.includes(keyword) ||
      groupDescription.includes(keyword)

    const matchesStatus =
      statusFilter === '' ||
      String(Number(Boolean(group.is_active))) === statusFilter

    return matchesSearch && matchesStatus
  })

  const pagination = {
    current_page: page,
    last_page: Math.max(
      1,
      Math.ceil(filteredGroups.length / perPage),
    ),
    total: filteredGroups.length,
  }

  const paginatedGroups = filteredGroups.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  const openCreate = () => {
    navigate('/permission-groups/form')
  }

  const openEdit = (group) => {
    navigate(`/permission-groups/form/${group.id}`)
  }

  const openDetail = (group) => {
    navigate(`/permission-groups/detail/${group.id}`)
  }

  const deleteGroup = async (group) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus group "${group.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setNotice('')

    try {
      await request(`/permission-groups/${group.id}`, {
        method: 'DELETE',
      })

      setNotice('Group feature berhasil dihapus.')

      await loadGroups()
    } catch (deleteError) {
      setError(
        deleteError.message || 'Gagal menghapus group feature.',
      )
    }
  }

  const applySearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const resetSearch = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('')
    setPage(1)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <MasterPageLayout
      title="Management Group Feature"
      className="role-list-page"
    >
      {notice && (
        <CAlert
          color="success"
          dismissible
          onClose={() => setNotice('')}
        >
          {notice}
        </CAlert>
      )}

      {error && (
        <CAlert
          color="danger"
          dismissible
          onClose={() => setError('')}
        >
          {error}
        </CAlert>
      )}

      <GroupFeatureList
        groups={paginatedGroups}
        pagination={pagination}
        perPage={perPage}
        page={page}
        setPage={setPage}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        applySearch={applySearch}
        resetSearch={resetSearch}
        loading={loading}
        onCreate={openCreate}
        onDetail={openDetail}
        onEdit={openEdit}
        onDelete={deleteGroup}
      />
    </MasterPageLayout>
  )
}

export default GroupFeatureManagement

const groupIcons = {
  cilFolderOpen,
  cilPeople,
  cilBasket,
  cilCash,
  cilSettings,
  cilChartLine,
  cilSpeedometer,
  cilBuilding,
  cilTags,
}

const GroupFeatureList = ({
  groups,
  pagination,
  perPage,
  page,
  setPage,
  searchInput,
  setSearchInput,
  statusFilter,
  setStatusFilter,
  applySearch,
  resetSearch,
  loading,
  onCreate,
  onDetail,
  onEdit,
  onDelete,
}) => {
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      applySearch()
    }
  }

  return (
    <CCard className="role-panel role-list-panel mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <strong className="fs-5">Daftar Group Feature</strong>

        <CButton
          color="primary"
          size="sm"
          className="role-compact-button"
          onClick={onCreate}
        >
          <CIcon icon={cilPlus} size="sm" className="me-1" />
          Tambah Group
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-3">
          <CCol xs={12}>
            <div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100">
              <CFormInput
                placeholder="Cari nama group"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Cari group feature"
                className="flex-grow-1"
              />

              <CFormSelect
                aria-label="Filter status group"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
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
                className="role-compact-button role-search-button"
                onClick={applySearch}
              >
                <CIcon icon={cilSearch} size="sm" className="me-1" />
                Cari
              </CButton>

              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                className="role-compact-button role-reset-button"
                onClick={resetSearch}
              >
                <CIcon icon={cilReload} size="sm" className="me-1" />
                Reset
              </CButton>
            </div>
          </CCol>
        </CRow>

        <GlobalTable
          columns={[
            { key: 'number', title: 'No.', width: 60, render: (_group, index) => (page - 1) * perPage + index + 1 },
            { key: 'icon', title: 'Icon', render: (group) => <CIcon icon={groupIcons[group.icon] || cilFolderOpen} size="xl" /> },
            { key: 'name', title: 'Nama Group', render: (group) => (
              <div>
                <div className="fw-semibold">{group.name}</div>
                <div className="small text-body-secondary d-flex align-items-center gap-2">
                  <span>Ordering: {group.ordering ?? 0}</span>
                  <CBadge color={group.is_active ? 'success' : 'secondary'}>{group.is_active ? 'Aktif' : 'Nonaktif'}</CBadge>
                </div>
              </div>
            ) },
            { key: 'features_count', title: 'Jumlah Fitur', className: 'text-center', headerClassName: 'text-center', render: (group) => group.features_count ?? 0 },
            { key: 'actions', title: 'Aksi', width: 150, className: 'text-center', headerClassName: 'text-center', render: (group) => (
              <div className="table-actions d-inline-flex gap-2">
                <CButton color="info" variant="outline" size="sm" onClick={() => onDetail(group)} title="Detail"><CIcon icon={cilFolderOpen} size="sm" /></CButton>
                <CButton color="primary" variant="outline" size="sm" onClick={() => onEdit(group)} title="Edit"><CIcon icon={cilPencil} size="sm" /></CButton>
                <CButton color="danger" variant="outline" size="sm" onClick={() => onDelete(group)} title="Hapus"><CIcon icon={cilTrash} size="sm" /></CButton>
              </div>
            ) },
          ]}
          rows={groups}
          rowKey="id"
          loading={loading}
          emptyMessage="Data group feature tidak ditemukan."
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
  )
}