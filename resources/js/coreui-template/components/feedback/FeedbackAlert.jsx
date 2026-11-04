import React from 'react'
import { CAlert } from '@coreui/react'

/** Consistent dismissible feedback messages for master pages. */
const FeedbackAlert = ({ notice = '', error = '', onClearNotice, onClearError }) => (
  <>
    {notice && (
      <CAlert color="success" dismissible onClose={onClearNotice}>
        {notice}
      </CAlert>
    )}

    {error && (
      <CAlert color="danger" dismissible onClose={onClearError}>
        {error}
      </CAlert>
    )}
  </>
)

export default FeedbackAlert
