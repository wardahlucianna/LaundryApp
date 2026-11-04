import React from 'react'
import { CFormInput } from '@coreui/react'

const GlobalSearch = ({ value = '', onChange, placeholder = 'Cari data...', size = 'sm', className = '', ...props }) => (
  <CFormInput type="search" size={size} value={value} onChange={onChange} placeholder={placeholder}
    aria-label="Pencarian data" className={`global-search ${className}`.trim()} {...props} />
)

export default GlobalSearch
