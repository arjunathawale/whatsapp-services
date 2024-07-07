import { createSlice } from "@reduxjs/toolkit";

const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false
const userData = JSON.parse(localStorage.getItem("userData")) || {}
const role = localStorage.getItem("role") || ""
const authToken = localStorage.getItem("authToken") || ""
const userCrendentials = JSON.parse(localStorage.getItem("userCrendentials")) || {}
const activePlanData = JSON.parse(localStorage.getItem("activePlanData")) || {}


const initialState = {
    isLoggedIn: isLoggedIn,
    userData: userData,
    userCrendentials: userCrendentials,
    role: role,
    authToken: authToken,
    activePlanData: activePlanData,
}

const clientSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.isLoggedIn = action.payload
            localStorage.setItem("isLoggedIn", action.payload)
        },
        setUserData: (state, action) => {
            state.userData = action.payload
            localStorage.setItem("userData", JSON.stringify(action.payload))
        },
        setRole: (state, action) => {
            state.role = action.payload
            localStorage.setItem("role", action.payload)
        },
        setAuthToken: (state, action) => {
            state.authToken = action.payload
            localStorage.setItem("authToken", action.payload)
        },
        setUserCrendentials: (state, action) => {
            state.userCrendentials = action.payload
            localStorage.setItem("userCrendentials", JSON.stringify(action.payload))
        },
        setPlanData: (state, action) => {
            state.activePlanData = action.payload
            localStorage.setItem("activePlanData", JSON.stringify(action.payload))
        }
    }
})

export const { setLogin, setUserData, setRole, setUserCrendentials, setAuthToken, setPlanData } = clientSlice.actions;
export default clientSlice.reducer;