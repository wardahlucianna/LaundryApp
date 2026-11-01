import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CFormSelect,
  CSpinner, CTable, CTableBody, CTableDataCell, CTableHead,
  CTableHeaderCell, CTableRow,
} from '@coreui/react'
import { useSearchParams } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

const ACTIONS = [
  ['view', 'Lihat'],
  ['create', 'Tambah'],
  ['update', 'Ubah'],
  ['delete', 'Hapus'],
  ['manage', 'Kelola'],
]

export default function AccessManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [roles, setRoles] = useState([])
  const [roleId, setRoleId] = useState(searchParams.get('role') || '')
  const [permissions, setPermissions] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const currentRole = roles.find((role) => role.id === roleId)
  const isSuperAdmin = currentRole?.code === 'SUPERADMIN'

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [roleResult, permissionResult] = await Promise.all([
        apiRequest('/roles?per_page=100'),
        apiRequest('/permissions?per_page=100'),
      ])
      const roleRows = roleResult.data || []
      setRoles(roleRows)
      setPermissions(permissionResult.data || [])
      const initialRole = roleRows.find((role) => role.id === roleId) || roleRows[0]
      if (initialRole) setRoleId(initialRole.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRolePermissions = useCallback(async () => {
    if (!roleId) return
    try {
      const result = await apiRequest(`/roles/${roleId}`)
      setSelected((result.data?.permissions || []).map((permission) => permission.id))
    } catch (err) {
      setError(err.message)
    }
  }, [roleId])

  useEffect(() => { loadInitial() }, [loadInitial])
  useEffect(() => {
    if (roleId) {
      setSearchParams({ role: roleId }, { replace: true })
      loadRolePermissions()
    }
  }, [roleId, loadRolePermissions, setSearchParams])

  const grouped = useMemo(() => {
    const map = new Map()
    permissions.forEach((permission) => {
      const feature = permission.feature
      const groupName = feature?.group?.name || 'Fitur Lainnya'
      if (!map.has(groupName)) map.set(groupName, new Map())
      const features = map.get(groupName)
      const featureKey = feature?.id || permission.permission_feature_id || permission.path || permission.code
      if (!features.has(featureKey)) {
        features.set(featureKey, { name: feature?.name || permission.path || 'Fitur', actions: [] })
      }
      features.get(featureKey).actions.push(permission)
    })
    return Array.from(map.entries()).map(([name, features]) => ({
      name,
      features: Array.from(features.values()),
    }))
  }, [permissions])

  const toggle = (permissionId, checked) => {
    setSelected((current) => checked
      ? [...new Set([...current, permissionId])]
      : current.filter((id) => id !== permissionId))
  }

  const save = async () => {
    if (!roleId || isSuperAdmin) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await apiRequest(`/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: selected }),
      })
      setSuccess('Hak akses berhasil diperbarui.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /></div>

  return (
    <div className="pt-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h4 className="mb-1">Hak Akses</h4>
          <div className="text-body-secondary small">Pilih fitur dan tindakan yang boleh dilakukan oleh setiap role.</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <CFormSelect value={roleId} style={{ minWidth: 190 }} onChange={(event) => setRoleId(event.target.value)}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </CFormSelect>
          <CButton color="primary" onClick={save} disabled={saving || isSuperAdmin || !roleId}>
            {saving ? 'Menyimpan...' : 'Simpan Hak Akses'}
          </CButton>
        </div>
      </div>

      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}
      {isSuperAdmin && <CAlert color="info">Super Admin selalu memiliki seluruh hak akses. Pengaturan role ini dikunci oleh sistem.</CAlert>}

      {grouped.map((group) => (
        <CCard className="border-0 shadow-sm mb-3" key={group.name}>
          <CCardHeader className="bg-white py-3"><strong>{group.name}</strong></CCardHeader>
          <CCardBody className="p-0">
            <CTable responsive hover className="mb-0" align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell className="ps-4">Fitur</CTableHeaderCell>
                  {ACTIONS.map(([, label]) => <CTableHeaderCell key={label} className="text-center">{label}</CTableHeaderCell>)}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {group.features.map((feature) => (
                  <CTableRow key={feature.name}>
                    <CTableDataCell className="ps-4 fw-semibold">{feature.name}</CTableDataCell>
                    {ACTIONS.map(([action]) => {
                      const permission = feature.actions.find((item) => item.action_name === action)
                      return (
                        <CTableDataCell className="text-center" key={action}>
                          {permission ? (
                            <input
                              className="form-check-input"
                              type="checkbox"
                              aria-label={`${feature.name} - ${action}`}
                              checked={isSuperAdmin || selected.includes(permission.id)}
                              disabled={isSuperAdmin}
                              onChange={(event) => toggle(permission.id, event.target.checked)}
                            />
                          ) : <span className="text-body-tertiary">—</span>}
                        </CTableDataCell>
                      )
                    })}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      ))}
      {!grouped.length && <CCard><CCardBody className="text-center text-body-secondary">Belum ada data fitur. Jalankan database seeder terlebih dahulu.</CCardBody></CCard>}
    </div>
  )
}
