const mongoose = require('mongoose');

const WebHookResponse = new mongoose.Schema({
    statusType: {
        type: String,
    },
    wpMessageId: {
        type: String,
    },
    messageStatus: {
        type: String,
    },
    specifiedRes: {
        type: Object,
    },
    allRes: {
        type: Object,
    },
    isProcessed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('WebHookResponse', WebHookResponse)