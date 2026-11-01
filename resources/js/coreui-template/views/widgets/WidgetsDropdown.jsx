import React from 'react'
import { CCol, CRow, CWidgetStatsA } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop } from '@coreui/icons'

const WidgetsDropdown = (props) => {
  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color="primary"
          value={<>26K <span className="fs-6 fw-normal">(-12.4% <CIcon icon={cilArrowBottom} />)</span></>}
          title="Customers"
          chart={<div className="small text-white opacity-75">Customer overview</div>}
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color="info"
          value={<> $6.200 <span className="fs-6 fw-normal">(40.9% <CIcon icon={cilArrowTop} />)</span></>}
          title="Revenue"
          chart={<div className="small text-white opacity-75">Revenue overview</div>}
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color="warning"
          value={<>2.49% <span className="fs-6 fw-normal">(84.7% <CIcon icon={cilArrowTop} />)</span></>}
          title="Orders"
          chart={<div className="small text-white opacity-75">Order overview</div>}
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color="danger"
          value={<>44K <span className="fs-6 fw-normal">(-23.6% <CIcon icon={cilArrowBottom} />)</span></>}
          title="Pending"
          chart={<div className="small text-white opacity-75">Pending overview</div>}
        />
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown
