import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilReload, cilTrash } from '@coreui/icons'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'
import ConfirmModal from '../../../components/ConfirmModal'
import apiClient, { getDeduped } from '../../../../services/api'

const UnitList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const request = useCallback(async (path, options = {}) => {
    const method = String(options.method || 'GET').toUpperCase()
    if (method === 'GET') {
      const { data } = await getDeduped(path)
      return data
    }
    const { data } = await apiClient({ url: path, method: method.toLowerCase(), data: options.body ? JSON.parse(options.body) : undefined })
    return data
  }, [])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search) params.set('search', search)
      if (status !== '') params.set('isActive', status)
      const payload = await request(`/units?${params}`)
      setRows(payload.data || [])
      setPagination({ current_page: payload.current_page || 1, last_page: payload.last_page || 1, total: payload.total || 0 })
    } catch (e) { setError(e.message || 'Gagal memuat satuan.') } finally { setLoading(false) }
  }, [page, search, status, request])

  useEffect(() => { load() }, [load])

  const applySearch = () => {
    const nextSearch = searchInput.trim()
    const nextStatus = statusInput
    if (nextSearch === search && nextStatus === status && page === 1) {
      load()
      return
    }
    setPage(1)
    setSearch(nextSearch)
    setStatus(nextStatus)
  }

  const resetSearch = () => {
    setSearchInput('')
    setStatusInput('')
    if (search === '' && status === '' && page === 1) {
      load()
      return
    }
    setSearch('')
    setStatus('')
    setPage(1)
  }

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await request(`/units/${target.unitId}`, { method: 'DELETE' })
      setTarget(null); setNotice('Satuan berhasil dihapus.'); await load()
    } catch (e) { setError(e.message || 'Gagal menghapus satuan.') } finally { setDeleting(false) }
  }

  const columns = [
    { key: 'number', title: 'No.', width: 60, render: (_row, index) => (pagination.current_page - 1) * 10 + index + 1 },
    { key: 'name', title: 'Nama Satuan', render: (row) => <span className="fw-semibold">{row.name}</span> },
    { key: 'symbol', title: 'Simbol', render: (row) => <CBadge color="info" shape="rounded-pill">{row.symbol}</CBadge> },
    { key: 'status', title: 'Status', render: (row) => <CBadge color={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Aktif' : 'Nonaktif'}</CBadge> },
    { key: 'actions', title: 'Aksi', width: 100, className: 'text-center', headerClassName: 'text-center', render: (row) => <div className="table-actions d-inline-flex gap-2"><CButton color="primary" variant="outline" size="sm" onClick={() => navigate(`/units/form/${row.unitId}`)} title="Ubah satuan" aria-label={`Ubah ${row.name}`}><CIcon icon={cilPencil} /></CButton><CButton color="danger" variant="outline" size="sm" onClick={() => setTarget(row)} title="Hapus satuan" aria-label={`Hapus ${row.name}`}><CIcon icon={cilTrash} /></CButton></div> },
  ]

  return <MasterPageLayout title="Master Satuan" className="role-list-page" notice={notice} error={error} onClearNotice={() => setNotice('')} onClearError={() => setError('')}>
    <div className="role-list-page">
      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <strong className="fs-5">Daftar Satuan</strong>
          <CButton color="primary" size="sm" className="role-compact-button" onClick={() => navigate('/units/form')}><CIcon icon={cilPlus} className="me-1" />Tambah Satuan</CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3"><CCol xs={12}>
            <div className="d-flex flex-column gap-2 w-100">
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100">
                <CFormInput className="flex-grow-1 w-auto" placeholder="Cari nama atau simbol satuan" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applySearch())} />
                <CFormSelect style={{ maxWidth: 160 }} value={statusInput} onChange={e => setStatusInput(e.target.value)} options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]} />
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 pb-3 border-bottom">
                <CButton color="primary" size="sm" className="role-search-button role-compact-button" onClick={applySearch}><CIcon icon={cilSearch} className="me-1" />Cari</CButton>
                <CButton color="secondary" variant="outline" size="sm" className="role-reset-button role-compact-button" onClick={resetSearch}><CIcon icon={cilReload} className="me-1" />Reset</CButton>
              </div>
            </div>
          </CCol></CRow>
          <GlobalTable columns={columns} rows={rows} rowKey="unitId" loading={loading} emptyMessage="Data satuan belum tersedia." hover responsive className="role-table" />
          <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={10} onPageChange={setPage} loading={loading} />
        </CCardBody>
      </CCard>
    </div>
    <ConfirmModal visible={Boolean(target)} title="Konfirmasi Hapus Satuan" message={target ? `Yakin ingin menghapus satuan "${target.name}"?` : ''} confirmText="Hapus" cancelText="Batal" color="danger" loading={deleting} onConfirm={confirmDelete} onCancel={() => setTarget(null)} />
  </MasterPageLayout>
}

export default UnitList
