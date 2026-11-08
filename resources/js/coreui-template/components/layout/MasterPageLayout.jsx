import React from 'react'
import FeedbackAlert from '../feedback/FeedbackAlert'

/**
 * Shared page frame for master modules.
 * Only the page heading and outer spacing are standardized; each screen keeps
 * its own fields, content, validation, actions, and workflow.
 */
const MasterPageLayout = ({
  title,
  description,
  headingActions,
  children,
  className = '',
  notice = '',
  error = '',
  onClearNotice,
  onClearError,
}) => (
  <div className={`master-page-layout role-page-layout mb-4 ${className}`.trim()}>
    <FeedbackAlert
      notice={notice}
      error={error}
      onClearNotice={onClearNotice}
      onClearError={onClearError}
    />
    {children}
  </div>
)

export default MasterPageLayout
