const moongoose = require('mongoose');
const mm = require("../services/global")

const templateSchema = new moongoose.Schema({
    wpClientId: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required']
    },
    templateName: {
        type: String,
        required: [true, 'templateName is required'],
        maxlength: 512
    },
    templateCategory: {
        type: String,
        required: [true, 'templateCategory is required'],
        maxlength: 16
    },
    languages: {
        type: String,
        required: [true, 'languages is required'],
    },
    headerType: {
        type: String,
        // required: [true, 'headerType is required'],
    },
    headerValues: {
        type: Object,
        default: {}
    },
    bodyValues: {
        type: Object,
        required: [true, 'bodyValues is required'],
        default: {}

    },
    footerValues: {
        type: Object,
        default: {}
    },
    buttonValues: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
    },
    fbTemplateStatus: {
        type: String,
        default: null
    },
    fbTemplateId: {
        type: String,
        default: null
    },
    mediaUrl:{
        type: String,
        maxlength: 512
    },
    mediaId:{
        type: String,
    },
    submittedAt: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true })

module.exports = moongoose.model('Template', templateSchema)