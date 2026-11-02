import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList, cilPlus, cilShieldAlt } from '@coreui/icons'

const Role = () => {
  const navigate = useNavigate()
  const items = [
    { title: 'List Role', description: 'Lihat, cari, edit, dan kelola data role yang terdaftar.', icon: cilList, path: '/roles/list', action: 'Buka List' },
    { title: 'Form Role', description: 'Tambahkan role baru dan atur informasi role.', icon: cilPlus, path: '/roles/form', action: 'Buka Form' },
  ]
  return (
    <div style={{ fontSize: '0.9rem' }}>
      <CRow className="mb-3"><CCol><h2 className="fs-4 mb-1">Manajemen Role</h2><div className="text-body-secondary">Home Manajemen Role</div></CCol></CRow>
      <CCard className="mb-4">
        <CCardHeader><strong><CIcon icon={cilShieldAlt} className="me-2" />Home</strong></CCardHeader>
        <CCardBody>
          <p className="text-body-secondary mb-3">Pilih menu di bawah untuk melanjutkan pengelolaan role.</p>
          <CRow className="g-3">
            {items.map((item) => (
              <CCol xs={12} md={6} key={item.path}>
                <CCard role="button" className="h-100 border" style={{ cursor: 'pointer' }} onClick={() => navigate(item.path)}>
                  <CCardBody className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded p-3"><CIcon icon={item.icon} size="xl" /></div>
                    <div className="flex-grow-1"><div className="fw-semibold mb-1">{item.title}</div><div className="text-body-secondary small">{item.description}</div><div className="text-primary small mt-2 fw-semibold">{item.action} →</div></div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  )
}
export default Role
