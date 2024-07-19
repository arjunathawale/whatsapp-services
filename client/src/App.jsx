
import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Client from './pages/Client'
import PricingPlan from './pages/PricingPlan'
import Template from './pages/Template'
import Login from './pages/Login'
import { useSelector } from 'react-redux'
import ProtectedRoute from './components/ProtectedRoute'
import BulkSender from './pages/BulkSender'
import BulkSenderDetails from './pages/BulkSenderDetails'
import MessageHistory from './pages/MessageHistory'
import Profile from './pages/Profile'
import PurchasePlan from './pages/PurchasePlan'
import ManageFiles from './pages/ManageFiles'


function App() {
  const [open, setOpen] = useState(true)
  const { isLoggedIn, userData, role } = useSelector((state) => state.user)
  return (
    <div className="flex h-screen">
      {
        (isLoggedIn) && <div className={`bg-dark-purple h-screen p-5 pr-0 pl-2 ${open ? "w-72" : "w-20"} duration-300`}>
          <Sidebar sideBar={{ open, setOpen }} />
        </div>
      }

      <div className='p-2 w-full overflow-auto'>
        <Routes>
          <Route path='/' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["ADMIN", "CLIENT"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/clients' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["ADMIN"]}>
              <Client />
            </ProtectedRoute>}
          />
          <Route path='/plans' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["ADMIN"]}>
              <PricingPlan />
            </ProtectedRoute>}
          />
          <Route path='/templates' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <Template />
            </ProtectedRoute>
          } />
          <Route path='/message-history' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <MessageHistory />
            </ProtectedRoute>
          } />
          <Route path='/bulk-sender' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <BulkSender />
            </ProtectedRoute>
          } />
          <Route path='/manage-files' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <ManageFiles />
            </ProtectedRoute>
          } />
          {/* <Route path='/chatbot-automation' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <BulkSender />
            </ProtectedRoute>
          } /> */}
          <Route path='/bulk-sender-details' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <BulkSenderDetails />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/purchase-plan' element={
            <ProtectedRoute isLoggedIn={isLoggedIn} roles={["CLIENT"]}>
              <PurchasePlan />
            </ProtectedRoute>
          } />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<div className='p-5 justify-center h-full w-full'>Page Not Found</div>} />
        </Routes>
      </div>
    </div >
  )
}

export default App
