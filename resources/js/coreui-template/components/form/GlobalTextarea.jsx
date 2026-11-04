import React from 'react'
import { CFormTextarea } from '@coreui/react'

const GlobalTextarea = ({ size = 'sm', className = '', ...props }) => (
  <CFormTextarea size={size} className={`global-textarea ${className}`.trim()} {...props} />
)

export default GlobalTextarea
