import React from 'react'
import { CFormLabel, CFormFeedback } from '@coreui/react'

const FormField = ({ label, htmlFor, required = false, error, hint, children, className = '' }) => (
  <div className={`global-form-field ${className}`.trim()}>
    {label && (
      <CFormLabel htmlFor={htmlFor} className="global-form-field-label">
        {label}{required && <span className="text-danger ms-1">*</span>}
      </CFormLabel>
    )}
    {children}
    {error && <CFormFeedback className="d-block" invalid>{error}</CFormFeedback>}
    {!error && hint && <div className="form-text">{hint}</div>}
  </div>
)

export default FormField
