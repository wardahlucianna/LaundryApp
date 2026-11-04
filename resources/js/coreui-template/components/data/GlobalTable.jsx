import React from 'react'
import { CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react'

const GlobalTable = ({ columns = [], rows = [], rowKey = 'id', loading = false, emptyMessage = 'Data belum tersedia.', striped = false, hover = true, responsive = true, className = '' }) => (
  <CTable striped={striped} hover={hover} responsive={responsive} className={`global-table align-middle mb-0 ${className}`.trim()}>
    <CTableHead><CTableRow>
      {columns.map((column) => <CTableHeaderCell key={column.key || column.title} scope="col" className={column.headerClassName || ''} style={column.width ? { width: column.width } : undefined}>{column.title}</CTableHeaderCell>)}
    </CTableRow></CTableHead>
    <CTableBody>
      {loading ? <CTableRow><CTableDataCell colSpan={Math.max(columns.length, 1)} className="text-center text-body-secondary py-4">Memuat data...</CTableDataCell></CTableRow>
        : rows.length === 0 ? <CTableRow><CTableDataCell colSpan={Math.max(columns.length, 1)} className="text-center text-body-secondary py-4">{emptyMessage}</CTableDataCell></CTableRow>
        : rows.map((row, rowIndex) => <CTableRow key={row[rowKey] ?? rowIndex}>{columns.map((column) => <CTableDataCell key={column.key || column.title} className={column.className || ''}>{column.render ? column.render(row, rowIndex) : row[column.key]}</CTableDataCell>)}</CTableRow>)}
    </CTableBody>
  </CTable>
)

export default GlobalTable
