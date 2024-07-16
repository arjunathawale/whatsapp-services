const mongoose = require("mongoose");

const bot = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "client"
    },
    botMobileNo: {
        type: String,
        required: true
    },
    botName: {
        type: String
    },
    triggerMessage: {
        type: Array
    },
    status:{
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Bots", bot)