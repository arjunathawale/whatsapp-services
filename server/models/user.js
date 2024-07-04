const mongoose = require("mongoose");
const mm = require("../services/global")
const userSchema = new mongoose.Schema({
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: [true, 'Role is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: 64
    },
    emailId: {
        type: String,
        required: [true, 'Email Id is required'],
        unique: true,
        maxlength: 64
    },
    mobileNo: {
        type: String,
        required: [true, 'MobileNo is required'],
        unique: true,
        maxlength: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxlength: 16
    },
    loginDateTime:{
        type: String
    },
    createdAt: {
        type: String,
        default: mm.getCurrentDate()
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model("User", userSchema)