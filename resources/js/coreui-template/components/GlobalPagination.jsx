import React from 'react'
import { CButton, CFormSelect } from '@coreui/react'

const GlobalPagination = ({ currentPage = 1, lastPage = 1, total = 0, perPage = 10, onPageChange, onPerPageChange, loading = false, showPageSize = false }) => {
  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, total)

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <small className="text-body-secondary">Menampilkan {start}–{end} dari {total} data</small>
        {showPageSize && onPerPageChange && (
          <CFormSelect aria-label="Jumlah data per halaman" size="sm" value={String(perPage)} onChange={(event) => onPerPageChange(Number(event.target.value))} style={{ width: 'auto', minWidth: '84px' }} options={[10, 25, 50, 100].map((size) => ({ label: size + ' / halaman', value: String(size) }))} />
        )}
      </div>
      <div className="d-flex gap-2">
        <CButton color="secondary" variant="outline" size="sm" disabled={currentPage <= 1 || loading} onClick={() => onPageChange(currentPage - 1)}>Sebelumnya</CButton>
        <small className="d-flex align-items-center text-body-secondary px-1">Halaman {currentPage} dari {Math.max(lastPage, 1)}</small>
        <CButton color="secondary" variant="outline" size="sm" disabled={currentPage >= lastPage || loading} onClick={() => onPageChange(currentPage + 1)}>Berikutnya</CButton>
      </div>
    </div>
  )
}

export default GlobalPagination
