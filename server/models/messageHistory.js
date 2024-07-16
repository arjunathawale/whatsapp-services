const mongoose = require('mongoose');
const mm = require("../services/global");

const messageHistorySchema = new mongoose.Schema({
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
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlan',
        required: [true, 'planId is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientUserContact',
        required: [true, 'userId is required']
    },
    wpMessageId: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    botId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    sender: {
        type: String,
        maxlength: 12
    },
    messageType: {
        type: String,
        maxlength: 64
    },
    messsageDetails: {
        type: Object
    },
    messageDateTime: {
        type: Date
    },
    messageStatus: {
        type: String
    },
    amountCharges: {
        type: Boolean,
        default: false
    },
    sentDateTime: {
        type: Date,
        default: null
    },
    deliveredDateTime: {
        type: Date,
        default: null
    },
    readDateTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})




module.exports = mongoose.model('messageHistory', messageHistorySchema)