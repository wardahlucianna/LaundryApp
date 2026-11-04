import React from 'react'
import { CFormSelect } from '@coreui/react'

const GlobalSelect = ({ size = 'sm', className = '', ...props }) => (
  <CFormSelect size={size} className={`global-select ${className}`.trim()} {...props} />
)

export default GlobalSelect
