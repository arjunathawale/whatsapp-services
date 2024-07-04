const mongoose = require('mongoose');
const mm = require("../services/global")
const clientPlanRechargeSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    planMappingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlanMapping',
        required: [true, 'planMappingId is required']
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlan',
        required: [true, 'planId is required']
    },
    rechargeAmount: {
        type: Number,
        required: [true, 'rechargeAmount is required']
    },
    rechargeDate: {
        type: Date,
        required: [true, 'rechargeDate is required']
    },
    planType: {
        type: String,
        required: [true, 'planType is required']
    },
    utilityRateRecharge: {
        type: Number
    },
    marketingRateRecharge: {
        type: Number
    },
    authRateRecharge: {
        type: Number
    },
    serviceRateRecharge: {
        type: Number
    },
    utilityBalanceRecharge: {
        type: Number
    },
    marketingBalanceRecharge: {
        type: Number
    },
    authBalanceRecharge: {
        type: Number
    },
    serviceBalanceRecharge: {
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

module.exports = mongoose.model('clientPlanRecharge', clientPlanRechargeSchema)
