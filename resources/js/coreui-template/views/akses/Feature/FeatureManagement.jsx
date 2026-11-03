import React, { useCallback, useEffect, useState } from 'react'
import {
  CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CForm,
  CFormInput, CFormSelect, CFormSwitch, CModal, CModalBody, CModalFooter,
  CModalHeader, CModalTitle, CRow, CSpinner, CTable, CTableBody,
  CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilSearch, cilTrash, cilReload } from '@coreui/icons'

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

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }
  const resetSearch = () => {
    setSearchInput('')
    setPage(1)
    setSearch('')
  }
  const showingStart = pagination.total === 0 ? 0 : (pagination.current_page - 1) * 10 + 1
  const showingEnd = Math.min(pagination.current_page * 10, pagination.total)

  return (
    <div className="role-page-layout mb-4">
      <div className="mb-3"><h2 className="fs-4 mb-1">Management Fitur</h2></div>
      {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}
      {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
      <CCard className="role-panel role-list-panel mb-4">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <strong className="fs-5">Daftar Fitur</strong>
          <CButton color="primary" size="sm" className="role-compact-button" onClick={openCreate} disabled={groups.length === 0}>
            <CIcon icon={cilPlus} size="sm" className="me-1" />Tambah Fitur
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3"><CCol xs={12} md={8} lg={6}><div className="d-flex gap-2 w-100">
            <CFormInput placeholder="Cari nama, kode, atau kelompok fitur" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applySearch() }} aria-label="Cari fitur" className="flex-grow-1" />
            <CButton color="primary" size="sm" className="role-compact-button" onClick={applySearch}><CIcon icon={cilSearch} size="sm" className="me-1" />Cari</CButton>
            <CButton color="secondary" variant="outline" size="sm" className="role-compact-button" onClick={resetSearch}><CIcon icon={cilReload} size="sm" className="me-1" />Reset</CButton>
          </div></CCol></CRow>
          <CTable hover responsive align="middle" className="role-table">
            <CTableHead><CTableRow>
              <CTableHeaderCell style={{ width: '60px' }}>No.</CTableHeaderCell>
              <CTableHeaderCell>Nama Fitur</CTableHeaderCell>
              <CTableHeaderCell>Kelompok</CTableHeaderCell>
              <CTableHeaderCell>Kode</CTableHeaderCell>
              <CTableHeaderCell>Path</CTableHeaderCell>
              <CTableHeaderCell>Jenis Menu</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Jumlah Aksi</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Aksi</CTableHeaderCell>
            </CTableRow></CTableHead>
            <CTableBody>
              {loading ? <CTableRow><CTableDataCell colSpan={9} className="text-center py-4"><CSpinner size="sm" className="me-2" />Memuat data...</CTableDataCell></CTableRow>
                : features.length === 0 ? <CTableRow><CTableDataCell colSpan={9} className="text-center text-body-secondary py-4">Data fitur tidak ditemukan.</CTableDataCell></CTableRow>
                  : features.map((feature, index) => <CTableRow key={feature.id}>
                    <CTableDataCell>{(pagination.current_page - 1) * 10 + index + 1}</CTableDataCell>
                    <CTableDataCell><div className="fw-semibold">{feature.name}</div></CTableDataCell>
                    <CTableDataCell>{feature.group?.name || groups.find((group) => group.id === feature.permission_group_id)?.name || '—'}</CTableDataCell>
                    <CTableDataCell><small>{feature.code}</small></CTableDataCell>
                    <CTableDataCell><small>{feature.path || '—'}</small></CTableDataCell>
                    <CTableDataCell>{feature.menu_type === 'topbar' ? 'Topbar' : 'Sidebar'}</CTableDataCell>
                    <CTableDataCell className="text-center">{feature.actions_count ?? 0}</CTableDataCell>
                    <CTableDataCell><CBadge color={feature.is_active ? 'success' : 'secondary'}>{feature.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CTableDataCell>
                    <CTableDataCell className="text-center"><div className="d-inline-flex gap-2">
                      <CButton color="primary" variant="outline" size="sm" onClick={() => openEdit(feature)} title="Edit fitur" aria-label={`Edit ${feature.name}`}><CIcon icon={cilPencil} size="sm" /></CButton>
                      <CButton color="danger" variant="outline" size="sm" onClick={() => deleteFeature(feature)} title="Hapus fitur" aria-label={`Hapus ${feature.name}`}><CIcon icon={cilTrash} size="sm" /></CButton>
                    </div></CTableDataCell>
                  </CTableRow>)}
            </CTableBody>
          </CTable>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small className="text-body-secondary">Menampilkan {showingStart}–{showingEnd} dari {pagination.total} data</small>
            <div className="d-flex gap-2">
              <CButton color="secondary" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Sebelumnya</CButton>
              <CButton color="secondary" variant="outline" size="sm" disabled={page >= pagination.last_page || loading} onClick={() => setPage((current) => current + 1)}>Berikutnya</CButton>
            </div>
          </div>
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={() => !saving && setModalVisible(false)} backdrop="static">
        <CModalHeader><CModalTitle>{editingFeature ? 'Edit Fitur' : 'Tambah Fitur'}</CModalTitle></CModalHeader>
        <CForm onSubmit={saveFeature}>
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
          <CModalFooter><CButton color="secondary" variant="outline" size="sm" type="button" disabled={saving} onClick={() => setModalVisible(false)}>Batal</CButton><CButton color="primary" size="sm" type="submit" disabled={saving}>{saving ? <><CSpinner size="sm" className="me-2" />Menyimpan...</> : 'Simpan'}</CButton></CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default FeatureManagement
