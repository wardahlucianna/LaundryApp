import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'

/**
 * Reusable confirmation popup.
 * Props: visible, title, message, confirmText, cancelText, color, loading, onConfirm, onCancel.
 */
const ConfirmModal = ({
  visible,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  color = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <CModal visible={visible} onClose={onCancel} alignment="center" backdrop="static">
    <CModalHeader>
      <CModalTitle>{title}</CModalTitle>
    </CModalHeader>
    <CModalBody>{message}</CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" disabled={loading} onClick={onCancel}>{cancelText}</CButton>
      <CButton color={color} disabled={loading} onClick={onConfirm}>
        {loading ? <><CSpinner size="sm" className="me-2" />Memproses...</> : confirmText}
      </CButton>
    </CModalFooter>
  </CModal>
)

export default ConfirmModal
