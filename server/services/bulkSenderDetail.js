
const bulkSenderDetails = require('../models/bulkSenderDetails');
const mm = require("./global")
const moogoose = require('mongoose');


exports.get = async (req, res) => {
    const { wpClientId, bulkMasterId, isScheduled, sort, select, id } = req.body
    const filterObject = {}


    if (wpClientId) filterObject.wpClientId = new moogoose.Types.ObjectId(wpClientId)
    if (bulkMasterId) filterObject.bulkMasterId = new moogoose.Types.ObjectId(bulkMasterId)
    if (isScheduled) filterObject.isScheduled = isScheduled
    if (id) filterObject._id = id

    let dataUrl = bulkSenderDetails.find(filterObject)

    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 10

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }
    try {
        const getbulkSenderDetailsCount = await bulkSenderDetails.countDocuments(filterObject)
        const getbulkSenderDetails = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getbulkSenderDetailsCount, data: getbulkSenderDetails });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {


    const bulkSenderDetails = new bulkSenderDetails({
        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
        templateId: new moogoose.Types.ObjectId(req.body.templateId),
        campaignName: req.body.campaignName,
        isScheduled: req.body.isScheduled,
        scheduledDateTime: req.body.scheduledDateTime,
    })
    let bulkData = req.body.bulkData

    try {

        const savedbulkSenderDetails = await bulkSenderDetails.save();
        if (!savedbulkSenderDetails) {
            res.status(400).send({ status: false, message: "Failed to save" });
        } else {
            if (bulkData.length > 0) {
                let bulkInsert = []
                for (let i = 0; i < bulkData.length; i++) {
                    let object = {
                        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
                        bulkMasterId: new moogoose.Types.ObjectId(savedbulkSenderDetails._id),
                        mobileNumber: bulkData[i].MOBILE_NO,
                        templateComponent: [
                            bulkData[i].HEADER_PARAMS,
                            bulkData[i].BODY_PARAMS,
                            bulkData[i].BUTTON_PARAMS
                        ].filter(param => Object.keys(param).length > 0),
                        status: "P"
                    }
                    bulkInsert.push(object)
                }
                const savedBulkDetailsData = await bulkSenderDetailsDetails.insertMany(bulkInsert);
                res.status(200).send({ insertId: savedbulkSenderDetails._id, status: true, message: "Message Sending Processing", data: savedbulkSenderDetails });
            } else {
                res.status(200).send({ insertId: savedclientConfig._id, status: true, message: "Message Sending Contact Not Found", data: savedbulkSenderDetails });
            }
        }
    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({ status: false, message: "Failed to save info", error: err });
        }
    }
}

exports.update = async (req, res) => {
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const findClientConfig = await bulkSenderDetails.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "bulkSenderDetails details not found" });
            } else {
                const updateClientConfigData = await bulkSenderDetails.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "bulkSenderDetails updated", data: updateClientConfigData });
                }
            }
        }
    } catch (err) {
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({ status: false, message: "Failed to update", error: err.errors });
        }
    }
}

exports.delete = async (req, res) => {
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please provide id" });
        } else {
            const findClientConfig = await bulkSenderDetails.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "bulkSenderDetails details not found" });
            } else {
                const deletedclientConfig = await bulkSenderDetails.findByIdAndDelete(id);
                if (!deletedclientConfig) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "bulkSenderDetails Deleted", data: deletedclientConfig });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}
