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
    <div className="master-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <div className="min-w-0">
        <h2 className="master-page-title fs-4 mb-1">{title}</h2>
        {description && <p className="master-page-description text-body-secondary mb-0">{description}</p>}
      </div>
      {headingActions && <div className="master-page-heading-actions d-flex flex-wrap align-items-center gap-2">{headingActions}</div>}
    </div>
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
