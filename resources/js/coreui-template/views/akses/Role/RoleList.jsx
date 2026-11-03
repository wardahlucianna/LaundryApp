import React from 'react'
import {
  CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput,
  CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead,
  CTableHeaderCell, CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ConfirmModal from '../../../components/ConfirmModal'
import { cilInfo, cilPencil, cilPlus, cilSearch, cilTrash, cilReload } from '@coreui/icons'

const RoleList = ({ roles, searchInput, setSearchInput, search, setSearch, page, setPage, pagination, loading, loadRoles, onCreate, onDetail, onEdit, onDelete, roleToDelete, deleting, onConfirmDelete, onCancelDelete }) => {
  const perPage = 10
  const showingStart = pagination.total === 0 ? 0 : (pagination.current_page - 1) * perPage + 1
  const showingEnd = Math.min(pagination.current_page * perPage, pagination.total)
  const applySearch = () => { const nextSearch = searchInput.trim(); setPage(1); if (nextSearch === search) loadRoles(); else setSearch(nextSearch) }
  const resetSearch = () => { setSearchInput(''); if (search === '' && page === 1) loadRoles(); else { setSearch(''); setPage(1) } }
  return <>
    <CCard className="role-panel role-list-panel mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><div><strong className="fs-5">Daftar Role</strong></div><CButton color="primary" size="sm" className="role-compact-button" onClick={onCreate}><CIcon icon={cilPlus} size="sm" className="me-1" />Tambah Role</CButton></CCardHeader>
      <CCardBody>
        <CRow className="mb-3"><CCol xs={12} md={8} lg={6}><div className="d-flex gap-2 w-100">
          <CFormInput placeholder="Cari nama atau kode" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applySearch() }} aria-label="Cari role" className="flex-grow-1" />
          <CButton color="primary" size="sm" aria-label="Cari" title="Cari" className="role-search-button role-compact-button" onClick={applySearch}><CIcon icon={cilSearch} size="sm" />Cari</CButton>
          <CButton color="secondary" variant="outline" size="sm" aria-label="Reset filter" title="Reset filter" className="role-reset-button role-compact-button" onClick={resetSearch}><CIcon icon={cilReload} size="sm" />Reset</CButton>
        </div></CCol></CRow>
        <CTable hover responsive align="middle" className="role-table"><CTableHead><CTableRow><CTableHeaderCell style={{ width: '60px' }}>No.</CTableHeaderCell><CTableHeaderCell>Nama Role</CTableHeaderCell><CTableHeaderCell className="text-center">Jumlah Hak Akses</CTableHeaderCell><CTableHeaderCell>Status</CTableHeaderCell><CTableHeaderCell className="text-center" style={{ width: '140px' }}>Aksi</CTableHeaderCell></CTableRow></CTableHead>
          <CTableBody>{loading ? <CTableRow><CTableDataCell colSpan={5} className="text-center py-4"><CSpinner size="sm" className="me-2" />Memuat data...</CTableDataCell></CTableRow> : roles.length === 0 ? <CTableRow><CTableDataCell colSpan={5} className="text-center text-body-secondary py-4">Data role tidak ditemukan.</CTableDataCell></CTableRow> : roles.map((role, index) => <CTableRow key={role.id}><CTableDataCell>{(pagination.current_page - 1) * perPage + index + 1}</CTableDataCell><CTableDataCell><div className="fw-semibold">{role.name}</div><small className="text-body-secondary">{role.code}</small></CTableDataCell><CTableDataCell className="text-center"><CButton color="link" size="sm" className="p-0 fw-semibold text-primary text-decoration-underline" style={{ color: 'var(--cui-primary)' }} onClick={() => onDetail(role)} title="Lihat detail hak akses" aria-label={`Lihat ${role.permissions_count ?? 0} hak akses untuk ${role.name}`}>{role.permissions_count ?? 0} hak akses</CButton></CTableDataCell><CTableDataCell><CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CTableDataCell><CTableDataCell className="text-center"><div className="d-inline-flex gap-2"><CButton color="primary" variant="outline" size="sm" onClick={() => onEdit(role)} title="Edit role" aria-label={`Edit ${role.name}`}><CIcon icon={cilPencil} size="sm" /></CButton><CButton color="danger" variant="outline" size="sm" disabled={role.code === 'SUPERADMIN'} onClick={() => onDelete(role)} title="Hapus role" aria-label={`Hapus ${role.name}`}><CIcon icon={cilTrash} size="sm" /></CButton></div></CTableDataCell></CTableRow>)}</CTableBody>
        </CTable>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2"><small className="text-body-secondary">Menampilkan {showingStart}–{showingEnd} dari {pagination.total} data</small><div className="d-flex gap-2"><CButton color="secondary" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Sebelumnya</CButton><CButton color="secondary" variant="outline" size="sm" disabled={page >= pagination.last_page || loading} onClick={() => setPage((current) => current + 1)}>Berikutnya</CButton></div></div>
      </CCardBody>
    </CCard>
    <ConfirmModal visible={Boolean(roleToDelete)} title="Konfirmasi Hapus Role" message={roleToDelete ? `Yakin ingin menghapus role "${roleToDelete.name}"?` : ''} confirmText="Hapus" cancelText="Batal" color="danger" loading={deleting} onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
  </>
}
export default RoleList
