import React from 'react'
import { CAlert } from '@coreui/react'

const RolePageLayout = ({ title, description, successMessage, errorMessage, onDismissSuccess, onDismissError, children }) => (
  <div className="role-page-layout mb-4">
    <div className="mb-3">
      <h2 className="fs-4 mb-1">{title}</h2>
    </div>
    {successMessage && <CAlert color="success" dismissible onClose={onDismissSuccess}>{successMessage}</CAlert>}
    {errorMessage && <CAlert color="danger" dismissible onClose={onDismissError}>{errorMessage}</CAlert>}
    {children}
  </div>
)
export default RolePageLayout
