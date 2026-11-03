import React from 'react'
import {
  CAlert, CButton, CForm, CFormInput, CFormSelect, CFormSwitch, CModal,
  CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner,
} from '@coreui/react'

const FeatureForm = ({ visible, onClose, saving, editingFeature, form, setForm, groups, error, onSubmit }) => (
  <CModal visible={visible} onClose={() => !saving && onClose()} backdrop="static">
    <CModalHeader><CModalTitle>{editingFeature ? 'Edit Fitur' : 'Tambah Fitur'}</CModalTitle></CModalHeader>
    <CForm onSubmit={onSubmit}>
      <CModalBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        <div className="mb-3"><CFormSelect label="Kelompok Fitur" value={form.permission_group_id} onChange={(e) => setForm((current) => ({ ...current, permission_group_id: e.target.value }))} required>
          <option value="">Pilih kelompok fitur</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
        </CFormSelect></div>
        <div className="mb-3"><CFormInput label="Nama Fitur" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required maxLength={120} placeholder="Contoh: Manajemen Fitur" /></div>
        <div className="mb-3"><CFormInput label="Kode Fitur" value={form.code} onChange={(e) => setForm((current) => ({ ...current, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))} required maxLength={80} pattern="[A-Za-z0-9_-]+" placeholder="Contoh: FEATURES" /><div className="form-text">Gunakan huruf, angka, tanda minus, atau underscore.</div></div>
        <div className="mb-3"><CFormInput label="Path Menu" value={form.path} onChange={(e) => setForm((current) => ({ ...current, path: e.target.value }))} maxLength={255} placeholder="Contoh: /permissions" /></div>
        <div className="mb-3"><CFormSelect label="Jenis Menu" value={form.menu_type} onChange={(e) => setForm((current) => ({ ...current, menu_type: e.target.value }))} required><option value="sidebar">Sidebar</option><option value="topbar">Topbar</option></CFormSelect></div>
        <div className="rounded border p-3 d-flex align-items-center justify-content-between"><div><div className="fw-semibold">Status</div><small className="text-body-secondary">Aktifkan fitur agar ditampilkan sesuai hak akses role.</small></div><CFormSwitch label={form.is_active ? 'Aktif' : 'Nonaktif'} checked={form.is_active} onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))} /></div>
      </CModalBody>
      <CModalFooter><CButton color="secondary" variant="outline" size="sm" type="button" disabled={saving} onClick={onClose}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></CModalFooter>
    </CForm>
  </CModal>
)

export default FeatureForm
