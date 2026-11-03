import React, { useMemo, useState } from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CFormInput, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilTrash } from '@coreui/icons'

const RoleList = ({ roles = [], loading, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => roles.filter((role) => `${role.name || ''} ${role.code || ''}`.toLowerCase().includes(search.toLowerCase().trim())), [roles, search])
  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong>List Role</strong><CButton color="primary" size="sm" onClick={onAdd}><CIcon icon={cilPlus} className="me-2" />Tambah Role</CButton></CCardHeader>
      <CCardBody>
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <div className="d-flex gap-2"><CFormInput size="sm" style={{ minWidth: '240px' }} placeholder="Cari nama atau kode role..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Cari role" /><CButton size="sm" color="secondary" variant="outline" aria-label="Cari"><CIcon icon={cilSearch} /></CButton></div>
        </div>
        <CTable hover responsive align="middle" small>
          <CTableHead><CTableRow><CTableHeaderCell>No.</CTableHeaderCell><CTableHeaderCell>Nama Role</CTableHeaderCell><CTableHeaderCell>Kode</CTableHeaderCell><CTableHeaderCell className="text-center">Jumlah Hak Akses</CTableHeaderCell><CTableHeaderCell>Status</CTableHeaderCell><CTableHeaderCell className="text-center">Aksi</CTableHeaderCell></CTableRow></CTableHead>
          <CTableBody>
            {loading ? <CTableRow><CTableDataCell colSpan={6} className="text-center py-4"><CSpinner size="sm" className="me-2" />Memuat data...</CTableDataCell></CTableRow>
              : filtered.length === 0 ? <CTableRow><CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">Data role tidak ditemukan.</CTableDataCell></CTableRow>
              : filtered.map((role, i) => <CTableRow key={role.id}><CTableDataCell>{i + 1}</CTableDataCell><CTableDataCell className="fw-semibold">{role.name}</CTableDataCell><CTableDataCell>{role.code}</CTableDataCell><CTableDataCell className="text-center">{role.permissions_count ?? 0}</CTableDataCell><CTableDataCell><CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CTableDataCell><CTableDataCell className="text-center"><div className="d-inline-flex gap-2"><CButton color="warning" variant="outline" size="sm" onClick={() => onEdit(role)} title="Edit"><CIcon icon={cilPencil} /></CButton><CButton color="danger" variant="outline" size="sm" disabled={role.code === 'SUPERADMIN'} onClick={() => onDelete(role)} title="Hapus"><CIcon icon={cilTrash} /></CButton></div></CTableDataCell></CTableRow>)}
          </CTableBody>
        </CTable>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-body-secondary">Menampilkan {filtered.length === 0 ? 0 : 1}–{filtered.length} dari {filtered.length} data</small>
        </div>
      </CCardBody>
    </CCard>
  )
}
export default RoleList
