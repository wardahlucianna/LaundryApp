import React from 'react'

const FormActions = ({ children, className = '', align = 'end' }) => (
  <div className={`global-form-actions d-flex flex-wrap justify-content-${align} gap-2 mt-4 ${className}`.trim()}>
    {children}
  </div>
)

export default FormActions
