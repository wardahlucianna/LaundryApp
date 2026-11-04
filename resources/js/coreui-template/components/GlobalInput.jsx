import React from 'react'
import { CFormInput } from '@coreui/react'

const GlobalInput = ({ size = 'sm', className = '', ...props }) => (
  <CFormInput size={size} className={`global-input ${className}`.trim()} {...props} />
)

export default GlobalInput
