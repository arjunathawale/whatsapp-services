import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'


const ProtectedRoute = ({ isLoggedIn, children, roles }) => {
    const { role } = useSelector((state) => state.user)
    if (isLoggedIn && roles.includes(role)) {
        return <>{children}</>
    } else if (isLoggedIn && !roles.includes(role)) {
        return <Navigate to="/" />
    } else {
        return <Navigate to="/login" replace />
    }
}

export default ProtectedRoute
