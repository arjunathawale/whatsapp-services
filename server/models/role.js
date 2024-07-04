const mongoose = require('mongoose');
const mm = require("../services/global")

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: 128
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: String,
        default: mm.getCurrentDate()
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model('Role', roleSchema)