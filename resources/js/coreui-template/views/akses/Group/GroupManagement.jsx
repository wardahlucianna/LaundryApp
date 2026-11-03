import React, { useCallback, useEffect, useState } from 'react'
import { CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CFormSwitch, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash, cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags } from '@coreui/icons'

const apiBase = (() => { const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); return base ? (base.endsWith('/api') ? base : base + '/api') : '/api' })()
const icons = { cilFolderOpen, cilPeople, cilBasket, cilCash, cilSettings, cilChartLine, cilSpeedometer, cilBuilding, cilTags }
const GroupManagement = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState({ name: '', description: '', icon: 'cilFolderOpen', is_active: true })
  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || ''
    const res = await fetch(apiBase + path, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + token, ...(options.headers || {}) } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.errors ? Object.values(data.errors).flat().join(' ') : data.message || 'Permintaan gagal.')
    return data
  }, [])
  const load = useCallback(async () => { setLoading(true); try { const p = await request('/permission-groups?per_page=100'); setGroups(p.data || []); setError('') } catch (e) { setError(e.message) } finally { setLoading(false) } }, [request])
  useEffect(() => { load() }, [load])
  const open = (group = null) => { setEditing(group); setValues({ name: group?.name || '', description: group?.description || '', icon: group?.icon || 'cilFolderOpen', is_active: group ? Boolean(group.is_active) : true }); setModal(true) }
  const save = async (e) => { e.preventDefault(); try { await request(editing ? '/permission-groups/' + editing.id : '/permission-groups', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(values) }); setModal(false); setNotice(editing ? 'Kelompok berhasil diperbarui.' : 'Kelompok berhasil ditambahkan.'); await load() } catch (e) { setError(e.message) } }
  const remove = async (g) => { if (!window.confirm('Hapus kelompok "' + g.name + '"?')) return; try { await request('/permission-groups/' + g.id, { method: 'DELETE' }); setNotice('Kelompok dihapus.'); await load() } catch (e) { setError(e.message) } }
  return <div className="role-list-page role-page-layout mb-4">
    <div className="mb-3"><h2 className="fs-4 mb-1">Management Group</h2></div>
    {notice && <CAlert color="success" dismissible onClose={() => setNotice('')}>{notice}</CAlert>}{error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
    <CCard className="role-panel role-list-panel mb-4"><CCardHeader className="d-flex justify-content-between align-items-center"><strong className="fs-5">Daftar Group</strong><CButton color="primary" size="sm" onClick={() => open()}><CIcon icon={cilPlus} className="me-1" />Tambah Group</CButton></CCardHeader>
      <CCardBody><CTable hover responsive align="middle" className="role-table"><CTableHead><CTableRow><CTableHeaderCell style={{width:60}}>No.</CTableHeaderCell><CTableHeaderCell>Icon</CTableHeaderCell><CTableHeaderCell>Nama Group</CTableHeaderCell><CTableHeaderCell>Deskripsi</CTableHeaderCell><CTableHeaderCell className="text-center">Jumlah Fitur</CTableHeaderCell><CTableHeaderCell>Status</CTableHeaderCell><CTableHeaderCell className="text-center">Aksi</CTableHeaderCell></CTableRow></CTableHead><CTableBody>{loading ? <CTableRow><CTableDataCell colSpan={7} className="text-center"><CSpinner size="sm" /> Memuat...</CTableDataCell></CTableRow> : groups.length ? groups.map((g,i) => <CTableRow key={g.id}><CTableDataCell>{i+1}</CTableDataCell><CTableDataCell><CIcon icon={icons[g.icon] || cilFolderOpen} size="xl" /></CTableDataCell><CTableDataCell className="fw-semibold">{g.name}</CTableDataCell><CTableDataCell>{g.description || '—'}</CTableDataCell><CTableDataCell className="text-center">{g.features_count ?? 0}</CTableDataCell><CTableDataCell><CBadge color={g.is_active ? 'success' : 'secondary'}>{g.is_active ? 'Aktif' : 'Nonaktif'}</CBadge></CTableDataCell><CTableDataCell className="text-center"><CButton color="primary" variant="outline" size="sm" className="me-2" onClick={() => open(g)} title="Edit"><CIcon icon={cilPencil}/></CButton><CButton color="danger" variant="outline" size="sm" onClick={() => remove(g)} title="Hapus"><CIcon icon={cilTrash}/></CButton></CTableDataCell></CTableRow>) : <CTableRow><CTableDataCell colSpan={7} className="text-center py-4">Group belum tersedia.</CTableDataCell></CTableRow>}</CTableBody></CTable></CCardBody></CCard>
    <CModal visible={modal} onClose={() => setModal(false)} alignment="center"><CModalHeader><CModalTitle>{editing ? 'Edit Group' : 'Tambah Group'}</CModalTitle></CModalHeader><CModalBody><CForm onSubmit={save}><CRow className="g-3"><CCol xs={12}><CFormInput label="Nama Group" value={values.name} onChange={e => setValues(v => ({...v,name:e.target.value}))} maxLength={120} required /></CCol><CCol xs={12}><CFormInput label="Deskripsi" value={values.description} onChange={e => setValues(v => ({...v,description:e.target.value}))} maxLength={500} /></CCol><CCol xs={12}><CFormSelect label="Icon Group" value={values.icon} onChange={e => setValues(v => ({...v,icon:e.target.value}))} options={Object.keys(icons).map(k => ({label:k,value:k}))} /><div className="mt-2 d-flex align-items-center gap-2">Preview: <CIcon icon={icons[values.icon] || cilFolderOpen} size="xl"/></div></CCol><CCol xs={12}><div className="role-status-box d-flex align-items-center justify-content-between rounded p-3"><div><div className="fw-semibold mb-1">Status</div><div className="role-status-note">Aktifkan group agar dapat digunakan.</div></div><CFormSwitch label={values.is_active ? 'Aktif' : 'Nonaktif'} checked={values.is_active} onChange={e => setValues(v => ({...v,is_active:e.target.checked}))}/></div></CCol></CRow><CModalFooter className="px-0 pb-0"><CButton color="secondary" variant="outline" size="sm" type="button" onClick={() => setModal(false)}>Batal</CButton><CButton color="primary" size="sm" type="submit">Simpan</CButton></CModalFooter></CForm></CModalBody></CModal>
  </div>
}
export default GroupManagement
