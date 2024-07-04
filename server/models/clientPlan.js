const mongoose = require('mongoose');
const mm = require("../services/global")
const clientPlanSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlan',
        required: [true, 'planId is required']
    },
    startTime: {
        type: String,
        required: [true, 'startTime is required']
    },
    expireTime: {
        type: String,
        required: [true, 'expireTime is required']
    },
    status: {
        type: Boolean,
        required: [true, 'status is required'],
        default: false
    },
    createdAt: {
        type: String,
        default: mm.getCurrentDate()
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model('clientPlan', clientPlanSchema)