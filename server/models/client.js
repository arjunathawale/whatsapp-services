const mongoose = require('mongoose');
const mm = require("../services/global")

const clientSchema = new mongoose.Schema({
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: [true, 'role is required']

    },
    clientname: {
        type: String,
        required: [true, 'Client Name is required'],
    },
    gstNo: {
        type: String,
        // unique: [true, 'GST Number should be unique']
    },
    panNo: {
        type: String,
        // required: [true, 'PAN Number is required'],
        // unique: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    emailId: {
        type: String,
        required: [true, 'Email Id is required'],
        unique: [true, 'Email Id should be unique'],
        maxlength: 64
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile Number is required'],
        unique: true,
        maxlength: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    activePlanId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxlength: 128,
    },
    clientSecretKey: {
        type: String,
        required: [true, 'Client Secret Key is required'],
        maxlength: 64,
        // unique: true,W
        // default: generateSecretKey(64)
    }

}, { timestamps: true })


function generateSecretKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';

    for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters[randomIndex];
    }

    return key;
}


module.exports = mongoose.model('Client', clientSchema)