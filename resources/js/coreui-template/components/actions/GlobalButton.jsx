import React from 'react'
import { CButton } from '@coreui/react'

const GlobalButton = ({ size = 'sm', color = 'primary', className = '', ...props }) => (
  <CButton size={size} color={color} className={`global-button ${className}`.trim()} {...props} />
)

export default GlobalButton
