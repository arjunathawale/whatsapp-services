const mongoose = require('mongoose');
const mm = require("../services/global")
const clientWPConfigSchema = new mongoose.Schema({
    wpClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'wpClientId is required'],
    },
    wpRegisteredMobileNo: {
        type: String,
        required: [true, 'wpRegisteredMobileNo is required'],
        maxlength: 12
    },
    wpPhoneNoId: {
        type: String,
        required: [true, 'wpPhoneNoId is required'],
        unique: true,
        maxlength: 64
    },
    wpBussinessAccId: {
        type: String,
        required: [true, 'wpBussinessAccId is required'],

    },
    wpPermanentToken: {
        type: String,
        required: [true, 'wpPermanentToken is required'],
        maxlength: 512
    },
    wpApiVersion: {
        type: String,
        required: [true, 'wpApiVersion is required'],
        maxlength: 8
    },
    wpAppId: {
        type: String,
        required: [true, 'wpAppId is required'],
        maxlength: 64
    },
    createdAt: {
        type: String,
        default: mm.getCurrentDate()
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model('clientWPConfig', clientWPConfigSchema);


// [
//     {
//       $lookup: {
//         from: "clients",
//         localField: "wpClientId",
//         foreignField: "_id",
//         as: "clinetInfo"
//       }
//     },
//     {
//       $addFields: {
//         clinetInfo: { $arrayElemAt: ["$clinetInfo", 0] }
//       }
//     }
//   ]


// [
//     {
//       $lookup: {
//         from: "clientwpconfigs",
//         localField: "_id",
//         foreignField: "wpClientId",
//         as: "clinetConfig"
//       }
//     },
//     {
//       $addFields: {
//         clinetConfig: { $arrayElemAt: ["$clinetConfig", 0] }
//       }
//     }
//   ]