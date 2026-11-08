import React from 'react'
import FeedbackAlert from '../feedback/FeedbackAlert'

/**
 * Shared page frame for master modules.
 * Shared master page wrapper without a top page title; each screen keeps
 * its own content, validation, actions, and workflow.
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
    {headingActions && (
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        {headingActions}
      </div>
    )}
    {children}
  </div>
)

export default MasterPageLayout
