import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import RoleList from './RoleList'

const apiBase = (() => {
  const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return configuredBase ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`) : '/api'
})()

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice)
      navigate(location.pathname, { replace: true, state: {} })
    }
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

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search.trim()) params.set('search', search.trim())
      const payload = await request(`/roles?${params.toString()}`)
      setRoles(payload.data || [])
      setPagination({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      })
    } catch (loadError) {
      setError(loadError.message || 'Gagal memuat data role.')
    } finally {
      setLoading(false)
    }
  }, [page, search, request])

  useEffect(() => { loadRoles() }, [loadRoles])

  const openCreate = () => navigate('/roles/form')
  const openEdit = (role) => navigate(`/roles/form/${role.id}`)
  const openDetail = (role) => navigate(`/roles/detail/${role.id}`)

  const handleDelete = (role) => {
    if (role.code === 'SUPERADMIN') {
      setError('Role SUPERADMIN tidak dapat dihapus.')
      return
    }
    setRoleToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return
    setDeleting(true)
    setError('')
    setNotice('')
    try {
      await request(`/roles/${roleToDelete.id}`, { method: 'DELETE' })
      setNotice('Role berhasil dihapus.')
      setRoleToDelete(null)
      await loadRoles()
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus role.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="role-list-page">
      <div className="role-page-layout mb-4">
        <div className="mb-3">
          <h2 className="fs-4 mb-1">Daftar Role</h2>
          <div className="small text-body-secondary">Lihat dan kelola peran aplikasi.</div>
        </div>
        {notice && <div className="alert alert-success alert-dismissible" role="alert">
          {notice}<button type="button" className="btn-close" aria-label="Tutup" onClick={() => setNotice('')} />
        </div>}
        {error && <div className="alert alert-danger alert-dismissible" role="alert">
          {error}<button type="button" className="btn-close" aria-label="Tutup" onClick={() => setError('')} />
        </div>}
        <RoleList
          roles={roles}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pagination={pagination}
          loading={loading}
          loadRoles={loadRoles}
          onCreate={openCreate}
          onDetail={openDetail}
          onEdit={openEdit}
          onDelete={handleDelete}
          roleToDelete={roleToDelete}
          deleting={deleting}
          onConfirmDelete={confirmDelete}
          onCancelDelete={() => setRoleToDelete(null)}
        />
      </div>
    </div>
  )
}

export default RoleManagement
