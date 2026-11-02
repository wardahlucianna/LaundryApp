import React, { useEffect, useMemo, useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const RoleForm = ({ role, permissions = [], saving, onSave, onCancel }) => {
  const [values, setValues] = useState({ name: '', code: '', is_active: true })
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [validation, setValidation] = useState('')

  const groupedPermissions = useMemo(() => {
    const groups = new Map()
    permissions.forEach((permission) => {
      const groupName = permission.feature?.group?.name || 'Lainnya'
      const featureName = permission.feature?.name || 'Fitur tanpa kelompok'
      if (!groups.has(groupName)) groups.set(groupName, new Map())
      const features = groups.get(groupName)
      if (!features.has(featureName)) features.set(featureName, [])
      features.get(featureName).push(permission)
    })
    return Array.from(groups.entries()).map(([groupName, features]) => ({
      name: groupName,
      features: Array.from(features.entries()).map(([featureName, items]) => ({ name: featureName, items })),
    }))
  }, [permissions])

  useEffect(() => {
    setValues({ name: role?.name || '', code: role?.code || '', is_active: role ? Boolean(role.is_active) : true })
    setSelectedPermissionIds(role?.permissions?.map((permission) => permission.id) || [])
    setValidation('')
  }, [role])

  const togglePermission = (permissionId, checked) => {
    setSelectedPermissionIds((current) => checked
      ? Array.from(new Set([...current, permissionId]))
      : current.filter((id) => id !== permissionId))
  }

  const submit = async (event) => {
    event.preventDefault()
    setValidation('')
    if (!values.name.trim() || !values.code.trim()) { setValidation('Nama dan kode role wajib diisi.'); return }
    await onSave({ name: values.name.trim(), code: values.code.trim(), is_active: values.is_active, permission_ids: selectedPermissionIds })
  }

  return (
    <CCard className="role-panel role-form-card mb-4">
      <CCardHeader><div><strong className="fs-5">{role ? 'Edit Role' : 'Tambah Role'}</strong></div></CCardHeader>
      <CCardBody>
        {validation && <CAlert color="warning">{validation}</CAlert>}
        <CForm onSubmit={submit}>
          <CRow className="g-3">
            <CCol xs={12} md={6}><CFormInput label="Nama Role" placeholder="Contoh: Administrator" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required maxLength={100} /></CCol>
            <CCol xs={12} md={6}><CFormInput label="Kode Role" placeholder="Contoh: ADMIN" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={60} pattern="[A-Za-z0-9_-]+" /><div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div></CCol>
            <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div className="role-status-copy"><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan role agar dapat digunakan.</div></div><CFormSwitch className={`role-status-switch ${values.is_active ? 'is-active' : 'is-inactive'}`} label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
          </CRow>
          <hr className="my-4" />

          <div className="mt-4">
            <style>{`.role-permission-checkbox .form-check-input { width: 1.15rem; height: 1.15rem; margin-top: 0.15rem; } .role-permission-checkbox .form-check-label { padding-left: 0.25rem; }`}</style>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div><h5 className="mb-1">Checklist Hak Akses</h5></div>
              <span className="badge bg-primary">{selectedPermissionIds.length} dipilih</span>
            </div>
            {permissions.length === 0 ? <CAlert color="info">Belum ada permission aktif yang tersedia.</CAlert> : (
              <div className="d-flex flex-column gap-3">
                {groupedPermissions.map((group) => (
                  <CCard key={group.name} className="border">
                    <CCardHeader className="py-2"><strong>{group.name}</strong></CCardHeader>
                    <CCardBody className="d-flex flex-column gap-3">
                      {group.features.map((feature) => (
                        <div key={feature.name}>
                          <div className="fw-semibold mb-2">{feature.name}</div>
                          <CRow className="g-2">
                            {feature.items.map((permission) => (
                              <CCol xs={12} sm={6} md={4} key={permission.id}>
                                <CFormCheck
                                  className="fs-6 role-permission-checkbox"
                                  id={`role-permission-${permission.id}`}
                                  label={permission.action_name ? `${permission.name} (${permission.action_name})` : permission.name}
                                  checked={selectedPermissionIds.includes(permission.id)}
                                  onChange={(event) => togglePermission(permission.id, event.target.checked)}
                                />
                              </CCol>
                            ))}
                          </CRow>
                        </div>
                      ))}
                    </CCardBody>
                  </CCard>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={onCancel}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
export default RoleForm
