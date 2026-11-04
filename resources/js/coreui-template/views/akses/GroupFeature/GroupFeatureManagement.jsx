import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'

import GroupFeatureList from './GroupFeatureList'
import MasterPageLayout from '../../../components/MasterPageLayout'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

  if (!base) {
    return '/api'
  }

  return base.endsWith('/api')
    ? base
    : `${base}/api`
})()

const GroupFeatureManagement = () => {
  const [groups, setGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const perPage = 10
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.state?.notice) {
      return
    }

    setNotice(location.state.notice)

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [location, navigate])

  const request = useCallback(async (path, options = {}) => {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      ''

    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const validationMessage = payload.errors
        ? Object.values(payload.errors).flat().join(' ')
        : ''

      throw new Error(
        validationMessage ||
          payload.message ||
          'Permintaan gagal diproses.',
      )
    }

    return payload
  }, [])

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const payload = await request('/permission-groups?per_page=100')

      setGroups(payload.data || [])
    } catch (loadError) {
      setError(
        loadError.message || 'Gagal memuat data group feature.',
      )
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const filteredGroups = groups.filter((group) => {
    const keyword = search.trim().toLowerCase()
    const groupName = String(group.name || '').toLowerCase()
    const groupDescription = String(group.description || '').toLowerCase()

    const matchesSearch =
      !keyword ||
      groupName.includes(keyword) ||
      groupDescription.includes(keyword)

    const matchesStatus =
      statusFilter === '' ||
      String(Number(Boolean(group.is_active))) === statusFilter

    return matchesSearch && matchesStatus
  })

  const pagination = {
    current_page: page,
    last_page: Math.max(
      1,
      Math.ceil(filteredGroups.length / perPage),
    ),
    total: filteredGroups.length,
  }

  const paginatedGroups = filteredGroups.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  const openCreate = () => {
    navigate('/permission-groups/form')
  }

  const openEdit = (group) => {
    navigate(`/permission-groups/form/${group.id}`)
  }

  const openDetail = (group) => {
    navigate(`/permission-groups/detail/${group.id}`)
  }

  const deleteGroup = async (group) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus group "${group.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setNotice('')

    try {
      await request(`/permission-groups/${group.id}`, {
        method: 'DELETE',
      })

      setNotice('Group feature berhasil dihapus.')

      await loadGroups()
    } catch (deleteError) {
      setError(
        deleteError.message || 'Gagal menghapus group feature.',
      )
    }
  }

  const applySearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const resetSearch = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('')
    setPage(1)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <MasterPageLayout
      title="Management Group Feature"
      className="role-list-page"
    >
      {notice && (
        <CAlert
          color="success"
          dismissible
          onClose={() => setNotice('')}
        >
          {notice}
        </CAlert>
      )}

      {error && (
        <CAlert
          color="danger"
          dismissible
          onClose={() => setError('')}
        >
          {error}
        </CAlert>
      )}

      <GroupFeatureList
        groups={paginatedGroups}
        pagination={pagination}
        perPage={perPage}
        page={page}
        setPage={setPage}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        applySearch={applySearch}
        resetSearch={resetSearch}
        loading={loading}
        onCreate={openCreate}
        onDetail={openDetail}
        onEdit={openEdit}
        onDelete={deleteGroup}
      />
    </MasterPageLayout>
  )
}

export default GroupFeatureManagement
