const mongoose = require('mongoose');

const manageFilesSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "client"
    },
    fileOriginalName: {
        type: String
    },
    fileNewName: {
        type: String
    },
    fileType: {
        type: String
    },
    fileSize: {
        type: Number
    }
}, { timestamps: true })

module.exports = mongoose.model('ManageFiles', manageFilesSchema)