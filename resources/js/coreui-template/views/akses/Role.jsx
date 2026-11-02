import React, { useCallback, useEffect, useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList, cilPlus, cilShieldAlt } from '@coreui/icons'
import RoleList from './RoleList'
import RoleForm from './RoleForm'

const apiBase = (() => {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base ? (base.endsWith('/api') ? base : `${base}/api`) : '/api'
})()

const Role = () => {
  const [section, setSection] = useState('home')
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingRole, setEditingRole] = useState(null)

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const validation = payload.errors ? Object.values(payload.errors).flat().join(' ') : ''
      throw new Error(validation || payload.message || 'Permintaan gagal diproses.')
    }
    return payload
  }, [])

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await request('/roles?per_page=100')
      setRoles(payload.data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data role.')
    } finally { setLoading(false) }
  }, [request])

  useEffect(() => { loadRoles() }, [loadRoles])

  const startCreate = () => { setEditingRole(null); setError(''); setSection('form') }
  const startEdit = (role) => { setEditingRole(role); setError(''); setSection('form') }

  const saveRole = async (values) => {
    setLoading(true)
    setError('')
    try {
      if (editingRole) {
        await request(`/roles/${editingRole.id}`, { method: 'PUT', body: JSON.stringify(values) })
        setNotice('Role berhasil diperbarui.')
      } else {
        await request('/roles', { method: 'POST', body: JSON.stringify(values) })
        setNotice('Role berhasil ditambahkan.')
      }
      setEditingRole(null)
      setSection('list')
      await loadRoles()
    } catch (e) { setError(e.message || 'Gagal menyimpan role.') }
    finally { setLoading(false) }
  }

  const deleteRole = async (role) => {
    if (role.code === 'SUPERADMIN') { setError('Role SUPERADMIN tidak dapat dihapus.'); return }
    if (!window.confirm(`Yakin ingin menghapus role "${role.name}"?`)) return
    setError('')
    try {
      await request(`/roles/${role.id}`, { method: 'DELETE' })
      setNotice('Role berhasil dihapus.')
      await loadRoles()
    } catch (e) { setError(e.message || 'Gagal menghapus role.') }
  }

  const NavButton = ({ value, label, icon }) => (
    <CButton color={section === value ? 'primary' : 'secondary'} variant={section === value ? undefined : 'outline'} size="sm" onClick={() => { setSection(value); setError('') }}>
      {icon && <CIcon icon={icon} className="me-2" />}{label}
    </CButton>
  )

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <CRow className="mb-3 align-items-center">
        <CCol><h2 className="fs-4 mb-1">Manajemen Role</h2><div className="text-body-secondary">Kelola role dan hak akses pengguna Sunrise Laundry.</div></CCol>
      </CRow>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <NavButton value="home" label="Home" icon={cilShieldAlt} />
        <NavButton value="list" label="List" icon={cilList} />
        <NavButton value="form" label="Form" icon={cilPlus} />
      </div>
      {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      {section === 'home' && (
        <CRow className="g-3">
          <CCol xs={12} md={6}>
            <CCard className="h-100"><CCardHeader><strong>Ringkasan Role</strong></CCardHeader><CCardBody>
              {loading ? <CSpinner size="sm" /> : <><div className="text-body-secondary">Total role terdaftar</div><div className="fs-2 fw-semibold">{roles.length}</div></>}
              <div className="mt-3 d-flex gap-2"><CButton size="sm" color="primary" onClick={() => setSection('list')}><CIcon icon={cilList} className="me-2" />Lihat List</CButton><CButton size="sm" color="success" onClick={startCreate}><CIcon icon={cilPlus} className="me-2" />Tambah Role</CButton></div>
            </CCardBody></CCard>
          </CCol>
          <CCol xs={12} md={6}><CCard className="h-100"><CCardHeader><strong>Informasi</strong></CCardHeader><CCardBody className="text-body-secondary">Menu Role terdiri dari Home untuk ringkasan, List untuk melihat dan mengelola data, serta Form untuk menambah atau mengubah role.</CCardBody></CCard></CCol>
        </CRow>
      )}
      {section === 'list' && <RoleList roles={roles} loading={loading} onAdd={startCreate} onEdit={startEdit} onDelete={deleteRole} />}
      {section === 'form' && <RoleForm role={editingRole} saving={loading} onSave={saveRole} onCancel={() => { setEditingRole(null); setSection('list') }} />}
    </div>
  )
}

export default Role
