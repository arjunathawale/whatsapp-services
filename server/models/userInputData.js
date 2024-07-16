const mongoose = require('mongoose');

const userInputDataSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bots'
    },
    mobileNo: {
        type: String
    },
    variableName: {
        type: String
    },
    selectedValue: {
        type: String
    },
    timeStamp: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true })

module.exports = mongoose.model('UserInputData', userInputDataSchema)