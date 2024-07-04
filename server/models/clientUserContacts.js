const moongoose = require('mongoose');
const mm = require("../services/global")

const clientUserContactSchema = new moongoose.Schema({
    wpClientId: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    mobileNo: {
        type: String,
        required: [true, 'mobileNo is required'],
        maxlength: 12
    },
    name: {
        type: String,
        required: [true, 'name is required'],
        maxlength: 64
    },
    // createdAt: {
    //     type: String,
    //     default: mm.getCurrentDate()
    // },
    // updatedAt: {
    //     type: String,
    // },
}, { timestamps: true })

module.exports = moongoose.model('ClientUserContact', clientUserContactSchema)