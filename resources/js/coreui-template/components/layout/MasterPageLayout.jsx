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
    {(title || description || headingActions) && (
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          {title && <h4 className="mb-1 fw-bold">{title}</h4>}
          {description && <div className="text-body-secondary">{description}</div>}
        </div>
        {headingActions && (
          <div className="d-flex align-items-center flex-wrap gap-2">
            {headingActions}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
)

export default MasterPageLayout
