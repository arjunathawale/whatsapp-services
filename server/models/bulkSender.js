const mongoose = require('mongoose');
const mm = require("../services/global")

const bulkSenderSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: [true, 'templateId is required']
    },
    templateName: {
        type: String,
        // required: [true, 'campaignName Name is required']
    },
    templateLanguages: {
        type: String,
        // required: [true, 'campaignName Name is required']
    },
    templateCategory: {
        type: String,
        // required: [true, 'campaignName Name is required']
    },
    campaignName: {
        type: String,
        // required: [true, 'campaignName Name is required']
    },
    isScheduled: {
        type: Boolean,
        default: false
    },
    scheduledDateTime: {
        type: Date,
        default: null
    },
    currentStatus: {
        type: String,
        default: 'Pending'
    }
}, {
    timestamps: true
})




module.exports = mongoose.model('bulkSender', bulkSenderSchema)