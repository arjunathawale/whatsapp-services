import { configureStore } from "@reduxjs/toolkit";
import clientSlice  from "./clientSlice";
import bulkSenderSlice from "./bulkSenderSlice";


 const store = configureStore({
    reducer: {
        user: clientSlice,
        bulkData: bulkSenderSlice
    }
})

export default store