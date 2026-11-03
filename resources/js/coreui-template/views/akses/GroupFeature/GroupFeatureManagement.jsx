import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import GroupFeatureList from './GroupFeatureList'

const apiBase = (() => { const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); return base ? (base.endsWith('/api') ? base : base + '/api') : '/api' })()
const GroupFeatureManagement = () => {
  const [groups, setGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.notice) { setNotice(location.state.notice); navigate(location.pathname, { replace: true, state: {} }) }
  }, [location, navigate])

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(apiBase + path, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + token, ...(options.headers || {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.errors ? Object.values(payload.errors).flat().join(' ') : payload.message || 'Permintaan gagal diproses.')
    return payload
  }, [])

  const loadGroups = useCallback(async () => {
    setLoading(true); setError('')
    try { const payload = await request('/permission-groups?per_page=100'); setGroups(payload.data || []) }
    catch (e) { setError(e.message || 'Gagal memuat data group feature.') }
    finally { setLoading(false) }
  }, [request])
  useEffect(() => { loadGroups() }, [loadGroups])

  const filteredGroups = groups.filter(group => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch = !keyword || String(group.name || '').toLowerCase().includes(keyword) || String(group.description || '').toLowerCase().includes(keyword)
    const matchesStatus = statusFilter === '' || String(Number(Boolean(group.is_active))) === statusFilter
    return matchesSearch && matchesStatus
  })
  const openCreate = () => navigate('/permission-groups/form')
  const openEdit = group => navigate('/permission-groups/form/' + group.id)
  const openDetail = group => navigate('/permission-groups/detail/' + group.id)
  const deleteGroup = async group => {
    if (!window.confirm('Yakin ingin menghapus group "' + group.name + '"?')) return
    setError(''); setNotice('')
    try { await request('/permission-groups/' + group.id, { method: 'DELETE' }); setNotice('Group feature berhasil dihapus.'); await loadGroups() }
    catch (e) { setError(e.message || 'Gagal menghapus group feature.') }
  }
  const applySearch = () => setSearch(searchInput.trim())
  const resetSearch = () => { setSearchInput(''); setSearch(''); setStatusFilter('') }

  return <div className="role-list-page role-page-layout mb-4">
    <div className="mb-3"><h2 className="fs-4 mb-1">Management Group Feature</h2></div>
    {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
    {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
    <GroupFeatureList groups={filteredGroups} searchInput={searchInput} setSearchInput={setSearchInput} statusFilter={statusFilter} setStatusFilter={setStatusFilter} applySearch={applySearch} resetSearch={resetSearch} loading={loading} onCreate={openCreate} onDetail={openDetail} onEdit={openEdit} onDelete={deleteGroup} />
  </div>
}
export default GroupFeatureManagement
