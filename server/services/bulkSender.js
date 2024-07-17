
const axios = require('axios');
const request = require('request');
const bulkSender = require('../models/bulkSender');
const bulkSenderDetails = require('../models/bulkSenderDetails');
const clientWPConfig = require('../models/clientWPConfig');
const mm = require("./global")
const moogoose = require('mongoose');


exports.get11 = async (req, res) => {
    const { wpClientId, templateId, campaignName, isScheduled, sort, select, id } = req.body
    const filterObject = {}


    if (campaignName) filterObject.campaignName = { $regex: campaignName, $options: 'i' }
    if (wpClientId) filterObject.wpClientId = wpClientId
    if (templateId) filterObject.templateId = templateId
    if (isScheduled) filterObject.isScheduled = isScheduled
    if (id) filterObject._id = id

    let dataUrl = bulkSender.find(filterObject)

    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 2

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }
    try {
        const getbulkSenderCount = await bulkSender.countDocuments(filterObject)
        const getbulkSender = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getbulkSenderCount, data: getbulkSender });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create1234567 = async (req, res) => {


    const bulksender = new bulkSender({
        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
        templateId: new moogoose.Types.ObjectId(req.body.templateId),
        campaignName: req.body.campaignName,
        isScheduled: req.body.isScheduled,
        scheduledDateTime: req.body.scheduledDateTime,
    })
    let bulkData = req.body.bulkData

    try {

        const savedBulkSender = await bulksender.save();
        if (!savedBulkSender) {
            res.status(400).send({ status: false, message: "Failed to save" });
        } else {
            if (bulkData.length > 0) {
                let bulkInsert = []
                for (let i = 0; i < bulkData.length; i++) {
                    let object = {
                        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
                        bulkMasterId: new moogoose.Types.ObjectId(savedBulkSender._id),
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
                const savedBulkDetailsData = await bulkSenderDetails.insertMany(bulkInsert);
                res.status(200).send({ insertId: savedBulkSender._id, status: true, message: "Message Sending Processing", data: savedBulkSender });
            } else {
                res.status(200).send({ insertId: savedclientConfig._id, status: true, message: "Message Sending Contact Not Found", data: savedBulkSender });
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
            const findClientConfig = await bulkSender.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "bulkSender details not found" });
            } else {
                const updateClientConfigData = await bulkSender.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "bulkSender updated", data: updateClientConfigData });
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
            const findClientConfig = await bulkSender.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "bulkSender details not found" });
            } else {
                const deletedclientConfig = await bulkSender.findByIdAndDelete(id);
                if (!deletedclientConfig) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "bulkSender Deleted", data: deletedclientConfig });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}


const mongoose = require('mongoose');
const template = require('../models/template');
const { addToQueue } = require('./Queues/BulkProducer');

exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const bulksender = new bulkSender({
            wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
            templateId: new mongoose.Types.ObjectId(req.body.templateId),
            templateName: req.body.templateName,
            templateLanguages: req.body.templateLanguages,
            templateCategory: req.body.templateCategory,
            campaignName: req.body.campaignName,
            isScheduled: req.body.isScheduled,
            scheduledDateTime: req.body.scheduledDateTime,
        });

        let bulkData = req.body.bulkData;
        const savedBulkSender = await bulksender.save({ session });
        if (!savedBulkSender) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ status: false, message: "Failed to save" });
        }

        if (bulkData.length > 0) {
            let bulkInsert = bulkData.map(data => ({
                wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
                bulkMasterId: new mongoose.Types.ObjectId(savedBulkSender._id),
                mobileNumber: data.MOBILE_NO,
                templateComponent: [
                    data.HEADER_PARAMS,
                    data.BODY_PARAMS,
                    data.BUTTON_PARAMS
                ].filter(param => Object.keys(param).length > 0),
                status: "",
                messageId: null,
                wpMessageId: "",

            }));


            const clientConfig = await clientWPConfig.find({ wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId) })
            if (!clientConfig) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ status: false, message: "Client Not Found" });
            }



            axios({
                method: "GET",
                url: `https://graph.facebook.com/${clientConfig[0].wpApiVersion}/${clientConfig[0].wpBussinessAccId}/message_templates?status=APPROVED&name=${req.body.templateName}`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + clientConfig[0].wpPermanentToken,
                },
            }).then(async (success) => {
                let templateData = success.data.data
                if (templateData.length > 0) {
                    let AddBulkQueue = []
                    bulkInsert.forEach(element => {
                        let allTemplateData = {}
                        let messageHistory = {
                            wpClientId: new mongoose.Types.ObjectId(req?.body?.wpClientId),
                            templateId: new mongoose.Types.ObjectId(req.body.templateId),
                            planId: new mongoose.Types.ObjectId(req?.body?.planId),
                            wpMessageId: null,
                            sender: "SYSTEM",
                            messageType: templateData[0].category,
                            messsageDetails: "",
                            messageDateTime: null

                        }
                        if (element.templateComponent.length > 0) {
                            let aa = templateData[0].components[0].format == "LOCATION" ? {
                                type: "location",
                                "location": element.templateComponent[0].location
                            } : {
                                type: "template",
                                template: {
                                    name: req.body.templateName,
                                    language: {
                                        "code": req.body.templateLanguages
                                    },
                                    components: element.templateComponent
                                }
                            }

                            allTemplateData = {
                                messaging_product: "whatsapp",
                                recipient_type: "individual",
                                to: element.mobileNumber,
                                ...aa
                            }
                        } else {
                            allTemplateData = {
                                messaging_product: "whatsapp",
                                recipient_type: "individual",
                                to: element.mobileNumber,
                                type: "template",
                                template: {
                                    name: req.body.templateName,
                                    language: {
                                        "code": req.body.templateLanguages
                                    }
                                }
                            }
                        }
                        const dataObject = {
                            messageDetails: allTemplateData,
                            clientConfigDetails: {
                                wpApiVersion: clientConfig[0].wpApiVersion,
                                wpPhoneNoId: clientConfig[0].wpPhoneNoId,
                                wpPermanentToken: clientConfig[0].wpPermanentToken,
                            },
                            BulkDetailsInsert: element,
                            messageHistory: messageHistory
                        }
                        AddBulkQueue.push({
                            name: "bulk-sender" + "-" + element.mobileNumber,
                            data: dataObject
                        })

                    });

                    addToQueue("bulkSender", AddBulkQueue)
                    await session.commitTransaction();
                    session.endSession();
                    return res.status(200).send({ insertId: savedBulkSender._id, status: true, message: "Message Sending Processing", data: savedBulkSender });
                } else {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).send({ status: false, message: "Template Not Found" });
                }
            }, async (reason) => {
                console.log("error :- ", reason);
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ status: false, message: "Failed to get Meta Template Details" });
            })


        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).send({ insertId: savedBulkSender._id, status: true, message: "Message Sending Contact Not Found", data: savedBulkSender });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        if (err.code == 11000) {
            return res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            return res.status(400).send({ status: false, message: "Failed to save info", error: err });
        }
    }
};



exports.get = async (req, res) => {
    // Extract parameters from the request body
    const { wpClientId, templateId, campaignName, isScheduled, sort, fromDate, toDate, id } = req.body;
    const filterObject = {};

    // Build the filter object based on provided parameters
    if (campaignName) filterObject.campaignName = { $regex: campaignName, $options: 'i' };
    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId);
    if (templateId) filterObject.templateId = new mongoose.Types.ObjectId(templateId);
    if (isScheduled) filterObject.isScheduled = isScheduled;
    if (id) filterObject._id = id;
    if (fromDate && toDate) {
        filterObject.createdAt = {
            $gte: fromDate,
            $lte: toDate
        }
    }



    let dataUrl = bulkSender.aggregate([
        { $match: filterObject },
        {
            $lookup: {
                from: "bulksenderdetails",
                localField: "_id",
                foreignField: "bulkMasterId",
                as: "details"
            }
        },
        {
            $project: {
                createdAt: 1,
                currentStatus: 1,
                templateName: 1,
                __v: 1,
                scheduledDateTime: 1,
                isScheduled: 1,
                _id: 1,
                wpClientId: 1,
                templateId: 1,
                campaignName: 1,
                templateCategory: 1,
                templateLanguages: 1,
                updatedAt: 1,
                sentCount: {
                    $size: {
                        $filter: {
                            input: "$details",
                            as: "detail",
                            cond: { $eq: ["$$detail.messageStatus", "sent"] }
                        }
                    }
                },
                deliveredCount: {
                    $size: {
                        $filter: {
                            input: "$details",
                            as: "detail",
                            cond: { $eq: ["$$detail.messageStatus", "delivered"] }
                        }
                    }
                },
                readCount: {
                    $size: {
                        $filter: {
                            input: "$details",
                            as: "detail",
                            cond: { $eq: ["$$detail.messageStatus", "read"] }
                        }
                    }
                },
                failedCount: {
                    $size: {
                        $filter: {
                            input: "$details",
                            as: "detail",
                            cond: { $eq: ["$$detail.messageStatus", "failed"] }
                        }
                    }
                },
                pendingCount: {
                    $size: {
                        $filter: {
                            input: "$details",
                            as: "detail",
                            cond: { $eq: ["$$detail.messageStatus", "pending"] }
                        }
                    }
                }
            }
        }
    ]);

    if (sort) {
        const sortFix = sort.replace(/,/g, " ");
        dataUrl = dataUrl.sort(sortFix);
    }

    const page = Number(req.body.page) || 1;
    const limit = Number(req.body.limit) || 10;
    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit);
    }

    try {
        const getbulkSenderCount = await bulkSender.countDocuments(filterObject);
        const getbulkSender = await dataUrl;
        res.status(200).send({ status: true, message: "success", count: getbulkSenderCount, data: getbulkSender });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
};
