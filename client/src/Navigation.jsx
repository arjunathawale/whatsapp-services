import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Client from './pages/Client'
import PricingPlan from './pages/PricingPlan'

const Navigation = () => {
  return (<>
    <BrowserRouter basename='/app'>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/clients' element={<Client />} />
        {/* <Route path='/plans' element={<PricingPlan />} /> */}
      </Routes>
    </BrowserRouter>
  </>)
}

export default Navigation
