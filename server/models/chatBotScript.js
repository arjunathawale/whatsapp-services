const mongoose = require("mongoose");

const chatBotScript = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'botId is required']
    },
    variableName: {
        type: String
    },
    messageType: {
        type: String
    },
    messageSubType: {
        type: String
    },
    messageDraft: {
        type: String,
    },
    redirectId: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId('000000000000000000000000')
    },
    waitTime: {
        type: Number
    },
    validationType: {
        type: String
    },
    mediaUrl: {
        type: String
    },
    buttonOrListData: {
        type: Array
    },
    listButtonName:{
        type: String,
        default: ""
    },
    apiUrl: {
        type: String
    },
    method: {
        type: String
    },
    headerParams: {
        type: Object
    },
    bodyParams: {
        type: Object
    },
    prevRedirectId: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId('000000000000000000000000')
    },
    sampleDataKey: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model("ChatBotScript", chatBotScript);
