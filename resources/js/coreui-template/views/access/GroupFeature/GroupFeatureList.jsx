import React from 'react'
import { Navigate } from 'react-router-dom'

// Daftar Group Feature sudah digabungkan ke halaman Management Fitur.
// File ini dipertahankan agar tidak dihapus dari struktur project.
const GroupFeatureManagement = () => <Navigate to="/permissions" replace />

export default GroupFeatureManagement
