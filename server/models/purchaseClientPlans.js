const mongoose = require('mongoose');

const purchaseClientPlanSchema = new mongoose.Schema({
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'planId is required']
    },
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'wpClientId is required'],
    },
    startDatetime: {
        type: Date,
        default: Date.now
    },
    expireDatetime: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

module.exports = mongoose.model('PurchasedClientPlan', purchaseClientPlanSchema)