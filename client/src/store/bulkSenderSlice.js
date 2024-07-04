import { createSlice } from "@reduxjs/toolkit";

// const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false
// const userData = JSON.parse(localStorage.getItem("userData")) || {}
// const role = localStorage.getItem("role") || ""
// const userCrendentials = JSON.parse(localStorage.getItem("userCrendentials")) || {}


const initialState = {
    bulkData: [],
}

const bulkSenderSlice = createSlice({
    name: "bulkData",
    initialState,
    reducers: {
        setBulkData: (state, action) => {
            console.log("payload", action.payload);
            state.bulkData = action.payload
        }
    }
})

export const { setBulkData } = bulkSenderSlice.actions;
export default bulkSenderSlice.reducer;