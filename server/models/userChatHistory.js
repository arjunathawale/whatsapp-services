const mongoose = require("mongoose");

const userChatHistory = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userMobileNo: {
        type: String
    },
    sender: {
        type: String
    },
    messageContent: {
        type: String
    },
    messageDatetime: {
        type: Date
    },
    mainRedirectId: {
        type: String
    },
    redirectId: {
        type: String
    },
    userInputSaveIn: {
        type: String
    },
    validationType: {
        type: String
    },
    prevRedirectId: {
        type: String
    },
}, { timestamps: true });

module.exports = mongoose.model("UserChatHistory", userChatHistory);
