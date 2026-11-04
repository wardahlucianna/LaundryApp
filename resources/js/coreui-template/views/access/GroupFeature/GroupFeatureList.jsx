import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAccessFeaturePath } from '../../../utils/accessNavigation'

// Legacy entry redirects to the Group Feature view using the DB menu path.
const GroupFeatureManagement = () => {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    let active = true
    getAccessFeaturePath(['Manajemen Fitur', 'Management Fitur'])
      .then((basePath) => {
        if (active && basePath) setTarget(`${basePath}?view=groups`)
      })
      .catch(() => {
        if (active) setTarget(null)
      })

    return () => {
      active = false
    }
  }, [])

  return target ? <Navigate to={target} replace /> : null
}

export default GroupFeatureManagement
