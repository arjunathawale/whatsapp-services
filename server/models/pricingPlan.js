const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: [true, 'Plan Name is required']
    },
    planPeriod: {
        type: String,
        required: [true, 'Plan Name is required'],
        default: 'MONTHLY'
    },
    description: {
        type: String,
        required: [true, 'description is required']
    },
    bulkLimit: {
        type: Number,
        default: 0
    },
    messageSendAPI: {
        type: Boolean,
        default: false
    },
    manageTemplate: {
        type: Boolean,
        default: false
    },
    chatBotFeature: {
        type: Number
    },
    planExpireIn: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: false
    },
    planPrice:{
        type: Number
    }
    
}, { timestamps: true })

module.exports = mongoose.model('PricingPlan', pricingPlanSchema)