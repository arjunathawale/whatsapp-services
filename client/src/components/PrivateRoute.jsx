import React from 'react'
// import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
const PrivateRoute = ({ isLoggedIn, children }) => {
    const { role } = useSelector((state) => state.user)

    // console.log("role", role);
    if (isLoggedIn) {
        return <>{children}</>
    } else {
        return <Navigate to="/login" />
    }
}

export default PrivateRoute
