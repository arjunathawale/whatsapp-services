const mongoose = require('mongoose');
const mm = require("../services/global")

const bulkSenderDetailsSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    bulkMasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bulkMaster',
        required: [true, 'bulkMasterId is required']
    },
    clientUserId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'ClientUserContact',
        // required: [true, 'clientUserId is required']
    },
    mobileNumber: {
        type: String,
        required: [true, 'mobileNumber is required']
    },
    wpMessageId: {
        type: String,
        default: null
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    templateComponent: {
        type: Array,
        default: []
    },
    messageStatus: {
        type: String,
        default: 'Pending'
    },
    sentDateTime: {
        type: Date,
        default: null
    },
    deliveredDateTime: {
        type: Date,
        default: null
    },
    seenDateTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})




module.exports = mongoose.model('bulkSenderDetails', bulkSenderDetailsSchema)