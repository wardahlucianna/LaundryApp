import React, { useCallback, useEffect, useState } from 'react'
import { CAlert } from '@coreui/react'
import FeatureList from './FeatureList'
import FeatureForm from './FeatureForm'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const emptyForm = { permission_group_id: '', name: '', code: '', path: '', menu_type: 'sidebar', is_active: true }

const FeatureManagement = () => {
  const [features, setFeatures] = useState([])
  const [groups, setGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingFeature, setEditingFeature] = useState(null)
  const [form, setForm] = useState(emptyForm)

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
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search.trim()) params.set('search', search.trim())
      const payload = await request(`/permission-features?${params.toString()}`)
      setFeatures(payload.data || [])
      setPagination({ current_page: payload.current_page || 1, last_page: payload.last_page || 1, total: payload.total || 0 })
    } catch (e) {
      setError(e.message || 'Gagal memuat data fitur.')
    } finally {
      setLoading(false)
    }
  }, [page, search, request])

  useEffect(() => { loadGroups().catch((e) => setError(e.message || 'Gagal memuat kelompok fitur.')) }, [loadGroups])
  useEffect(() => { loadFeatures() }, [loadFeatures])

  const openCreate = () => {
    setEditingFeature(null)
    setForm({ ...emptyForm, permission_group_id: groups[0]?.id || '' })
    setError('')
    setModalVisible(true)
  }

  const openEdit = (feature) => {
    setEditingFeature(feature)
    setForm({
      permission_group_id: feature.permission_group_id || feature.group?.id || '',
      name: feature.name || '',
      code: feature.code || '',
      path: feature.path || '',
      menu_type: feature.menu_type || 'sidebar',
      is_active: Boolean(feature.is_active),
    })
    setError('')
    setModalVisible(true)
  }

  const saveFeature = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const body = {
        permission_group_id: form.permission_group_id,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
        path: form.path.trim() || null,
        menu_type: form.menu_type,
        is_active: form.is_active,
      }
      await request(editingFeature ? `/permission-features/${editingFeature.id}` : '/permission-features', {
        method: editingFeature ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      setModalVisible(false)
      setNotice(editingFeature ? 'Fitur berhasil diperbarui.' : 'Fitur berhasil ditambahkan.')
      await loadFeatures()
    } catch (e) {
      setError(e.message || 'Gagal menyimpan fitur.')
    } finally {
      setSaving(false)
    }
  }

  const deleteFeature = async (feature) => {
    if (!window.confirm(`Yakin ingin menghapus fitur "${feature.name}"?\nFitur yang masih memiliki permission aksi tidak dapat dihapus.`)) return
    setError('')
    setNotice('')
    try {
      await request(`/permission-features/${feature.id}`, { method: 'DELETE' })
      setNotice('Fitur berhasil dihapus.')
      await loadFeatures()
    } catch (e) {
      setError(e.message || 'Gagal menghapus fitur.')
    }
  }

  const applySearch = () => { setPage(1); setSearch(searchInput.trim()) }
  const resetSearch = () => { setSearchInput(''); setPage(1); setSearch('') }

  return (
    <div className="role-page-layout mb-4">
      <div className="mb-3"><h2 className="fs-4 mb-1">Management Fitur</h2></div>
      {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <FeatureList features={features} groups={groups} searchInput={searchInput} setSearchInput={setSearchInput} applySearch={applySearch} resetSearch={resetSearch} pagination={pagination} loading={loading} page={page} setPage={setPage} onCreate={openCreate} onEdit={openEdit} onDelete={deleteFeature} />
      <FeatureForm visible={modalVisible} onClose={() => setModalVisible(false)} saving={saving} editingFeature={editingFeature} form={form} setForm={setForm} groups={groups} error={error} onSubmit={saveFeature} />
    </div>
  )
}

export default FeatureManagement
