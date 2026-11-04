import React from 'react'
import { CForm } from '@coreui/react'

const GlobalForm = ({ className = '', children, ...props }) => (
  <CForm className={`global-form ${className}`.trim()} {...props}>
    {children}
  </CForm>
)

export default GlobalForm
