import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilReload, cilTrash } from '@coreui/icons'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'
import ConfirmModal from '../../../components/ConfirmModal'
import { apiBase } from '../../../../services/api'

const OutletList = () => {
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
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options, credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.errors ? Object.values(payload.errors).flat().join(' ') : payload.message || 'Permintaan gagal.')
    return payload
  }, [])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search) params.set('search', search)
      if (status !== '') params.set('isActive', status)
      const payload = await request(`/outlets?${params}`)
      setRows(payload.data || [])
      setPagination({ current_page: payload.current_page || 1, last_page: payload.last_page || 1, total: payload.total || 0 })
    } catch (e) { setError(e.message || 'Gagal memuat outlet.') } finally { setLoading(false) }
  }, [page, search, status, request])

  useEffect(() => { load() }, [load])

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
      await request(`/outlets/${target.outletId}`, { method: 'DELETE' })
      setTarget(null); setNotice('Outlet berhasil dihapus.'); await load()
    } catch (e) { setError(e.message || 'Gagal menghapus outlet.') } finally { setDeleting(false) }
  }

  const columns = [
    { key: 'number', title: 'No.', width: 60, render: (_row, index) => (pagination.current_page - 1) * 10 + index + 1 },
    { key: 'code', title: 'Kode Outlet', render: (row) => <span className="fw-semibold">{row.code}</span> },
    { key: 'name', title: 'Nama Outlet', render: (row) => <div><div className="fw-semibold">{row.name}</div>{row.isPrimary && <CBadge color="info">Outlet Utama</CBadge>}</div> },
    { key: 'whatsapp', title: 'WhatsApp', render: (row) => row.whatsapp || '—' },
    { key: 'hours', title: 'Jam Operasional', render: (row) => row.openingTime && row.closingTime ? `${String(row.openingTime).slice(0,5)} - ${String(row.closingTime).slice(0,5)}` : '—' },
    { key: 'status', title: 'Status', render: (row) => <CBadge color={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Aktif' : 'Nonaktif'}</CBadge> },
    { key: 'actions', title: 'Aksi', width: 110, className: 'text-center', headerClassName: 'text-center', render: (row) => <div className="table-actions d-inline-flex gap-2"><CButton color="info" variant="outline" size="sm" onClick={() => navigate(`/outlets/detail/${row.outletId}`)} title="Detail outlet" aria-label={`Detail ${row.name}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg></CButton><CButton color="primary" variant="outline" size="sm" onClick={() => navigate(`/outlets/form/${row.outletId}`)} title="Edit outlet"><CIcon icon={cilPencil} /></CButton><CButton color="danger" variant="outline" size="sm" disabled={row.isPrimary} onClick={() => setTarget(row)} title="Hapus outlet"><CIcon icon={cilTrash} /></CButton></div> },
  ]

  return <MasterPageLayout title="Manajemen Outlet" className="role-list-page" notice={notice} error={error} onClearNotice={() => setNotice('')} onClearError={() => setError('')}>
    <div className="role-list-page">
    <CCard className="role-panel role-list-panel mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong className="fs-5">Daftar Outlet</strong><CButton color="primary" size="sm" className="role-compact-button" onClick={() => navigate('/outlets/form')}><CIcon icon={cilPlus} className="me-1" />Tambah Outlet</CButton></CCardHeader>
      <CCardBody>
        <CRow className="mb-3"><CCol xs={12}><div className="d-flex flex-column gap-2 w-100"><div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100"><CFormInput className="flex-grow-1 w-auto" placeholder="Cari kode, nama, atau alamat outlet" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), setSearch(searchInput.trim()), setStatus(statusInput))} /><CFormSelect style={{ maxWidth: 160 }} value={statusInput} onChange={e => setStatusInput(e.target.value)} options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]} /></div><div className="d-flex flex-wrap align-items-center gap-2 pb-3 border-bottom"><CButton color="primary" size="sm" className="role-search-button role-compact-button" onClick={() => { setPage(1); setSearch(searchInput.trim()); setStatus(statusInput) }}><CIcon icon={cilSearch} className="me-1" />Cari</CButton><CButton color="secondary" variant="outline" size="sm" className="role-reset-button role-compact-button" onClick={() => { setSearchInput(''); setSearch(''); setStatusInput(''); setStatus(''); setPage(1) }}><CIcon icon={cilReload} className="me-1" />Reset</CButton></div></div></CCol></CRow>
        <GlobalTable columns={columns} rows={rows} rowKey="outletId" loading={loading} emptyMessage="Data outlet belum tersedia." hover responsive className="role-table" />
        <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={10} onPageChange={setPage} loading={loading} />
      </CCardBody>
    </CCard>
    </div>
    <ConfirmModal visible={Boolean(target)} title="Konfirmasi Hapus Outlet" message={target ? `Yakin ingin menghapus outlet "${target.name}"?` : ''} confirmText="Hapus" cancelText="Batal" color="danger" loading={deleting} onConfirm={confirmDelete} onCancel={() => setTarget(null)} />
  </MasterPageLayout>
}
export default OutletList
