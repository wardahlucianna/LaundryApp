import React from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'

const MasterPageCard = ({ title, headerActions, children, className = '', bodyClassName = '', ...props }) => (
  <CCard className={`master-page-card mb-4 ${className}`.trim()} {...props}>
    {(title || headerActions) && (
      <CCardHeader className="master-page-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        {title && <strong>{title}</strong>}
        {headerActions}
      </CCardHeader>
    )}
    <CCardBody className={bodyClassName}>{children}</CCardBody>
  </CCard>
)

export default MasterPageCard
