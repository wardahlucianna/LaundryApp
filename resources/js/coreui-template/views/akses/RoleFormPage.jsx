import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CAlert, CSpinner } from '@coreui/react'
import RoleForm from './RoleForm'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const RoleFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [role, setRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validationMessage || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const load = async () => {
      try {
        const [permissionsPayload, rolePayload] = await Promise.all([
          request('/permissions?is_active=1&per_page=100'),
          id ? request(`/roles/${id}`) : Promise.resolve(null),
        ])
        if (!active) return
        setPermissions(permissionsPayload.data || [])
        setRole(rolePayload ? (rolePayload.data || rolePayload) : null)
      } catch (e) {
        if (active) setError(e.message || 'Gagal memuat data role dan permission.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, request])

  const save = async (values) => {
    setSaving(true); setError('')
    try {
      const rolePayload = await request(id ? `/roles/${id}` : '/roles', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ name: values.name, code: values.code, is_active: values.is_active }),
      })
      const savedRole = rolePayload.data || rolePayload
      if (values.code !== 'SUPERADMIN') {
        await request(`/roles/${savedRole.id || id}/permissions`, {
          method: 'PUT',
          body: JSON.stringify({ permission_ids: values.permission_ids || [] }),
        })
      }
      navigate('/roles/list', { state: { notice: id ? 'Role berhasil diperbarui.' : 'Role berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan role dan permission.') }
    finally { setSaving(false) }
  }

  return (
    <div className="role-form-page">
      <div className="role-page-heading mb-3"><div><h2 className="fs-4 mb-1">Manajemen Role</h2></div></div>
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner color="primary" size="sm" /> <span>Memuat data role dan permission...</span></div> : <RoleForm role={role} permissions={permissions} saving={saving} onSave={save} onCancel={() => navigate('/roles/list')} />}
    </div>
  )
}
export default RoleFormPage
