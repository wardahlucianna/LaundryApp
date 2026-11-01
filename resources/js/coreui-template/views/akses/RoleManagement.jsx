import React, { useCallback, useEffect, useState } from 'react'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader,
  CForm, CFormInput, CFormLabel, CModal, CModalBody,
  CModalFooter, CModalHeader, CModalTitle, CSpinner, CTable,
  CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

const emptyForm = { name: '', code: '' }

export default function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await apiRequest('/roles?per_page=100')
      setRoles(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRoles() }, [loadRoles])

  const saveRole = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiRequest('/roles', { method: 'POST', body: JSON.stringify({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
        is_active: true,
      }) })
      setVisible(false)
      setForm(emptyForm)
      await loadRoles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeRole = async (role) => {
    if (!window.confirm(`Hapus role "${role.name}"?`)) return
    try {
      await apiRequest(`/roles/${role.id}`, { method: 'DELETE' })
      await loadRoles()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = roles.filter((role) =>
    `${role.name} ${role.code}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="pt-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h4 className="mb-1">Manajemen Role</h4>
          <div className="text-body-secondary small">Atur peran pengguna dan hak akses setiap role.</div>
        </div>
        <CButton color="primary" onClick={() => { setForm(emptyForm); setVisible(true) }}>
          <span className="me-2">+</span> Tambah Role
        </CButton>
      </div>

      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}

      <CCard className="border-0 shadow-sm">
        <CCardHeader className="bg-white border-0 py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <strong>Daftar Role</strong>
            <CFormInput
              size="sm" style={{ maxWidth: 260 }} placeholder="Cari nama atau kode role..."
              value={search} onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CCardHeader>
        <CCardBody className="p-0">
          {loading ? <div className="text-center py-5"><CSpinner color="primary" /></div> : (
            <CTable responsive hover align="middle" className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell className="ps-4">Nama Role</CTableHeaderCell>
                  <CTableHeaderCell>Kode</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Pengguna</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hak Akses</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell className="text-end pe-4">Aksi</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filtered.map((role) => {
                  const systemRole = ['SUPERADMIN', 'ADMIN', 'OWNER'].includes(role.code)
                  return (
                    <CTableRow key={role.id}>
                      <CTableDataCell className="ps-4 fw-semibold">{role.name}</CTableDataCell>
                      <CTableDataCell><code>{role.code}</code></CTableDataCell>
                      <CTableDataCell className="text-center">{role.users_count ?? 0}</CTableDataCell>
                      <CTableDataCell className="text-center">{role.permissions_count ?? 0}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={role.is_active ? 'success' : 'secondary'}>{role.is_active ? 'Aktif' : 'Nonaktif'}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end pe-4">
                        <CButton size="sm" color="info" variant="outline" onClick={() => navigate(`/access?role=${role.id}`)}>
                          Atur Hak Akses
                        </CButton>
                        {!systemRole && (
                          <CButton size="sm" color="danger" variant="ghost" className="ms-1" onClick={() => removeRole(role)}>
                            Hapus
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
                {!filtered.length && <CTableRow><CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">Belum ada role yang sesuai.</CTableDataCell></CTableRow>}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center">
        <CForm onSubmit={saveRole}>
          <CModalHeader><CModalTitle>Tambah Role</CModalTitle></CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Nama Role</CFormLabel>
              <CFormInput autoFocus required value={form.name} placeholder="Contoh: Supervisor"
                onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div>
              <CFormLabel>Kode Role</CFormLabel>
              <CFormInput required value={form.code} placeholder="Contoh: SUPERVISOR"
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s+/g, '_') })} />
              <div className="form-text">Gunakan huruf, angka, garis bawah, atau tanda hubung.</div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setVisible(false)}>Batal</CButton>
            <CButton type="submit" color="primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Role'}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}
