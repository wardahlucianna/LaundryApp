import React from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilTrash, cilReload, cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags } from '@coreui/icons'

const groupIcons = { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags }

const GroupFeatureList = ({ groups, searchInput, setSearchInput, statusFilter, setStatusFilter, applySearch, resetSearch, loading, onCreate, onDetail, onEdit, onDelete }) => (
  <CCard className="role-panel role-list-panel mb-4">
    <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <strong className="fs-5">Daftar Group Feature</strong>
      <CButton color="primary" size="sm" className="role-compact-button" onClick={onCreate}><CIcon icon={cilPlus} size="sm" className="me-1" />Tambah Group</CButton>
    </CCardHeader>
    <CCardBody>
      <CRow className="mb-3"><CCol xs={12}><div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100">
        <CFormInput placeholder="Cari nama atau deskripsi group" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applySearch() }} aria-label="Cari group feature" className="flex-grow-1" />
        <CFormSelect aria-label="Filter status group" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: '160px' }} options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]} />
        <CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applySearch}><CIcon icon={cilSearch} size="sm" className="me-1" />Cari</CButton>
        <CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetSearch}><CIcon icon={cilReload} size="sm" className="me-1" />Reset</CButton>
      </div></CCol></CRow>
      <CTable hover responsive align="middle" className="role-table">
        <CTableHead><CTableRow><CTableHeaderCell style={{ width: 60 }}>No.</CTableHeaderCell><CTableHeaderCell>Icon</CTableHeaderCell><CTableHeaderCell>Nama Group</CTableHeaderCell><CTableHeaderCell>Deskripsi</CTableHeaderCell><CTableHeaderCell className="text-center">Jumlah Fitur</CTableHeaderCell><CTableHeaderCell>Status</CTableHeaderCell><CTableHeaderCell className="text-center" style={{ width: 150 }}>Aksi</CTableHeaderCell></CTableRow></CTableHead>
        <CTableBody>
          {loading ? <CTableRow><CTableDataCell colSpan={7} className="text-center py-4"><CSpinner size="sm" className="me-2" />Memuat data...</CTableDataCell></CTableRow>
            : groups.length === 0 ? <CTableRow><CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">Data group feature tidak ditemukan.</CTableDataCell></CTableRow>
              : groups.map((group, index) => <CTableRow key={group.id}><CTableDataCell>{index + 1}</CTableDataCell><CTableDataCell><CIcon icon={groupIcons[group.icon] || cilFolderOpen} size="xl" /></CTableDataCell><CTableDataCell><div className="fw-semibold">{group.name}</div></CTableDataCell><CTableDataCell>{group.description || '—'}</CTableDataCell><CTableDataCell className="text-center">{group.features_count ?? 0}</CTableDataCell><CTableDataCell><CBadge color={group.is_active ? 'success' : 'secondary'}>{group.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CTableDataCell><CTableDataCell className="text-center"><div className="table-actions d-inline-flex gap-2"><CButton color="info" variant="outline" size="sm" onClick={() => onDetail(group)} title="Detail"><CIcon icon={cilFolderOpen} size="sm" /></CButton><CButton color="primary" variant="outline" size="sm" onClick={() => onEdit(group)} title="Edit"><CIcon icon={cilPencil} size="sm" /></CButton><CButton color="danger" variant="outline" size="sm" onClick={() => onDelete(group)} title="Hapus"><CIcon icon={cilTrash} size="sm" /></CButton></div></CTableDataCell></CTableRow>)}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)
export default GroupFeatureList
