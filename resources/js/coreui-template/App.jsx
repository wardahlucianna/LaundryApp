import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

export default function App() {
  const { isColorModeSet, setColorMode } = useColorModes('sunrise-laundry-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    if (!isColorModeSet()) setColorMode(storedTheme || 'light')
  }, [])

  return (
    <HashRouter>
      <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
        <Routes><Route path="*" element={<DefaultLayout />} /></Routes>
      </Suspense>
    </HashRouter>
  )
}