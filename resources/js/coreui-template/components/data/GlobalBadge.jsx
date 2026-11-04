import React from 'react'
import { CBadge } from '@coreui/react'

const statusColors = { active: 'success', aktif: 'success', inactive: 'secondary', nonaktif: 'secondary', pending: 'warning', completed: 'primary' }
const GlobalBadge = ({ status, color, className = '', children, ...props }) => {
  const resolvedColor = color || statusColors[String(status || '').toLowerCase()] || 'secondary'
  const label = children ?? (status ? String(status) : '')
  return <CBadge color={resolvedColor} className={`global-badge ${className}`.trim()} {...props}>{label}</CBadge>
}

export default GlobalBadge
