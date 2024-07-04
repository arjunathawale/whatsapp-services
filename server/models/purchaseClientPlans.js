const mongoose = require('mongoose');

const purchaseClientPlanSchema = new mongoose.Schema({
    planId: {
        type: new mongoose.Schema.Types.ObjectId,
        required: [true, 'planId is required']
    },
    wpClientId: {
        type: new mongoose.Schema.Types.ObjectId,
        required: [true, 'wpClientId is required'],
        default: 'MONTHLY'
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