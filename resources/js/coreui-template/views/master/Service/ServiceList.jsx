import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormSelect, CNav, CNavItem, CNavLink, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilReload } from '@coreui/icons'
import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'

const serviceTypes = ['Semua', 'Cuci', 'Setrika', 'Dry Clean']

const sampleRows = [
  { serviceId: '1', name: 'Cuci Reguler', type: 'Cuci', unit: 'Kg', duration: '2 Hari', prices: [{ outlet: 'Gresik', price: 7000 }, { outlet: 'Nganjuk', price: 8000 }, { outlet: 'Surabaya', price: 9000 }], isActive: true },
  { serviceId: '2', name: 'Cuci Express', type: 'Cuci', unit: 'Kg', duration: '1 Hari', prices: [{ outlet: 'Gresik', price: 12000 }, { outlet: 'Nganjuk', price: 13000 }, { outlet: 'Surabaya', price: 14000 }], isActive: true },
  { serviceId: '3', name: 'Cuci Bed Cover', type: 'Cuci', unit: 'Pcs', duration: '3 Hari', prices: [{ outlet: 'Gresik', price: 25000 }, { outlet: 'Nganjuk', price: 27000 }, { outlet: 'Surabaya', price: 30000 }], isActive: true },
  { serviceId: '4', name: 'Cuci Sepatu', type: 'Cuci', unit: 'Pasang', duration: '3 Hari', prices: [{ outlet: 'Gresik', price: 35000 }, { outlet: 'Nganjuk', price: 35000 }, { outlet: 'Surabaya', price: 40000 }], isActive: false },
  { serviceId: '5', name: 'Setrika Reguler', type: 'Setrika', unit: 'Kg', duration: '1 Hari', prices: [{ outlet: 'Gresik', price: 5000 }, { outlet: 'Nganjuk', price: 5500 }, { outlet: 'Surabaya', price: 6000 }], isActive: true },
  { serviceId: '6', name: 'Setrika Express', type: 'Setrika', unit: 'Kg', duration: '6 Jam', prices: [{ outlet: 'Gresik', price: 9000 }, { outlet: 'Nganjuk', price: 10000 }, { outlet: 'Surabaya', price: 11000 }], isActive: true },
  { serviceId: '7', name: 'Dry Clean Jas', type: 'Dry Clean', unit: 'Pcs', duration: '3 Hari', prices: [{ outlet: 'Gresik', price: 45000 }, { outlet: 'Nganjuk', price: 48000 }, { outlet: 'Surabaya', price: 50000 }], isActive: true },
]

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

const ServiceList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeType, setActiveType] = useState(location.state?.activeType || 'Semua')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState(location.state?.notice || '')

  const filteredRows = useMemo(() => sampleRows.filter((row) => {
    const matchesType = activeType === 'Semua' || row.type === activeType
    const matchesSearch = !search || row.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === '' || String(Number(row.isActive)) === status
    return matchesType && matchesSearch && matchesStatus
  }), [activeType, search, status])

  const pageSize = 10
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)
  const pagination = { current_page: page, last_page: Math.max(1, Math.ceil(filteredRows.length / pageSize)), total: filteredRows.length }

  const applySearch = () => { setSearch(searchInput.trim()); setStatus(statusInput); setPage(1) }
  const resetSearch = () => { setSearchInput(''); setSearch(''); setStatusInput(''); setStatus(''); setPage(1) }

  const columns = [
    { key: 'number', title: 'No.', width: 60, render: (_row, index) => (page - 1) * pageSize + index + 1 },
    { key: 'name', title: 'Nama Layanan', render: (row) => <div><div className="fw-semibold">{row.name}</div><small className="text-body-secondary">{row.type}</small></div> },
    { key: 'unit', title: 'Satuan', width: 90, render: (row) => row.unit },
    { key: 'duration', title: 'Estimasi', width: 110, render: (row) => row.duration },
    { key: 'prices', title: 'Harga per Outlet', render: (row) => <div className="d-flex flex-column gap-1">{row.prices.map((item) => <div key={item.outlet} className="d-flex justify-content-between gap-3"><span className="text-body-secondary">{item.outlet}</span><span className="fw-semibold text-nowrap">{formatRupiah(item.price)}</span></div>)}</div> },
    { key: 'status', title: 'Status', width: 100, render: (row) => <CBadge color={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Aktif' : 'Nonaktif'}</CBadge> },
    { key: 'actions', title: 'Aksi', width: 90, className: 'text-center', headerClassName: 'text-center', render: (row) => <CButton color="primary" variant="outline" size="sm" onClick={() => navigate(`/services/form/${row.serviceId}`, { state: { service: row } })} title="Ubah layanan"> <CIcon icon={cilPencil} /> </CButton> },
  ]

  return (
    <MasterPageLayout title="Master Layanan" className="role-list-page" notice={notice} onClearNotice={() => setNotice('')}>
      <div className="role-list-page">
        <CCard className="role-panel role-list-panel mb-4">
          <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div><strong className="fs-5">Daftar Layanan</strong><div className="small text-body-secondary mt-1">Kelola layanan dan harga pada setiap outlet.</div></div>
            <CButton color="primary" size="sm" className="role-compact-button" onClick={() => navigate('/services/form', { state: { serviceType: activeType === 'Semua' ? '' : activeType } })}><CIcon icon={cilPlus} className="me-1" />Tambah Layanan</CButton>
          </CCardHeader>
          <CCardBody>
            <div className="border-bottom mb-3">
              <CNav variant="underline" className="flex-nowrap overflow-auto" aria-label="Filter jenis layanan">
                {serviceTypes.map((type) => <CNavItem key={type}><CNavLink href="#" active={activeType === type} onClick={(event) => { event.preventDefault(); setActiveType(type); setPage(1) }} className="px-3 py-3 text-nowrap">{type}</CNavLink></CNavItem>)}
              </CNav>
            </div>
            <CRow className="mb-3"><CCol xs={12}>
              <div className="d-flex flex-column gap-2 w-100">
                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100">
                  <CFormInput className="flex-grow-1 w-auto" placeholder="Cari nama layanan" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), applySearch())} />
                  <CFormSelect style={{ maxWidth: 160 }} value={statusInput} onChange={(event) => setStatusInput(event.target.value)} options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]} />
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2 pb-3 border-bottom">
                  <CButton color="primary" size="sm" className="role-search-button role-compact-button" onClick={applySearch}><CIcon icon={cilSearch} className="me-1" />Cari</CButton>
                  <CButton color="secondary" variant="outline" size="sm" className="role-reset-button role-compact-button" onClick={resetSearch}><CIcon icon={cilReload} className="me-1" />Reset</CButton>
                </div>
              </div>
            </CCol></CRow>
            <GlobalTable columns={columns} rows={pageRows} rowKey="serviceId" loading={false} emptyMessage="Data layanan belum tersedia." hover responsive className="role-table" />
            <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={pageSize} onPageChange={setPage} loading={false} />
          </CCardBody>
        </CCard>
      </div>
    </MasterPageLayout>
  )
}

export default ServiceList
