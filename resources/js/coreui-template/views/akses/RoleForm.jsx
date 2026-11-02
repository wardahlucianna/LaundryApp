import React, { useEffect, useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSwitch, CRow, CSpinner } from '@coreui/react'

const RoleForm = ({ role, saving, onSave, onCancel }) => {
  const [values, setValues] = useState({ name: '', code: '', is_active: true })
  const [validation, setValidation] = useState('')
  useEffect(() => {
    setValues({ name: role?.name || '', code: role?.code || '', is_active: role ? Boolean(role.is_active) : true })
    setValidation('')
  }, [role])
  const submit = async (event) => {
    event.preventDefault()
    setValidation('')
    if (!values.name.trim() || !values.code.trim()) { setValidation('Nama dan kode role wajib diisi.'); return }
    await onSave({ name: values.name.trim(), code: values.code.trim(), is_active: values.is_active })
  }
  return (
    <CCard className="role-panel role-form-card mb-4">
      <CCardHeader><div><strong>{role ? 'Edit Role' : 'Tambah Role'}</strong><div className="small text-body-secondary mt-1">Lengkapi informasi peran dan statusnya.</div></div></CCardHeader>
      <CCardBody>
        {validation && <CAlert color="warning">{validation}</CAlert>}
        <CForm onSubmit={submit}>
          <CRow className="g-3">
            <CCol xs={12} md={6}><CFormInput label="Nama Role" placeholder="Contoh: Administrator" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required maxLength={100} /></CCol>
            <CCol xs={12} md={6}><CFormInput label="Kode Role" placeholder="Contoh: ADMIN" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={60} pattern="[A-Za-z0-9_-]+" /><div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div></CCol>
            <CCol xs={12} md={6}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3 h-100"><div className="fw-semibold">Status</div><CFormSwitch size="lg" label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} /></div></CCol>
          </CRow>
          <div className="d-flex justify-content-end gap-2 mt-4"><CButton color="secondary" size="sm" variant="outline" type="button" disabled={saving} onClick={onCancel}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
export default RoleForm
