import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CBadge, CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import CIkon from '@coreui/icons-react'
import { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags, cilPencil, cilPlus, cilReload, cilSearch, cilTrash } from '@coreui/icons'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'
import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'

const groupIkons = { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags }
const groupNames = ['Manajemen Kelompok Fitur', 'Manajemen Group Fitur', 'Manajemen Kelompok Fitur', 'Group Feature', 'Feature Group']

const GroupFeatureList = () => {
  const [groups, setGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const perPage = 10

  useEffect(() => {
    if (!location.state?.notice) return
    setNotice(location.state.notice)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [location, navigate])

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  const loadGroups = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const payload = await request('/permission-groups?per_page=100')
      setGroups(payload.data || [])
    } catch (loadError) {
      setError(loadError.message || 'Gagal memuat kelompok fitur.')
    } finally { setLoading(false) }
  }, [request])
  useEffect(() => { loadGroups() }, [loadGroups])

  const filteredGroups = groups.filter((group) => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch = !keyword || String(group.name || '').toLowerCase().includes(keyword) || String(group.description || '').toLowerCase().includes(keyword)
    const matchesStatus = statusFilter === '' || String(Number(Boolean(group.is_active))) === statusFilter
    return matchesSearch && matchesStatus
  })
  const pagination = { current_page: page, last_page: Math.max(1, Math.ceil(filteredGroups.length / perPage)), total: filteredGroups.length }
  const rows = filteredGroups.slice((page - 1) * perPage, page * perPage)

  const goTo = async (suffix = '') => {
    try {
      const basePath = await getAccessFeaturePath(groupNames)
      if (basePath) navigate(`${basePath}${suffix}`)
      else setError('Path Manajemen Kelompok Fitur belum terdaftar di database.')
    } catch (navigationError) { setError(navigationError.message || 'Gagal membaca path menu dari database.') }
  }
  const deleteGroup = (group) => { setDeleteError(''); setDeleteTarget(group) }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(''); setNotice(''); setDeleteError('')
    try {
      await request(`/permission-groups/${deleteTarget.id}`, { method: 'DELETE' })
      window.dispatchEvent(new Event('sunrise:permissions-updated'))
      setNotice('Kelompok fitur berhasil dihapus.')
      await loadGroups()
      setDeleteTarget(null)
    } catch (deleteRequestError) { setDeleteError(deleteRequestError.message || 'Gagal menghapus kelompok fitur.') }
    finally { setDeleting(false) }
  }
  const applySearch = () => { setPage(1); setSearch(searchInput.trim()) }
  const resetSearch = () => { setSearchInput(''); setSearch(''); setStatusFilter(''); setPage(1) }

  const columns = [
    { key: 'number', title: 'No.', width: '60px', render: (_group, index) => (page - 1) * perPage + index + 1 },
    { key: 'icon', title: 'Ikon', render: (group) => <CIkon icon={groupIkons[group.icon] || cilFolderOpen} size="xl" /> },
    { key: 'name', title: 'Nama Kelompok', render: (group) => <div><div className="fw-semibold">{group.name}</div><div className="small text-body-secondary d-flex align-items-center gap-2"><span>Urutan: {group.ordering ?? 0}</span><CBadge color={group.is_active ? 'success' : 'secondary'}>{group.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></div></div> },
    { key: 'features_count', title: 'Jumlah Fitur', className: 'text-center', headerClassName: 'text-center', render: (group) => group.features_count ?? 0 },
    { key: 'actions', title: 'Aksi', width: '100px', className: 'text-center', headerClassName: 'text-center', render: (group) => <div className="table-actions d-inline-flex gap-2"><CButton color="primary" variant="outline" size="sm" onClick={() => goTo(`/form/${group.id}`)} title="Edit"><CIkon icon={cilPencil} size="sm" /></CButton><CButton color="danger" variant="outline" size="sm" onClick={() => deleteGroup(group)} title="Hapus"><CIkon icon={cilTrash} size="sm" /></CButton></div> },
  ]

  return (
    <MasterPageLayout title="Manajemen Kelompok Fitur" className="role-list-page" notice={notice} error={error} onClearNotice={() => setNotice('')} onClearError={() => setError('')}>
      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong className="fs-5">Daftar Kelompok Fitur</strong><CButton color="primary" size="sm" className="role-compact-button" onClick={() => goTo('/form')}><CIkon icon={cilPlus} size="sm" className="me-1" />Tambah Kelompok Fitur</CButton></CCardHeader>
        <CCardBody>
          <CRow className="mb-3"><CCol xs={12}>
            <div className="d-flex flex-column gap-2 w-100">
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100">
                <CFormInput placeholder="Cari nama kelompok fitur" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applySearch()} aria-label="Cari kelompok fitur" className="flex-grow-1 w-auto" style={{ minWidth: 0 }} />
                <CFormSelect aria-label="Filter status kelompok fitur" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }} style={{ width: '160px', maxWidth: '160px' }} options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]} />
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 pb-3 border-bottom">
                <CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applySearch}><CIkon icon={cilSearch} size="sm" className="me-1" />Cari</CButton>
                <CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetSearch}><CIkon icon={cilReload} size="sm" className="me-1" />Reset</CButton>
              </div>
            </div>
          </CCol></CRow>
          <GlobalTable columns={columns} rows={rows} rowKey="id" loading={loading} emptyMessage="Data kelompok fitur tidak ditemukan." hover responsive className="role-table" />
          <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} loading={loading} />
        </CCardBody>
      </CCard>
      <CModal visible={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} alignment="center">
        <CModalHeader><strong>Konfirmasi Hapus</strong></CModalHeader>
        <CModalBody>
          {deleteError && <CAlert color="danger" className="mb-3" dismissible onClose={() => setDeleteError('')}><strong>Penghapusan gagal:</strong> {deleteError}</CAlert>}
          Apakah kamu yakin ingin menghapus kelompok fitur <strong>{deleteTarget?.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" size="sm" disabled={deleting} onClick={() => { setDeleteTarget(null); setDeleteError('') }}>Batal</CButton>
          <CButton color="danger" size="sm" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</CButton>
        </CModalFooter>
      </CModal>
    </MasterPageLayout>
  )
}
export default GroupFeatureList
