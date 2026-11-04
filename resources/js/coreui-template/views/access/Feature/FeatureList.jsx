import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilBuilding, cilCash, cilChartLine, cilFolderOpen, cilPeople, cilPencil, cilPlus, cilReload, cilSearch, cilSettings, cilSpeedometer, cilTags, cilTrash } from '@coreui/icons'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'
import { apiBase } from '../../../../services/api'

const FeatureListPage = () => {
  const [features, setFeatures] = useState([])
  const [groups, setGroups] = useState([])
  const [groupSearchInput, setGroupSearchInput] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [groupStatusFilter, setGroupStatusFilter] = useState('')
  const [groupPage, setGroupPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const perPage = 10
  const groupPerPage = 10

  useEffect(() => {
    if (!location.state?.notice) return
    setNotice(location.state.notice)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location, navigate])

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  const loadGroups = useCallback(async () => {
    const payload = await request('/permission-groups?per_page=100')
    setGroups(payload.data || [])
  }, [request])

  const loadFeatures = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== '') params.set('is_active', statusFilter)
      const payload = await request(`/permission-features?${params.toString()}`)
      setFeatures(payload.data || [])
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      })
    } catch (loadError) {
      setError(loadError.message || 'Gagal memuat data fitur.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, request])

  useEffect(() => {
    loadGroups().catch((loadError) => setError(loadError.message || 'Gagal memuat kelompok fitur.'))
  }, [loadGroups])

  useEffect(() => {
    loadFeatures()
  }, [loadFeatures])

  const openCreate = () => navigate('/permissions/form')
  const openEdit = (feature) => navigate(`/permissions/form/${feature.id}`)

  const deleteFeature = async (feature) => {
    if (!window.confirm(`Yakin ingin menghapus fitur "${feature.name}"?\nData fitur akan dihapus dari daftar.`)) return
    setError('')
    setNotice('')
    try {
      await request(`/permission-features/${feature.id}`, { method: 'DELETE' })
      setNotice('Fitur berhasil dihapus.')
      await loadFeatures()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus fitur.')
    }
  }

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const changeStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
    setSearch(searchInput.trim())
  }

  const resetSearch = () => {
    setSearchInput('')
    setStatusFilter('')
    setPage(1)
    setSearch('')
  }

  const groupIcons = { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags }
  const filteredGroups = groups.filter((group) => {
    const keyword = groupSearch.trim().toLowerCase()
    const matchesSearch = !keyword || String(group.name || '').toLowerCase().includes(keyword) || String(group.description || '').toLowerCase().includes(keyword)
    const matchesStatus = groupStatusFilter === '' || String(Number(Boolean(group.is_active))) === groupStatusFilter
    return matchesSearch && matchesStatus
  })
  const groupPagination = { current_page: groupPage, last_page: Math.max(1, Math.ceil(filteredGroups.length / groupPerPage)), total: filteredGroups.length }
  const paginatedGroups = filteredGroups.slice((groupPage - 1) * groupPerPage, groupPage * groupPerPage)
  const openGroupCreate = () => navigate('/permission-groups/form')
  const openGroupEdit = (group) => navigate('/permission-groups/form/' + group.id)
  const openGroupDetail = (group) => navigate('/permission-groups/detail/' + group.id)
  const deleteGroup = async (group) => {
    if (!window.confirm('Yakin ingin menghapus group ' + group.name + '?')) return
    setError(''); setNotice('')
    try { await request('/permission-groups/' + group.id, { method: 'DELETE' }); setNotice('Group feature berhasil dihapus.'); await loadGroups() }
    catch (deleteError) { setError(deleteError.message || 'Gagal menghapus group feature.') }
  }
  const applyGroupSearch = () => { setGroupSearch(groupSearchInput.trim()); setGroupPage(1) }
  const resetGroupSearch = () => { setGroupSearchInput(''); setGroupSearch(''); setGroupStatusFilter(''); setGroupPage(1) }

  const getGroupName = (feature) => (
    feature.group?.name || groups.find((group) => group.id === feature.permission_group_id)?.name || '—'
  )

  const columns = [
    {
      key: 'number',
      title: 'No.',
      width: '60px',
      render: (_feature, index) => (pagination.current_page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      title: 'Nama Fitur',
      render: (feature) => (
        <div>
          <div className="fw-semibold">{feature.name}</div>
          <small className="text-body-secondary">Ordering: {feature.ordering ?? 0}</small>
        </div>
      ),
    },
    { key: 'group', title: 'Kelompok', render: (feature) => getGroupName(feature) },
    { key: 'path', title: 'Path', render: (feature) => <small>{feature.path || '—'}</small> },
    { key: 'menu_type', title: 'Jenis Menu', render: (feature) => feature.menu_type === 'topbar' ? 'Topbar' : 'Sidebar' },
    {
      key: 'status',
      title: 'Status',
      render: (feature) => <CBadge color={feature.is_active ? 'success' : 'secondary'}>{feature.is_active ? 'Aktif' : 'Nonaktif'}</CBadge>,
    },
    {
      key: 'actions',
      title: 'Aksi',
      width: '120px',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (feature) => (
        <div className="table-actions d-inline-flex gap-2">
          <CButton color="primary" variant="outline" size="sm" onClick={() => openEdit(feature)} title="Edit fitur" aria-label={`Edit ${feature.name}`}>
            <CIcon icon={cilPencil} size="sm" />
          </CButton>
          <CButton color="danger" variant="outline" size="sm" onClick={() => deleteFeature(feature)} title="Hapus fitur" aria-label={`Hapus ${feature.name}`}>
            <CIcon icon={cilTrash} size="sm" />
          </CButton>
        </div>
      ),
    },
  ]

  return (
    <MasterPageLayout title="Management Fitur" className="role-list-page" notice={notice} error={error} onClearNotice={() => setNotice('')} onClearError={() => setError('')}>
      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <strong className="fs-5">Daftar Fitur</strong>
          <CButton color="primary" size="sm" className="role-compact-button" onClick={openCreate} disabled={groups.length === 0}>
            <CIcon icon={cilPlus} size="sm" className="me-1" />Tambah Fitur
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
                  onKeyDown={(event) => event.key === 'Enter' && applySearch()}
                  aria-label="Cari fitur"
                  className="flex-grow-1"
                />
                <CFormSelect
                  aria-label="Filter status fitur"
                  value={statusFilter}
                  onChange={(event) => changeStatusFilter(event.target.value)}
                  style={{ maxWidth: '160px' }}
                  options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]}
                />
                <CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applySearch}>
                  <CIcon icon={cilSearch} size="sm" className="me-1" />Cari
                </CButton>
                <CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetSearch}>
                  <CIcon icon={cilReload} size="sm" className="me-1" />Reset
                </CButton>
              </div>
            </CCol>
          </CRow>

          <GlobalTable columns={columns} rows={features} rowKey="id" loading={loading} emptyMessage="Data fitur tidak ditemukan." hover responsive className="role-table" />
          <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} loading={loading} />
        </CCardBody>
      </CCard>

      <CCard className="role-panel role-list-panel mb-4"><CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong className="fs-5">Daftar Group Feature</strong><CButton color="primary" size="sm" className="role-compact-button" onClick={openGroupCreate}><CIcon icon={cilPlus} size="sm" className="me-1"/>Tambah Group</CButton></CCardHeader><CCardBody><CRow className="mb-3"><CCol xs={12}><div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100"><CFormInput placeholder="Cari nama group" value={groupSearchInput} onChange={(event)=>setGroupSearchInput(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&applyGroupSearch()} aria-label="Cari group feature" className="flex-grow-1"/><CFormSelect aria-label="Filter status group" value={groupStatusFilter} onChange={(event)=>{setGroupStatusFilter(event.target.value);setGroupPage(1)}} style={{maxWidth:"160px"}} options={[{label:"Semua Status",value:""},{label:"Aktif",value:"1"},{label:"Nonaktif",value:"0"}]}/><CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applyGroupSearch}><CIcon icon={cilSearch} size="sm" className="me-1"/>Cari</CButton><CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetGroupSearch}><CIcon icon={cilReload} size="sm" className="me-1"/>Reset</CButton></div></CCol></CRow><GlobalTable columns={[{key:"number",title:"No.",width:60,render:(_group,index)=>(groupPage-1)*groupPerPage+index+1},{key:"icon",title:"Icon",render:(group)=><CIcon icon={groupIcons[group.icon]||cilFolderOpen} size="xl"/>},{key:"name",title:"Nama Group",render:(group)=><div><div className="fw-semibold">{group.name}</div><div className="small text-body-secondary d-flex align-items-center gap-2"><span>Ordering: {group.ordering??0}</span><CBadge color={group.is_active?"success":"secondary"}>{group.is_active?"Aktif":"Nonaktif"}</CBadge></div></div>},{key:"features_count",title:"Jumlah Fitur",className:"text-center",headerClassName:"text-center",render:(group)=>group.features_count??0},{key:"actions",title:"Aksi",width:150,className:"text-center",headerClassName:"text-center",render:(group)=><div className="table-actions d-inline-flex gap-2"><CButton color="info" variant="outline" size="sm" onClick={()=>openGroupDetail(group)} title="Detail"><CIcon icon={cilFolderOpen} size="sm"/></CButton><CButton color="primary" variant="outline" size="sm" onClick={()=>openGroupEdit(group)} title="Edit"><CIcon icon={cilPencil} size="sm"/></CButton><CButton color="danger" variant="outline" size="sm" onClick={()=>deleteGroup(group)} title="Hapus"><CIcon icon={cilTrash} size="sm"/></CButton></div>}] } rows={paginatedGroups} rowKey="id" loading={loading} emptyMessage="Data group feature tidak ditemukan." hover responsive className="role-table"/><GlobalPagination currentPage={groupPagination.current_page} lastPage={groupPagination.last_page} total={groupPagination.total} perPage={groupPerPage} onPageChange={setGroupPage} loading={loading}/></CCardBody></CCard>
    </MasterPageLayout>
  )
}

export default FeatureListPage
