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
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) } })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.message || 'Permintaan gagal diproses.')
    return payload
  }, [])

  useEffect(() => {
    if (!id) return
    let active = true
    request(`/roles/${id}`).then(payload => { if (active) setRole(payload.data || payload) }).catch(e => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, request])

  const save = async (values) => {
    setSaving(true); setError('')
    try {
      await request(id ? `/roles/${id}` : '/roles', { method: id ? 'PUT' : 'POST', body: JSON.stringify(values) })
      navigate('/roles/list', { state: { notice: id ? 'Role berhasil diperbarui.' : 'Role berhasil ditambahkan.' } })
    } catch (e) { setError(e.message || 'Gagal menyimpan role.') }
    finally { setSaving(false) }
  }

  return (
    <div className="role-form-page">
      <div className="role-page-heading mb-3"><div><h2 className="fs-4 mb-1">Manajemen Role</h2></div></div>
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      {loading ? <div className="d-flex align-items-center gap-2 py-4 text-body-secondary"><CSpinner color="primary" size="sm" /> <span>Memuat data role...</span></div> : <RoleForm role={role} saving={saving} onSave={save} onCancel={() => navigate('/roles/list')} />}
    </div>
  )
}
export default RoleFormPage
