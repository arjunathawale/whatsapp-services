
const MessageHistory = require('../models/messageHistory');
const jwt = require('jsonwebtoken');
const mm = require("../services/global");
const { default: mongoose } = require('mongoose');

exports.get = async (req, res) => {
    const { isAdmin, mobileNumber, templateName, wpClientId, messageStatus, templateId, wpMessageId, sender, messageType, planId, botId, sort, select, id } = req.body
    const filterObject = {}
    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId)
    if (templateId) filterObject.templateId = new mongoose.Types.ObjectId(templateId)
    if (planId) filterObject.planId = new mongoose.Types.ObjectId(planId)
    if (botId) filterObject.botId = new mongoose.Types.ObjectId(botId)
    if (isAdmin) filterObject.isAdmin = isAdmin
    if (id) filterObject._id = id



    let orConditions = [];
    if (sender) orConditions.push({ sender: { $regex: sender, $options: 'i' } });
    if (messageType) orConditions.push({ messageType: { $regex: messageType, $options: 'i' } });
    if (mobileNumber) orConditions.push({ mobileNumber: { $regex: mobileNumber, $options: 'i' } });
    if (messageStatus) orConditions.push({ messageStatus: { $regex: messageStatus, $options: 'i' } });
    if (wpMessageId) orConditions.push({ wpMessageId: { $regex: wpMessageId, $options: 'i' } });
    if (templateName) orConditions.push({ templateName: { $regex: templateName, $options: 'i' } });
    if (orConditions.length > 0) {
        filterObject.$or = orConditions;
    }

    // if (templateName) {
    //     filterObject['template.templateName'] = { $regex: templateName, $options: 'i' }; // Case-insensitive search
    // }

    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 10

    try {
        const getMessageHistoryCount = await MessageHistory.countDocuments(filterObject)

        const getMessageHistory = await MessageHistory.find(filterObject)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        res.status(200).send({ status: true, message: "success", count: getMessageHistoryCount, data: getMessageHistory });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {
    const MessageHistory = new MessageHistory({
        name: req.body.name,
        emailId: req.body.emailId,
        mobileNo: req.body.mobileNo,
        password: req.body.password
    });

    try {
        const savedMessageHistory = await MessageHistory.save();
        if (!savedMessageHistory) {
            res.status(400).send({ status: false, message: "Failed to Create" });
        } else {
            res.status(200).send({ insertId: savedMessageHistory._id, status: true, message: "MessageHistory created", data: savedMessageHistory });
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
    const id = req.query.id
    try {
        if (id == null || id == "" || id == undefined) {
            res.status(400).send({ status: false, message: "Please enter MessageHistory id to update" });
        } else {
            const MessageHistory = await MessageHistory.findOne({ _id: id, isActive: true });
            if (!MessageHistory) {
                res.status(404).send({ status: false, message: "MessageHistory Not Found" });
            } else {
                const updatedMessageHistory = await MessageHistory.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updatedMessageHistory) {
                    res.status(400).send({ status: false, message: "Failed to update" });
                } else {
                    res.status(200).send({ status: true, message: "MessageHistory updated", data: updatedMessageHistory });
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
    const id = req.query.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter MessageHistory id to update" });
        } else {
            const MessageHistory = await MessageHistory.findOne({ _id: id, isActive: true });
            if (!MessageHistory) {
                res.status(400).send({ status: false, message: "MessageHistory Not Found" });
            } else {
                const deletedMessageHistory = await MessageHistory.findByIdAndDelete(id)
                if (!deletedMessageHistory) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "MessageHistory Deleted", data: deletedMessageHistory });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", data: err });
    }

}
