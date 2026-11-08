import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CBadge,
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilBuilding, cilCash, cilChartLine, cilFolderOpen, cilPeople, cilPencil, cilPlus, cilReload, cilSearch, cilSettings, cilSpeedometer, cilTags, cilTrash } from '@coreui/icons'

import MasterPageLayout from '../../../components/layout/MasterPageLayout'
import GlobalTable from '../../../components/data/GlobalTable'
import GlobalPagination from '../../../components/data/GlobalPagination'
import { apiBase } from '../../../../services/api'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'

// Reuse pending GET requests across React StrictMode effect remounts.
const pendingFeatureListGetRequests = new Map()

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
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const isGroupFeatureRoute = new URLSearchParams(location.search).get('view') === 'groups'

  const perPage = 10
  const groupPerPage = 10

  useEffect(() => {
    if (!location.state?.notice) return
    setNotice(location.state.notice)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [location, navigate])

  const request = useCallback(async (path, options = {}) => {
    const method = String(options.method || 'GET').toUpperCase()
    const requestKey = `${method}:${apiBase}${path}`

    if (method === 'GET' && pendingFeatureListGetRequests.has(requestKey)) {
      return pendingFeatureListGetRequests.get(requestKey)
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const pendingRequest = (async () => {
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
    })()

    if (method === 'GET') {
      pendingFeatureListGetRequests.set(requestKey, pendingRequest)
      pendingRequest.finally(() => {
        if (pendingFeatureListGetRequests.get(requestKey) === pendingRequest) {
          pendingFeatureListGetRequests.delete(requestKey)
        }
      }).catch(() => {})
    }

    return pendingRequest
  }, [])

  const loadGroups = useCallback(async () => {
    const payload = await request('/permission-groups?per_page=100')
    setGroups(payload.data || [])
  }, [request])

  useEffect(() => {
    if (!isGroupFeatureRoute) return
    loadGroups().catch((loadError) => setError(loadError.message || 'Gagal memuat kelompok fitur.'))
  }, [isGroupFeatureRoute, loadGroups])

  const loadFeatures = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== '') params.set('isActive', statusFilter)
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
    loadFeatures()
  }, [loadFeatures])

  const openCreate = async () => {
    const featureRouteBase = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
    if (featureRouteBase) navigate(`${featureRouteBase}/form`)
    else setError('Path Manajemen Fitur belum terdaftar di database.')
  }
  const openEdit = async (feature) => {
    const featureRouteBase = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
    if (featureRouteBase) navigate(`${featureRouteBase}/form/${feature.featureId}`)
    else setError('Path Manajemen Fitur belum terdaftar di database.')
  }

  const deleteFeature = (feature) => { setDeleteError(''); setDeleteTarget({ type: 'feature', item: feature }) }

  const deleteGroup = (group) => { setDeleteError(''); setDeleteTarget({ type: 'group', item: group }) }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    setNotice('')
    setDeleteError('')
    try {
      const { type, item } = deleteTarget
      await request(type === 'feature' ? `/permission-features/${item.featureId}` : `/permission-groups/${item.groupFeatureId}`, { method: 'DELETE' })
      window.dispatchEvent(new CustomEvent('sunrise:permissions-updated', {
        detail: type === 'feature'
          ? { type: 'delete-feature', featureId: item.featureId }
          : { type: 'delete-group', groupFeatureId: item.groupFeatureId },
      }))
      setNotice(type === 'feature' ? 'Fitur berhasil dihapus.' : 'Kelompok fitur berhasil dihapus.')
      if (type === 'feature') await loadFeatures()
      else await loadGroups()
      setDeleteTarget(null)
    } catch (deleteRequestError) {
      setDeleteError(deleteRequestError.message || 'Gagal menghapus data.')
    } finally {
      setDeleting(false)
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
    const matchesStatus = groupStatusFilter === '' || String(Number(Boolean(group.isActive))) === groupStatusFilter
    return matchesSearch && matchesStatus
  })
  const groupPagination = { current_page: groupPage, last_page: Math.max(1, Math.ceil(filteredGroups.length / groupPerPage)), total: filteredGroups.length }
  const paginatedGroups = filteredGroups.slice((groupPage - 1) * groupPerPage, groupPage * groupPerPage)
  const openGroupCreate = async () => {
    const basePath = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
    if (basePath) navigate(`${basePath}/group-feature/form`)
    else setError('Path Manajemen Fitur belum terdaftar di database.')
  }
  const openGroupEdit = async (group) => {
    const basePath = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
    if (basePath) navigate(`${basePath}/group-feature/form/${group.groupFeatureId}`)
    else setError('Path Manajemen Fitur belum terdaftar di database.')
  }
  const openGroupDetail = async (group) => {
    const basePath = await getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
    if (basePath) navigate(`${basePath}/group-feature/detail/${group.groupFeatureId}`)
    else setError('Path Manajemen Fitur belum terdaftar di database.')
  }

  const applyGroupSearch = () => { setGroupSearch(groupSearchInput.trim()); setGroupPage(1) }
  const resetGroupSearch = () => { setGroupSearchInput(''); setGroupSearch(''); setGroupStatusFilter(''); setGroupPage(1) }

  const getGroupName = (feature) => feature.group?.name || '—'

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
          <small className="text-body-secondary">Urutan: {feature.ordering ?? 0}</small>
        </div>
      ),
    },
    { key: 'group', title: 'Kelompok', render: (feature) => getGroupName(feature) },
    { key: 'path', title: 'Path', render: (feature) => <small>{feature.path || '—'}</small> },
    { key: 'menu_type', title: 'Jenis Menu', render: (feature) => feature.menuType === 'topbar' ? 'Bilah Atas' : 'Menu Samping' },
    { key: 'roles_count', title: 'Jumlah Role', className: 'text-center', headerClassName: 'text-center', render: (feature) => feature.roles_count ?? 0 },
    {
      key: 'status',
      title: 'Status',
      render: (feature) => <CBadge color={feature.isActive ? 'success' : 'secondary'}>{feature.isActive ? 'Aktif' : 'Nonaktif'}</CBadge>,
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
    <MasterPageLayout title={"Manajemen Fitur"} className="role-list-page" notice={notice} error={error} onClearNotice={() => setNotice('')} onClearError={() => setError('')}>
      {isGroupFeatureRoute ? (
        <CCard className="role-panel role-list-panel mb-4"><CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong className="fs-5">Daftar Kelompok Fitur</strong><CButton color="primary" size="sm" className="role-compact-button" onClick={openGroupCreate}><CIcon icon={cilPlus} size="sm" className="me-1"/>Tambah Group</CButton></CCardHeader><CCardBody><CRow className="mb-3"><CCol xs={12}><div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 w-100"><CFormInput placeholder="Cari nama kelompok" value={groupSearchInput} onChange={(event)=>setGroupSearchInput(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&applyGroupSearch()} aria-label="Cari kelompok fitur" className="flex-grow-1"/><CFormSelect aria-label="Filter status group" value={groupStatusFilter} onChange={(event)=>{setGroupStatusFilter(event.target.value);setGroupPage(1)}} style={{maxWidth:"160px"}} options={[{label:"Semua Status",value:""},{label:"Aktif",value:"1"},{label:"Nonaktif",value:"0"}]}/><CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applyGroupSearch}><CIcon icon={cilSearch} size="sm" className="me-1"/>Cari</CButton><CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetGroupSearch}><CIcon icon={cilReload} size="sm" className="me-1"/>Reset</CButton></div></CCol></CRow><GlobalTable columns={[{key:"number",title:"No.",width:60,render:(_group,index)=>(groupPage-1)*groupPerPage+index+1},{key:"icon",title:"Ikon",render:(group)=><CIcon icon={groupIcons[group.icon]||cilFolderOpen} size="xl"/>},{key:"name",title:"Nama Kelompok",render:(group)=><div><div className="fw-semibold">{group.name}</div><small className="text-body-secondary">Urutan: {group.ordering??0}</small></div>},{key:"features_count",title:"Jumlah Fitur",className:"text-center",headerClassName:"text-center",render:(group)=>group.features_count??0},{key:"status",title:"Status",className:"text-center",headerClassName:"text-center",render:(group)=><CBadge color={group.isActive?"success":"secondary"}>{group.isActive?"Aktif":"Nonaktif"}</CBadge>},{key:"actions",title:"Aksi",width:150,className:"text-center",headerClassName:"text-center",render:(group)=><div className="table-actions d-inline-flex gap-2"><CButton color="primary" variant="outline" size="sm" onClick={()=>openGroupEdit(group)} title="Edit"><CIcon icon={cilPencil} size="sm"/></CButton><CButton color="danger" variant="outline" size="sm" onClick={()=>deleteGroup(group)} title="Hapus"><CIcon icon={cilTrash} size="sm"/></CButton></div>}] } rows={paginatedGroups} rowKey="groupFeatureId" loading={loading} emptyMessage="Data group feature tidak ditemukan." hover responsive className="role-table"/><GlobalPagination currentPage={groupPagination.current_page} lastPage={groupPagination.last_page} total={groupPagination.total} perPage={groupPerPage} onPageChange={setGroupPage} loading={loading}/></CCardBody></CCard>
      ) : (
        <CCard className="role-panel role-list-panel mb-4">
                  <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <strong className="fs-5">Daftar Fitur</strong>
                    <CButton color="primary" size="sm" className="role-compact-button" onClick={openCreate} >
                      <CIcon icon={cilPlus} size="sm" className="me-1" />Tambah Fitur
                    </CButton>
                  </CCardHeader>
                  <CCardBody>
                    <CRow className="mb-3">
                      <CCol xs={12}>
                        <div className="d-flex flex-column gap-2 w-100">
                          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100">
                            <CFormInput
                              placeholder="Cari nama atau kelompok fitur"
                              value={searchInput}
                              onChange={(event) => setSearchInput(event.target.value)}
                              onKeyDown={(event) => event.key === 'Enter' && applySearch()}
                              aria-label="Cari fitur"
                              className="flex-grow-1 w-auto"
                              style={{ minWidth: 0 }}
                            />
                            <CFormSelect
                              aria-label="Filter status fitur"
                              value={statusFilter}
                              onChange={(event) => changeStatusFilter(event.target.value)}
                              style={{ width: '160px', maxWidth: '160px' }}
                              options={[{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]}
                            />
                          </div>
                          <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 pb-3 border-bottom">
                            <CButton color="primary" size="sm" className="role-compact-button role-search-button" onClick={applySearch}>
                              <CIcon icon={cilSearch} size="sm" className="me-1" />Cari
                            </CButton>
                            <CButton color="secondary" variant="outline" size="sm" className="role-compact-button role-reset-button" onClick={resetSearch}>
                              <CIcon icon={cilReload} size="sm" className="me-1" />Reset
                            </CButton>
                          </div>
                        </div>
                      </CCol>
                    </CRow>
          
                    <GlobalTable columns={columns} rows={features} rowKey="featureId" loading={loading} emptyMessage="Data fitur tidak ditemukan." hover responsive className="role-table" />
                    <GlobalPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} loading={loading} />
                  </CCardBody>
                </CCard>
      )}
      <CModal visible={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} alignment="center">
        <CModalHeader><strong>Konfirmasi Hapus</strong></CModalHeader>
        <CModalBody>
          {deleteError && <CAlert color="danger" className="mb-3" dismissible onClose={() => setDeleteError('')}><strong>Penghapusan gagal:</strong> {deleteError}</CAlert>}
          Apakah kamu yakin ingin menghapus {deleteTarget?.type === 'feature' ? 'fitur' : 'kelompok fitur'} <strong>{deleteTarget?.item?.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" size="sm" disabled={deleting} onClick={() => { setDeleteTarget(null); setDeleteError('') }}>Batal</CButton>
          <CButton color="danger" size="sm" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</CButton>
        </CModalFooter>
      </CModal>
    </MasterPageLayout>
  )
}

export default FeatureListPage
