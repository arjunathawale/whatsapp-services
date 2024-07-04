const mongoose = require('mongoose');
const mm = require("../services/global")
const clientPlanUsageSchema = new mongoose.Schema({
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
    planMappingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlanMapping',
        required: [true, 'planMappingId is required']
    },
    planType: {
        type: String,
        required: [true, 'planType is required']
    },
    utilityRateUsages: {
        type: Number
    },
    marketingRateUsages: {
        type: Number
    },
    authRateUsages: {
        type: Number
    },
    serviceRateUsages: {
        type: Number
    },
    utilityBalanceUsages: {
        type: Number
    },
    marketingBalanceUsages: {
        type: Number
    },
    authBalanceUsages: {
        type: Number
    },
    serviceBalanceUsages: {
        type: Number
    },
    createdAt: {
        type: String,
        default: mm.getCurrentDate()
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model('clientPlanUsage', clientPlanUsageSchema)