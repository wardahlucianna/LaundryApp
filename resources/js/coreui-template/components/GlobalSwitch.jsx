import React from 'react'
import { CFormSwitch } from '@coreui/react'

const GlobalSwitch = ({ size = 'sm', className = '', ...props }) => (
  <CFormSwitch size={size} className={`global-switch ${className}`.trim()} {...props} />
)

export default GlobalSwitch
