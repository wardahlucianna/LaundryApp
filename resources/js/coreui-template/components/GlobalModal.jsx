import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import GlobalButton from './GlobalButton'

const GlobalModal = ({
  title,
  open = false,
  onClose,
  children,
  showFooter = false,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  confirmColor = 'primary',
  confirmDisabled = false,
  size = 'md',
  ...props
}) => (
  <CModal visible={open} onClose={onClose} size={size} {...props}>
    <CModalHeader>
      <CModalTitle>{title}</CModalTitle>
    </CModalHeader>
    <CModalBody>{children}</CModalBody>
    {showFooter && (
      <CModalFooter>
        <GlobalButton color="secondary" variant="outline" onClick={onClose}>
          {cancelLabel}
        </GlobalButton>
        {onConfirm && (
          <GlobalButton color={confirmColor} onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </GlobalButton>
        )}
      </CModalFooter>
    )}
  </CModal>
)

export default GlobalModal
