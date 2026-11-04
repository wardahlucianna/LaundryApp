import React from 'react'
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

import GlobalPagination from '../../../components/GlobalPagination'

const FeatureList = ({
  features,
  groups,
  searchInput,
  setSearchInput,
  statusFilter,
  setStatusFilter,
  applySearch,
  resetSearch,
  pagination,
  loading,
  page,
  setPage,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const perPage = 10

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      applySearch()
    }
  }

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value)
  }

  const getGroupName = (feature) => {
    return (
      feature.group?.name ||
      groups.find(
        (group) => group.id === feature.permission_group_id,
      )?.name ||
      '—'
    )
  }

  return (
    <CCard className="role-panel role-list-panel mb-4">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <strong className="fs-5">Daftar Fitur</strong>

        <CButton
          color="primary"
          size="sm"
          className="role-compact-button"
          onClick={onCreate}
          disabled={groups.length === 0}
        >
          <CIcon icon={cilPlus} size="sm" className="me-1" />
          Tambah Fitur
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-3">
          <CCol xs={12}>
            <div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100">
              <CFormInput
                placeholder="Cari nama atau kelompok fitur"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Cari fitur"
                className="flex-grow-1"
              />

              <CFormSelect
                aria-label="Filter status fitur"
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

        <CTable hover responsive align="middle" className="role-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '60px' }}>
                No.
              </CTableHeaderCell>
              <CTableHeaderCell>Nama Fitur</CTableHeaderCell>
              <CTableHeaderCell>Kelompok</CTableHeaderCell>
              <CTableHeaderCell>Path</CTableHeaderCell>
              <CTableHeaderCell>Jenis Menu</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell
                className="text-center"
                style={{ width: '120px' }}
              >
                Aksi
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading ? (
              <CTableRow>
                <CTableDataCell
                  colSpan={7}
                  className="text-center py-4"
                >
                  <CSpinner size="sm" className="me-2" />
                  Memuat data...
                </CTableDataCell>
              </CTableRow>
            ) : features.length === 0 ? (
              <CTableRow>
                <CTableDataCell
                  colSpan={7}
                  className="text-center text-body-secondary py-4"
                >
                  Data fitur tidak ditemukan.
                </CTableDataCell>
              </CTableRow>
            ) : (
              features.map((feature, index) => (
                <CTableRow key={feature.id}>
                  <CTableDataCell>
                    {(pagination.current_page - 1) * perPage + index + 1}
                  </CTableDataCell>

                  <CTableDataCell>
                    <div className="fw-semibold">{feature.name}</div>
                    <small className="text-body-secondary">
                      Ordering: {feature.ordering ?? 0}
                    </small>
                  </CTableDataCell>

                  <CTableDataCell>
                    {getGroupName(feature)}
                  </CTableDataCell>

                  <CTableDataCell>
                    <small>{feature.path || '—'}</small>
                  </CTableDataCell>

                  <CTableDataCell>
                    {feature.menu_type === 'topbar'
                      ? 'Topbar'
                      : 'Sidebar'}
                  </CTableDataCell>

                  <CTableDataCell>
                    <CBadge
                      color={feature.is_active ? 'success' : 'secondary'}
                    >
                      {feature.is_active ? 'Aktif' : 'Nonaktif'}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <div className="table-actions d-inline-flex gap-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(feature)}
                        title="Edit fitur"
                        aria-label={`Edit ${feature.name}`}
                      >
                        <CIcon icon={cilPencil} size="sm" />
                      </CButton>

                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(feature)}
                        title="Hapus fitur"
                        aria-label={`Hapus ${feature.name}`}
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>

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

export default FeatureList
